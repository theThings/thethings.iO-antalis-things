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
    let longitude = directionsLongitudeLegend[gpsDirection] * (Math.floor(gpsLongitude) + 100.0*(gpsLongitude - Math.floor(gpsLongitude)) / 60.0);
    let latitude = directionsLatitudeLegend[gpsDirection] * (Math.floor(gpsLatitude)+ 100.0*(gpsLatitude - Math.floor(gpsLatitude)) / 60.0);

    let result = [
      {
        "key": "batteryLevel",
        "value": (0.01289 * parseInt('0x' + params.data.substring(0,2))).toFixed(2)
      },
      {
        "key": "temperature",
        "value": (- 40.0 + parseInt('0x' + params.data.substring(2,4)) / 2.0).toFixed(2)
      },
      {
        "key": "moving",
        "value": parseInt('0x' + params.data.substring(22, 24)) >> 4
      },
      {
        "key": "GPS",
        "value": 1,
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
