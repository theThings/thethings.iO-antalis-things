let minimumBatteryLevel = 1.08; // In volts
let maxBatteryLevel = 1.6; // In volts

function sendEmailTemperature(params, temperature)
{
    var email1 = "marc@thethings.io";

    email
    (
        {
          service: 'SendGrid',
          auth: {
            api_user: 'thethingsio-jmperez',
            api_key: 'bor10eal',
          },
        },
        {
          from: 'support@thethings.io',
          to: email1,
          subject: 'Nevera   ' + params.deviceId + ' por encima de la temperatura ('+temperature+'ºC)',
          text: 'Master, let´s dance! \n\n Always yours,\n ',
        }
    );
  
}


function main(params, callback)
{
   switch(params.data.length) 
    {
    case 2:
      	let batteryVoltage = (parseInt(params.data.substring(0, 2), 16) * (3.4/255.0)).toFixed(2);
		let percentage = batteryVoltage > maxBatteryLevel ? 100 : (((batteryVoltage-minimumBatteryLevel)/(maxBatteryLevel-minimumBatteryLevel))*100).toFixed(0)
    	percentage = percentage < 0 ? 0 : percentage;
        
        let result2 = [
          {
          	key: "batteryVoltage",
          	value: batteryVoltage
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
        return callback(null, result2);
        break;
      
      default: 
  
		let temperature = - 40.0 + (parseInt(params.data.substring(0, 2), 16)/2.0);
     	let temperature2 = - 40.0 + (parseInt(params.data.substring(2, 4), 16)/2.0);
        let temperature3 = - 40.0 + (parseInt(params.data.substring(4, 6), 16)/2.0);
        let temperature4 = - 40.0 + (parseInt(params.data.substring(6, 8), 16)/2.0);
        let temperature5 = - 40.0 + (parseInt(params.data.substring(8, 10), 16)/2.0);	
        let temperature6 = - 40.0 + (parseInt(params.data.substring(10, 12), 16)/2.0);	  	
	    
        let mitja = (temperature + temperature2 + temperature3 + temperature4 + temperature5 + temperature6)/6;
        let maxim = Math.max(temperature, temperature2, temperature3, temperature4, temperature5, temperature6);
        let minim = Math.min(temperature, temperature2, temperature3, temperature4, temperature5, temperature6);
        
        
      let result = [
        {
          key: "temperature",
          value: temperature
        },
        {
          key: "temperatureMedium",
          value: mitja
        },
        {
          key: "temperatureMin",
          value: minim
        },
        {
          key: "temperatureMax",
          value: maxim
        },
                {
          key: "temperature",
          value: temperature2
        },
                {
          key: "temperature",
          value: temperature3
        },
                {
          key: "temperature",
          value: temperature4
        },
                {
          key: "temperature",
          value: temperature5
        },
                {
          key: "temperature",
          value: temperature6
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
        
        if (temperature < 0) 
        {
            sendEmailTemperature(params, temperature);
            console.log("send e-mail");
        }
        
        
      return callback(null, result);
	}
}
