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

function main(params, callback){
    let gpsDirection = parseInt('0x' + params.data.substring(20, 22));
    let gpsLatitude = parseInt('0x' + params.data.substring(4, 12))/ Math.pow(10, 6);
    let gpsLongitude = parseInt('0x' + params.data.substring(12, 20))/ Math.pow(10, 6);
  
    let latitude = directionsLongitudeLegend[gpsDirection] * (Math.floor(gpsLongitude) + 100.0*(gpsLongitude - Math.floor(gpsLongitude)) / 60.0);
    let longitude = directionsLatitudeLegend[gpsDirection] * (Math.floor(gpsLatitude)+ 100.0*(gpsLatitude - Math.floor(gpsLatitude)) / 60.0);
  
    let batteryVoltage = ((3.4/255.0) * parseInt('0x' + params.data.substring(0,2))).toFixed(2);
    
    let maximumBatteryLevel = 1.6;
    let minimumBatteryLevel = 0.7; // In volts
    let percentage = batteryVoltage > maximumBatteryLevel ? 100 : (((batteryVoltage-minimumBatteryLevel)/(maximumBatteryLevel-minimumBatteryLevel))*100).toFixed(0)
    percentage = percentage < 0 ? 0 : percentage;
  
    let result = [
      {
        "key": "snr",
        "value": params.custom.snr
      },
      {
        "key": "time",
        "value": params.custom.time
      },
      {
        "key": "duplicate",
        "value": params.custom.duplicate
      },
      {
        "key": "station",
        "value": params.custom.station
      },
      {
        "key": "avgSnr",
        "value": params.custom.avgSnr
      },
      {
        "key": "rssi",
        "value": params.custom.rssi
      },
      {
        "key": "seqNumber",
        "value": params.custom.seqNumber
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
        "key": "moving",
        "value": parseInt('0x' + params.data.substring(22, 24)) >> 4
      },
      {
        "key": "geolocation",
        "value": "gps",
        "geo": {
          "lat": latitude,
          "long": longitude
        }
      },
      {
        "key": "$geo",
        "value": [longitude, latitude]
      }
      ];

    return callback(null, result);
}
