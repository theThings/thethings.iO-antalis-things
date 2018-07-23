var GOOGLE_API_KEY = 'YOUR GOOGLE API KEY';
// TODO: introduce your own Google API Key to geolocate your assets


let directionsLongitudeLegend = {
    0: -1,
    1: 1,
    16: -1,
    17: 1
};

let directionsLatitudeLegend = {
    0: 1,
    1: 1,
    16: -1,
    17: -1
};


var maxBatteryLevel = 1.6;
var minimumBatteryLevel = 1.09;
let THRESHOLD_METERS = 2000;
let THRESHOLD_METERS_2 = 200; //meters


// BIG ENDIAN TO LITTLE ENDIAN
function rev(v) {
    let s = v.replace(/^(.(..)*)$/, '0$1'); // add a leading zero if needed
    let a = s.match(/../g); // split number in groups of two
    a.reverse(); // reverse the groups
    return a.join(''); // join the groups back together
}

// STRING TO MAC ADDRESS
function stringToMac(string) {
    return rev(string).match(/.{1,2}/g).reverse().join(':');
}

function calculateAddress(thingToken, latitude, longitude, result, callback) {
    if (GOOGLE_API_KEY == 'YOUR GOOGLE API KEY') {
        result = result.push({
            'key': 'GMapsErrors',
            'value': "Google Api Key not configured"
        });
        return callback(null, result);
    } else {
        var location = latitude + ',' + longitude;
        httpRequest({
            host: 'maps.googleapis.com',
            path: '/maps/api/geocode/json?latlng=' + location + '&key=' + GOOGLE_API_KEY,
            method: 'GET',
            secure: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, res) {
            res = JSON.parse(res.result);
            if (err)
            {
                result.push({
                    'key': 'GMapsErrors',
                    'value': "Google Api Message: err" 
                });

                return callback(null, result);
            } 
            if (res.error) {
                result.push({
                    'key': 'GMapsErrors',
                    'value': "Google Api Message: " + res.error.message
                });

                return callback(null, result);
            }
            result.push({
                    'key': 'address',
                    'value': res.results[0].formatted_address
            })
            return callback(null, result);
        });
    }
}

function getTiempoDesconectado(params, callback) {
    return new Promise(resolve => {
        thethingsAPI.thingRead(params.thingToken, 'sgfx-payload', {
            limit: 1
        }, function(err, result) {
            let resultPayload = [];
            if (err || result.length === 0) {
            	return resolve([]);
            } else {
                let now = moment();
                let before = moment(result[0].datetime);
                resultPayload.push({
                    key: "tiempoDesconectado",
                    value: now.diff(before, 'days')
                });
            }
            return resolve(resultPayload);
        });
    });
}



function tiempoParado(params, resultPayload, callback) {
    thethingsAPI.thingRead(params.thingToken, 'tiempoParado', {
        limit: 1
    }, (err, result) => {
        var filtered = resultPayload.filter(resource => resource.key === 'geolocation');
        if (filtered.length < 1) return callback(null, resultPayload);

        let deviceGeo = filtered[0].geo;

        if (!result || result.length < 1) {
            resultPayload.push({
                key: 'tiempoParado',
                value: 0,
                geo: {
                    lat: 0.0,
                    long: 0.0
                }
            });
        } else {
            if (!result[0].geo) 
            {
                result[0].geo = {
                    lat: 0.0,
                    long: 0.0
                };
            }
            let distanciaAnteriorPunto = geolib.getDistance({
                latitude: result[0].geo.lat,
                longitude: result[0].geo.long
            }, {
                latitude: deviceGeo.lat,
                longitude: deviceGeo.long
            });
            let movimiento = distanciaAnteriorPunto <= THRESHOLD_METERS ? 0 : 1;
            let tiempoParado = movimiento ? 0 : result[0].value;
            let diasParado = 0;
            if (!movimiento) {
                tiempoParado += (moment().diff(moment(result[0].datetime), 'minutes'));
                diasParado += (tiempoParado / 1440.0).toFixed(0);
            }
            resultPayload.push({
                key: 'tiempoParado',
                value: tiempoParado,
                geo: deviceGeo
            });
            resultPayload.push({
                key: 'diasParado',
                value: diasParado,
                geo: deviceGeo
            });
        }

        return callback(null, resultPayload);
    });
}


