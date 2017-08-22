function main(params, callback){
	let batteryVoltage = (parseInt(params.data.substring(2, 4), 16) * (3.4/255.0)).toFixed(2);
	let temperature = - 40.0 + (parseInt(params.data.substring(4, 6), 16)/2.0);
	let humidity = (parseInt(params.data.substring(10, 12), 16)/2.0);
	let motion = (parseInt(params.data.substring(8,10),16));
	    
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
        }

      ];
      return callback(null, result);
}
