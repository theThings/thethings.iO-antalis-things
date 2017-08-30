function main(params, callback){
  let checksum = parseInt('0x' + params.data.substring(0,2));
  let calculatedChecksum = 0;
  let minimumBatteryLevel = 0.7; // In volts
  
  for(let i = 1; i < 12; i++) {
    calculatedChecksum ^= parseInt('0x', params.data.substring(i * 2, 2 * i + 2));
  }

  if (checksum === calculatedChecksum) {
    let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4/255.0)).toFixed(2);
    let percentage = batteryVoltage > 1.5 ? 100 : (((batteryVoltage-minimumBatteryLevel)/(1.5-minimumBatteryLevel))*100).toFixed(0)
    percentage = percentage < 0 ? 0 : percentage;
    
    result = [{
      'key': 'pulsedState',
      'value': parseInt('0x' + params.data.substring(4, 6))
    },
    {
        'key': 'batteryVoltage',
        'value': (3.4 * parseInt('0x' + params.data.substring(2, 4)) / 255.0).toFixed(2)
    },
    {
        key: 'batteryPercentage',
        value: percentage
      }
  ];

    return callback(null, result);
  }
  else return callback('Invalid checksum');
}
