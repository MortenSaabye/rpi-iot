var mqtt = require('mqtt')
var fs = require('fs')

var client
let mqttExp = {}


mqttExp.connect = function(state) {
    fs.readFile('/home/pi/rpi-iot/setupServer/mqttcreds.json', (err, data) => {
        if (err) {
            console.log(+ err)
        }
        let authObject = JSON.parse(data.toString())
        client = mqtt.connect(`mqtts://${authObject.device.user}:${authObject.device.password}@${authObject.server.host}:${authObject.server.port}`)

        client.on('connect', () => {
            handleConnect(client, state)
        })

        client.on('message', (topic, message) => {
            handleMessage(client, topic, message, state)
        })
    })
}

function handleConnect(client, state) {
    console.log('connected to MQTT!')
    let keys = Object.keys(state.devices)
    keys.forEach((device) => {
        client.subscribe(`${device}/state`)
    })
    client.subscribe('state')
}


function handleMessage(client, topic, message, state) {
    switch (topic) {
        case ('state'):
            sendStateForDevices(message, state)
            break
        default:
            console.log(`${message} published to ${topic}`)
            let deviceId = topic.split('/')[0]
            let device = state.devices[deviceId]
            let jsonString = JSON.parse(message.toString())
            let respond = false
            if (device.on != jsonString["on"]) {
                respond = true
            }
            state.updateDevice(jsonString, device)
            respayload = device
            if (respond) {
                client.publish(`${deviceId}/listen`, `{"result": ${JSON.stringify(respayload)}}`)
            }
    }
}

function sendStateForDevices(message, state) {
    let currentState = state.getCurrentState(JSON.parse(message))
    client.publish('state/listen', `{"result": ${JSON.stringify(currentState)}}`)
}


module.exports = mqttExp