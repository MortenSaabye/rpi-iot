var express = require("express")
var bodyParser = require("body-parser")
var shell = require("shelljs")
var fs = require('fs')
var request = require('request')
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
	let user = req.body
	fs.readFile(mqttPath, (err, data) => {
		let mqttInfo = JSON.parse(data.toString()).server
		console.log(`read the file: ${mqttInfo}`)
		createMQTTUser(user, mqttInfo, res)
	})
})
 
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

function createMQTTUser(user, mqttInfo, res) {
	let auth = Buffer.from(`${mqttInfo.user}:${mqttInfo.password}`).toString('base64')
	var options = {
		url: 'https://api.cloudmqtt.com/api/user',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${auth}`
		},
		method: 'POST',
		body: JSON.stringify(user)
	}
	var callback = (error, response, body) => {
		if (!error && response.statusCode == 204) {
			console.log(`success! user (${user.username}) created`)
			let resObj = {
				success: true,
				server: {
					user: user.username,
					password: user.password,
					server: mqttInfo.host,
					port: mqttInfo.port
				}
			}
			res.json(JSON.stringify(resObj))
			console.log(JSON.stringify(resObj))
		} else {
			console.log(response.statusCode)
		}
	}
	console.log(options)
	request(options, callback)
}