function WiFiPayload(params, callback) {

    let mac, mac2;

    if (params.data.length !== 24) return callback('No correct payload');

    getTiempoDesconectado(params, callback)
        .then(result => {
            let checksum = parseInt('0x' + params.data.substring(0, 2));
            let calculatedChecksum = 0;

            for (let i = 1; i < 12; i++) {
                calculatedChecksum ^= parseInt('0x' + params.data.substring(i * 2, 2 * i + 2));
            }

            if (checksum === calculatedChecksum && (parseInt('0x' + params.data.substring(12, 24)) === 0)) {
/*
Byte 1: xor con el resto de los mensajes
Byte 2: Estado de batería. (Ecuación es voltaje de la batería = (byte2r / 255) * 3.4)
Byte 3: temperatura. Ecuación tempfloat = -40.0 + (byte3 / 2.0);
Byte 4: alerta térmica ( 1 alerta térmica, 0 no alerta térmica )
Byte 5: movimiento ( 1 en movimiento, 2 no en movimiento)
Byte 6: Humedad actual, ecuación de la humedad humedad en float = ( Byte6/2.0)
Byte 7: alerta de impacto ( 1 impacto recibido, 0 no impacto recibido ).
*/
                let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4 / 255.0)).toFixed(2);
                let percentage = batteryVoltage > maxBatteryLevel ? 100 : (((batteryVoltage - minimumBatteryLevel) / (maxBatteryLevel - minimumBatteryLevel)) * 100).toFixed(0)
                percentage = percentage < 0 ? 0 : percentage; //min(percentage, getLastBatteryPercentage(params));
                result.push({
                    "key": "temperature",
                    "value": (-40.0 + parseInt('0x' + params.data.substring(4, 6)) / 2.0).toFixed(2)
                }, {
                    "key": "batteryLevel",
                    "value": batteryVoltage
                }, {
                    "key": "temperatureAlert",
                    "value": parseInt('0x' + params.data.substring(6, 8))
                }, {
                    "key": "humidity",
                    "value": (parseInt('0x' + params.data.substring(10, 12)) / 2.0).toFixed(2)
                  }, {
                    "key": "humidityAlert",
                    "value": parseInt('0x' + params.data.substring(12, 14))
                  }, {
                    "key": "movementStatus",
                    "value": parseInt('0x' + params.data.substring(8, 10))
                  }, {
                    "key": "impactStatus",
                    "value": parseInt('0x' + params.data.substring(16, 18))
                }, {
                    "key": "snr",
                    "value": params.custom.snr
                }, {
                    "key": "time",
                    "value": params.custom.time
                }, {
                    "key": "duplicate",
                    "value": params.custom.duplicate
                }, {
                    "key": "station",
                    "value": params.custom.station
                }, {
                    "key": "avgSnr",
                    "value": params.custom.avgSnr
                }, {
                    "key": "rssi",
                    "value": params.custom.rssi
                }, {
                    "key": "seqNumber",
                    "value": params.custom.seqNumber
                }, {
                   "key": "lastAccess",
                   "value": new Date().toISOString()
                }, {
                    "key": "batteryPercentage",
                    "value": percentage
                });

                return callback(null, result);
            } 
  			else 
            {
                if (GOOGLE_API_KEY === 'YOUR GOOGLE API KEY') {
                    result.push({
                        'key': 'GMapsErrors',
                        'value': "Google Api Key not configured"
                    });

                    return callback(null, result);
                }
                mac = stringToMac(params.data.substring(0, 12));
                mac2 = stringToMac(params.data.substring(12, 24));

                let body = {
                    'considerIp': 'false',
                    'wifiAccessPoints': [{
                            'macAddress': mac
                        },
                        {
                            'macAddress': mac2
                        }
                    ]
                };
                httpRequest({
                    host: 'www.googleapis.com',
                    path: '/geolocation/v1/geolocate?key=' + GOOGLE_API_KEY,
                    method: 'POST',
                    secure: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, body, function(err, res) {
                    res = JSON.parse(res.result);
                    if (err) return callback(err);
                    if (res.error) {
                        result = result.concat([{
                            'key': 'GMapsErrors',
                            'value': "Google Api Message: " + res.error.message
                        }]);

                        return callback(null, result);
                    }

                    if (res.hasOwnProperty('location')) {
                        result.push({
                            'key': 'combinedLocation',
                            'value': 'googlewifi',
                            'geo': {
                                'lat': res.location.lat,
                                'long': res.location.lng
                            }
                        }, {
                            'key': 'geolocation',
                            'value': 'googlewifi',
                            'geo': {
                                'lat': res.location.lat,
                                'long': res.location.lng
                            }
                        }, {
                            'key': 'googleAccuracy',
                            'value': res.accuracy
                        }, {
                            'key': 'wifis',
                            'value': mac + '-' + mac2,
                            'geo': {
                                'lat': res.location.lat,
                                'long': res.location.lng
                            }
                        }, {
                            'key': '$geo',
                            'value': [res.location.lng, res.location.lat]
                        });

                        if (res.accuracy <= 300) {
                            result = result.concat([{
                                'key': 'highAccuracy',
                                'value': res.accuracy
                            }]);
                        }

                        let payload = {
                            "macs": [mac, mac2],
                            "lat": res.location.lat,
                            "lng": res.location.lng,
                            "accuracy": res.accuracy,
                            "source": "Google Maps Api"
                        };

                        async.waterfall([
                          		async.apply(tiempoParado, params, result),
                                //async.apply(calculateAddress, params.thingToken, res.location.lat, res.location.lng)
                        ], function(err, results) {
                                thethingsAPI.submitGeoMAC(params.thingToken, payload, function() {
                                  callback(null,results);
                                });
                        });

                    } else return callback(null, result);
                });
            };
        })
}


function main(params, callback) 
{
    //WIFI
	WiFiPayload(params, callback);
}


