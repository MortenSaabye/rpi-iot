var fs = require('fs')
var gpio = require('./gpio')
var tradfri = require('./tradfri')

var state = {}
state.loadState = function(callback) {
    fs.readFile('/home/pi/rpi-iot/services/devices.json', (err, data) => {
        if (err) {
            console.log(err)
        }
        state.devices = JSON.parse(data.toString()).devices
        tradfri.getDevicesFromIKEA(state, (state) => {
            callback(state)
        })
    })
}


state.getCurrentState = function(keys) {
    let currentState = []
    keys.forEach((key) => {
        let device = state.devices[Number(key)]
        currentState.push({
            id: device.id,
            on: device.on,
            brightness: device.brightness,
            color: device.color
        })
    })
    return currentState
}

state.updateDevice = function(payload, device) {
    device.on = payload["on"]
    device.brightness = payload["brightness"]
    device.color = payload["color"]
    switch (device.type) {
        case ('tradfri'):
            console.log('update tradfri')
            tradfri.updateTradfriDevice(device)
            break
        case ('light'):
            console.log('update led')
            gpio.updateLedDevice(device)
            break
        default:
            console.log('homemade device')
    }
}

state.getDevices = function(keys) {
    let devices = []
    keys.forEach((key) => {
        devices.push(state.devices[key])
    })
    return devices
}

module.exports = state