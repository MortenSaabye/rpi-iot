var state = require('./state.js')
var gpio = require('./gpio.js')
var tradfri = require('./tradfri.js')
var mqtt = require('./mqtt.js')
var coap = require('./coap.js')
var mqttPath = '/home/pi/rpi-iot/setupServer/mqttcreds.json'

console.log('starting services')
state.loadState(() => {
    coap.connect(state)
    mqtt.connect(state)	
})

