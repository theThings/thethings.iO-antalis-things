function main(params, callback){

    	let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4/255.0)).toFixed(2);
	    let temperature = - 40.0 + (parseInt(params.data.substring(4, 6), 16)/2.0);
	    
      let result = [
        {
          key: "batteryVoltage",
          value: batteryVoltage
        },
        {
          key: "temperature",
          value: temperature
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
        }
      ];
      return callback(null, result);
 
}
