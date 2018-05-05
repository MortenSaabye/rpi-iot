var express = require("express")
var bodyParser = require("body-parser")
var shell = require("shelljs")
var wifi = require('node-raspbian-wifi')
var fs = require('fs')
var app = express()
var mqttPath = './mqttcreds.json'
const PORT = 3000

app.use(bodyParser.json())
function resetInterface() {
	shell.exec('sudo systemctl restart hostapd')
	shell.exec('/home/pi/iot/staticip.sh')
}


app.get('/getwifiinfo', (req, res) => {
	console.log('getting info')
	
	res.json({resultData: shell.exec("sudo iwlist wlan0 scanning | egrep 'Cell |Encryption|Quality|ESSID'")})
})

app.post('/connect', (req, res) => {
	var options = {
		ssid: req.body.ssid,
		psk: req.body.passcode
	}
	console.log(options)
	res.json({success: "maybe"})
	shell.exec('sudo systemctl stop hostapd')
	wifi.connectToWifi(options, (error) => {
		if(error) {
			console.log(error) 
			resetInterface() 
		}
	})
})

app.post('/addmqtt', (req, res) => {
	let JSONData = JSON.stringify(req.body)
	console.log(JSONData)
	fs.writeFile(mqttPath, JSONData, (err) => {
		if(err) {
			console.log(err)
			res.json({success: false, error: error})
		} else {
			res.json({success: true, error: "no"})
		}
	})
})
 
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
