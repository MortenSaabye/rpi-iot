var coap = require('coap')
var gpio = require('./gpio.js')
var tradfri = require('./tradfri.js')

var server = {}

server.connect = function(state) {
    coapServer = coap.createServer()
    coapServer.on('request', function (req, res) {
        res.setOption('Content-Format', 'application/json')
        console.log(req.url.split('/')[1])
        switch (req.url.split('/')[1]) {
            case ('devices'):
                handleDevices(req, res, state)
                break
            case ('state'):
                handleStateGet(req, res, state)
                break
            default:
                handleRequest(req, res, state)
        }
    })
    coapServer.listen(function () {
        console.log('The CoAP server is listening')
    })
}


function handleRequest(req, res, state) {
    switch (req.url.split('/')[2]) {
        case ('test'):
            handleTest(req, res, state)
            break
        case ('state'):
            console.log("update")
            handleStateChange(req, res, state)
            break
        default:
            console.log("Don't know what to do about this...")
    }
}

function handleTest(req, res, state) {
    let deviceId = req.url.split('/')[1]
    let device = state.devices[deviceId]
    if (device.type == 'tradfri') {
        tradfri.testTradfriDevice(deviceId)
    } else if (device.type == 'light') {
        gpio.testLedDevice(device)
    }
    res.end(`testing ${deviceId}`)
}

function handleStateGet(req, res, state) {
    let currentState = state.getCurrentState(JSON.parse(req.payload))
    res.end(`{"result": ${JSON.stringify(currentState)}}`)
}

function handleStateChange(req, res, state) {
    let device = state.devices[req.url.split('/')[1]]
    let payload = JSON.parse(req.payload.toString())
    state.updateDevice(payload, device)
    res.end(`{"result": ${JSON.stringify(device)}}`)
}

function handleDevices(req, res, state) {
    let keys = Object.keys(state.devices)
    res.end(`{"devices": ${JSON.stringify(state.getDevices(keys))}}`)
}

module.exports = server