let GOOGLE_API_KEY = 'YOUR GOOGLE API KEY';

// BIG ENDIAN TO LITTLE ENDIAN
function rev(v) {
    let s = v.replace(/^(.(..)*)$/, '0$1'); // add a leading zero if needed
    let a = s.match(/../g);             // split number in groups of two
    a.reverse();                        // reverse the groups
    let s2 = a.join('');                // join the groups back together
    return s2;
}

// STRING TO FLOAT
function parseF(s) {
    let intData = new Uint32Array(1);
    intData[0] = s;
    let dataAsFloat = new Float32Array(intData.buffer);
    return dataAsFloat[0];
}

// STRING TO MAC ADDRESS
function stringToMac(string) {
    return rev(string).match(/.{1,2}/g).reverse().join(':');
}

function main(params, callback){
    var number = '';
    var mac, mac2;
    var result = [

    ];

    if (params.data.length != 24) return callback();

    var checksum = parseInt('0x' + params.data.substring(0,2));
    var calculatedChecksum = 0;
    for(var i = 1; i < 12; i++) {
        calculatedChecksum ^= parseInt('0x' + params.data.substring(i*2, 2*i+2));
    }

    if (checksum === calculatedChecksum && (parseInt('0x' + params.data.substring(12, 24)) === 0)) {
        
        let minimumBatteryLevel = 0.7; // In volts
        let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4/255.0)).toFixed(2);
        let percentage = batteryVoltage > 1.5 ? 100 : (((batteryVoltage-minimumBatteryLevel)/(1.5-minimumBatteryLevel))*100).toFixed(0)
        percentage = percentage < 0 ? 0 : percentage;
        
        result = [{
                "key": "temperature",
                "value": - 40.0 + parseInt('0x' + params.data.substring(4,6)) / 2.0
            },
            {
                "key": "batteryLevel",
                "value": batteryVoltage
            },
            {
                "key": "batteryPercentage",
                "value": percentage
            },
            {
                "key": "temperatureAlert",
                "value": parseInt('0x' + params.data.substring(6,8))
            },
              {
                key: "snr",
                value: params.custom.snr
              },
              {
                key: "time",
                value: params.custom.time
              },
              {
                key: "duplicate",
                value: params.custom.duplicate
              },
              {
                key: "station",
                value: params.custom.station
              },
              {
                key: "avgSnr",
                value: params.custom.avgSnr
              },
              {
                key: "rssi",
                value: params.custom.rssi
              },
              {
                key: "seqNumber",
                value: params.custom.seqNumber
              },
            {
                "key": "movementStatus",
                "value":parseInt('0x' + params.data.substring(8,10))
            }];

        return callback(null, result);

    } else {
      
      	mac = stringToMac(params.data.substring(0, 12));
        mac2 = stringToMac(params.data.substring(12, 24));

      
        if (GOOGLE_API_KEY == 'YOUR GOOGLE API KEY') {
            result = result.concat([
                {
                    'key': 'GMapsErrors',
                    'value': "Google Api Key not configured"
                },
            	{
                    'key': 'wifis',
                    'value': mac+'-'+mac2+'- no google token',
                    'geo': {
                        'lat': res.location.lat,
                        'long': res.location.lng
                    }
                }
            ]);

            return callback(null, result);
        }

        let body = {
            'considerIp': 'false',
            'wifiAccessPoints': [
                {'macAddress': mac},
                {'macAddress': mac2}]
        };

        httpRequest({
            host: 'www.googleapis.com',
            path: '/geolocation/v1/geolocate?key=' + GOOGLE_API_KEY,
            method: 'POST',
            secure: true,
            headers: {'Content-Type': 'application/json'}
        }, body, function (err, res) {
            res = JSON.parse(res.result);
            if (err) return callback(err);
            if (res.error) {
                result = result.concat([
                    {
                        'key': 'GMapsErrors',
                        'value': "Google Api Message: " + res.error.message
                    }]);

                return callback(null, result);
            }

            result = result.concat([
                {
                    'key': 'geolocation',
                    'value': 'googlewifi',
                    'geo': {
                        'lat': res.location.lat,
                        'long': res.location.lng
                    }
                },
                {
                    'key': 'googleAccuracy',
                    'value': res.accuracy
                },
                {
                    'key': 'wifis',
                    'value': mac+'-'+mac2,
                    'geo': {
                        'lat': res.location.lat,
                        'long': res.location.lng
                    }
                },
                {
                    'key': '$geo',
                    'value': [res.location.lng, res.location.lat]
                }]);
            return callback(null, result);
        });
    }
}
