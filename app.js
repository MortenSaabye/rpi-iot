var express = require("express")
var bodyParser = require("body-parser")
var shell = require("shelljs")
var wifi = require('node-raspbian-wifi')
var app = express()
const PORT = 3000

app.use(bodyParser.json())
function resetInterface() {
    shell.exec('sudo systemctl restart hostapd')
    shell.exec('/home/pi/iot/staticip.sh')
}


app.get('/getwifiinfo', (req, res) => {
    console.log('getting info')

    res.json({ resultData: shell.exec("sudo iwlist wlan0 scanning | egrep 'Cell |Encryption|Quality|ESSID'") })
})

app.post('/connect', (req, res) => {
    var options = {
        ssid: req.body.ssid,
        psk: req.body.passcode
    }
    console.log(options)
    res.json({ success: "maybe" })
    shell.exec('/home/pi/iot/dynamicip.sh')
    shell.exec('sudo systemctl stop hostapd')
    wifi.connectToWifi(options, (error) => {
        if (error) {
            console.log(error)
            resetInterface()
        }
    })
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
asdasd