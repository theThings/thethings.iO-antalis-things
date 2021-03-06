let minimumBatteryLevel = 0.7; // In volts

function main(params, callback){
	let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4/255.0)).toFixed(2);
	let temperature = - 40.0 + (parseInt(params.data.substring(4, 6), 16)/2.0);
	let humidity = (parseInt(params.data.substring(10, 12), 16)/2.0);
	let motion = (parseInt(params.data.substring(8,10),16));
	let percentage = batteryVoltage > 1.5 ? 100 : (((batteryVoltage-minimumBatteryLevel)/(1.5-minimumBatteryLevel))*100).toFixed(0)
    	percentage = percentage < 0 ? 0 : percentage;
	    
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
	  key: "humidity",
	  value: humidity
	},
        {
       	  key: "motion",
          value: motion
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
	  key: "batteryPercentage",
	  value: percentage
	}

      ];
      return callback(null, result);
}
