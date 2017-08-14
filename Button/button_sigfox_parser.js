function main(params, callback){
  let checksum = parseInt('0x' + params.data.substring(0,2));
  let calculatedChecksum = 0;

  for(let i = 1; i < 12; i++) {
    calculatedChecksum ^= parseInt('0x', params.data.substring(i * 2, 2 * i + 2));
  }

  if (checksum === calculatedChecksum) {
    result = [{
      'key': 'pulsedState',
      'value': parseInt('0x' + params.data.substring(4, 6))
    },
    {
        'key': 'batteryVoltage',
        'value': (3.4 * parseInt('0x' + params.data.substring(2, 4)) / 255.0).toFixed(2)
    }];

    return callback(null, result);
  }
  else return callback('Invalid checksum');
}
