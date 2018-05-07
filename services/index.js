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
fs.readFile('./devices.json', (err, data) => {
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
            res.end(`testing ${req.url.split('/')[1]}`)
            break
        case('state'):
        console.log("update")
            handleStateChange(req, res)
            break
        default:
            console.log("Don't know what to do about this...")
    }
}

function handleStateGet(req, res) {
    let deviceKeys = JSON.parse(req.payload.toString())
    let currentState = []
    deviceKeys.forEach((key) => {
        let device = state.devices[Number(key)]
        currentState.push({
            id: device.id,
            isOn: device.isOn,
            state: device.state
        })
    })
    console.log(currentState)
    res.end(`{"result": ${JSON.stringify(currentState)}}`)
    console.log(`{"result": ${JSON.stringify(currentState)}}`)
}

function handleStateChange(req, res) {
    let device = state.devices[req.url.split('/')[1]]
    let payload = JSON.parse(req.payload.toString())
    device.isOn = payload["isOn"]
    device.state = payload["state"]
    res.end(`{"result": ${JSON.stringify(device)}}`)
    console.log(`{"result": ${JSON.stringify(device)}}`)
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

fs.readFile('../setupServer/mqttcreds.json', (err, data) => {
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
    console.log('connected!')
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

            device.isOn = jsonString["isOn"]
            device.state = jsonString["state"]
            respayload = device
            client.publish(`${deviceId}/listen`, `{"result": ${JSON.stringify(respayload)}}`)
            console.log(JSON.stringify(respayload))
    }
}

function sendStateForDevices(message) {
    let deviceKeys = JSON.parse(message.toString())
    let currentState = []
    deviceKeys.forEach((key) => {
        let device = state.devices[Number(key)]
        currentState.push({
            id: device.id,
            isOn: device.isOn,
            state: device.state
        })
    })
    client.publish('state/listen', `{"result": ${JSON.stringify(currentState)}}`)
}
