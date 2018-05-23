let tradfriExp = {}
const tradfri = require('node-tradfri').create({
    coapClientPath: '/home/pi/rpi-iot/services/platform-coap-client', // use embedded coap-client
    identity: 'b3e0c8f05dbf11e89fa94369868a2cfa',
    preSharedKey: 'A4k8XSZqcoFmknSX',
    hubIpAddress: '192.168.1.126'
});
tradfriExp.getDevicesFromIKEA = async function(state, callback) {
    tradfri.getDevices().then(devices => {
        devices.forEach(device => {
            if (device.type != 'TRADFRI remote control') {
                device.type = "tradfri"
                if (device.color == undefined) { device.color = "" }
                state.devices[device.id] = device
            }
        })
        callback()
    }).catch(e => {
        console.log('error: ' + e)
        callback()
    })
}

tradfriExp.updateTradfriDevice = function(device) {
    tradfri.setDeviceState(device.id, { state: device.on, brightness: device.brightness, color: device.color })
}

tradfriExp.testTradfriDevice = function(deviceId) {
    console.log('testing' + deviceId)
    tradfri.toggleDevice(deviceId)
    setTimeout(() => {
        tradfri.toggleDevice(deviceId)
    }, 1000)
}

module.exports = tradfriExp