
function main(params, callback) {
  let result = [
  {
    'key': 'batteryPercentage',
    'value': parseInt('0x' + params.data.substring(0, 2))
  },
  {
    'key': 'humidity',
    'value': parseInt('0x' + params.data.substring(2, 4))
  },
  {
    'key': 'humidityAlert',
    'value': parseInt('0x' + params.data.substring(4, 6))
  },
  {
    'key': 'movementAlert',
    'value': parseInt('0x' + params.data.substring(10, 12))
  }];

  return callback(null, result);
}
