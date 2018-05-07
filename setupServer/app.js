var express = require("express")
var bodyParser = require("body-parser")
var shell = require("shelljs")
var fs = require('fs')
var app = express()
var mqttPath = './mqttcreds.json'
const PORT = 3000

app.use(bodyParser.json())

app.get('/getwifiinfo', (req, res) => {
	console.log('getting info')
	
	res.json({resultData: shell.exec("sudo iwlist ap0 scanning | egrep 'Cell |Encryption|Quality|ESSID'")})
})

app.post('/connect', (req, res) => {
	var options = {
		ssid: req.body.ssid,
		psk: req.body.passcode
	}
	console.log(options)
	shell.exec(`wpa_passphrase ${options.ssid} ${options.psk} > /home/pi/wpa.conf`)
	shell.exec('sudo ifdown wlan0 --force')
	var up = shell.exec('sudo ifup wlan0')
	if(up.stderr != '') {
		res.json({success: false, error: up.stderr})
	} else {
		res.json({success: true, error: null})
		shell.exec('sudo iw dev ap0 del')
	}
})

app.post('/addmqtt', (req, res) => {
	let JSONData = JSON.stringify(req.body)
	fs.writeFile(mqttPath, JSONData, (err) => {
		if(err) {
			res.json({success: false, error: error})
		} else {
			res.json({success: true, error: "no"})
		}
	})
})
 
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
