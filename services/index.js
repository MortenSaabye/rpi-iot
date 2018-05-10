var dnssd = require('dnssd')
var coap = require('coap')
var mqtt = require('mqtt')
var fs = require('fs')

const ad = new dnssd.Advertisement(dnssd.udp('devicecontrol'), 5683,
    {
        name: 'Device Control',
    })
ad.start()
var state
fs.readFile('/home/pi/rpi-iot/services/devices.json', (err, data) => {
    if(err) {
        console.log(err)
    }
    state = JSON.parse(data.toString())
    
})
var server = coap.createServer()

server.on('request', function (req, res) {
    res.setOption('Content-Format', 'application/json')
    console.log(req.url.split('/')[1])
    switch (req.url.split('/')[1]) {
        case ('devices'):
            handleDevices(req, res)
            break
        case('state'):
            handleStateGet(req, res)
            break
        default:
            handleRequest(req, res)
    }
})


function handleRequest(req, res) {
    switch(req.url.split('/')[2]) {
        case('test'):
            handleTest(req, res)
            break
        case('state'):
        console.log("update")
            handleStateChange(req, res)
            break
        default:
            console.log("Don't know what to do about this...")
    }
}

function handleTest(req, res) {
    let deviceId = req.url.split('/')[1]
    let device = state.devices[deviceId]
    if(device.type == 'tradfri') {
        tradfri.toggleDevice(deviceId)
        setTimeout(() => {
            tradfri.toggleDevice(deviceId)
        }, 1000)
    }
    res.end(`testing ${deviceId}`)
}

function handleStateGet(req, res) {
    let currentState = getStateForDevices(req.payload)
    res.end(`{"result": ${JSON.stringify(currentState)}}`)
}

function sendStateForDevices(message) {
    let currentState = getStateForDevices(message)
    client.publish('state/listen', `{"result": ${JSON.stringify(currentState)}}`)
}

function getStateForDevices(message) {
    let deviceKeys = JSON.parse(message.toString())
    let currentState = []
    deviceKeys.forEach((key) => {
        let device = state.devices[Number(key)]
        currentState.push({
            id: device.id,
            on: device.on,
            brightness: device.brightness,
            color: device.color
        })
    })
    console.log(currentState)
    return currentState
}

function handleStateChange(req, res) {
    let device = state.devices[req.url.split('/')[1]]
    let payload = JSON.parse(req.payload.toString())
    device.on = payload["on"]
    device.brightness = payload["brightness"]
    device.color = payload["color"]
    res.end(`{"result": ${JSON.stringify(device)}}`)
    updateDevice(device)
}

function handleDevices(req, res) {
    let keys = Object.keys(state.devices)
    let devices = []
    keys.forEach((key) => {
        devices.push(state.devices[key])
    })
    res.end(`{"devices": ${JSON.stringify(devices)}}`)
}

server.listen(function () {
    console.log('The CoAP server is listening')
})


process.stdin.resume()
process.on('SIGINT', function () {
    ad.stop()
});

ad.on('stopped', function () {
    process.exit()
})

var client

fs.readFile('/home/pi/rpi-iot/setupServer/mqttcreds.json', (err, data) => {
    if (err) {
        console.log( + err)
    }
    let authObject = JSON.parse(data.toString())
    client = mqtt.connect(`mqtts://${authObject.device.user}:${authObject.device.password}@${authObject.server.host}:${authObject.server.port}`)

    client.on('connect', () => {
        handleConnect(client)
    })

    client.on('message', (topic, message) => {
        handleMessage(client, topic, message)
    })
})

function handleConnect(client) {
    console.log('connected to MQTT!')
    let keys = Object.keys(state.devices)
    keys.forEach((device) => {
        client.subscribe(`${device}/state`)
    })
    client.subscribe('state')
}


function handleMessage(client, topic, message) {
    switch(topic) {
        case('state'): 
            sendStateForDevices(message)
        break
        default:
            console.log(`${message} published to ${topic}`)
            let deviceId = topic.split('/')[0]
            let device = state.devices[deviceId]
            let jsonString = JSON.parse(message.toString())

            device.on = jsonString["on"]
            device.color = jsonString["color"]
            device.brightness = jsonString["brightness"]
            respayload = device
            client.publish(`${deviceId}/listen`, `{"result": ${JSON.stringify(respayload)}}`)
            updateDevice(device)
    }
}

const tradfri = require('node-tradfri').create({
    coapClientPath: './platform-coap-client', // use embedded coap-client
    identity: 'ccfc4ee052ac11e8bf8f8de7346b1847',
    preSharedKey: 'MooFJS1fYzOLaM5S',
    hubIpAddress: '192.168.1.126'
});
async function getDevicesFromIKEA() {
    tradfri.getDevices().then(devices => {
        devices.forEach(device => {
            if(device.type != 'TRADFRI remote control') {
                device.type = "tradfri"
                if(device.color == undefined) { device.color = "" }
                state.devices[device.id] = device
            }
        })
    }).catch(e => {
        console.log('error: ' + e)
    })
}
getDevicesFromIKEA()

function updateDevice(device) {
    console.log(device)
    switch (device.type) {
        case ('tradfri'):
        console.log('update tradfri')
            updateTradfriDevice(device)
            break
        default:
            console.log('homemade device')
    }
}

function updateTradfriDevice(device) {
    tradfri.setDeviceState(device.id, { state: device.on, brightness: device.brightness, color: device.color })
}