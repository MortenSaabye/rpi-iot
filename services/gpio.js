var pigpio = require('pigpio')
pigpio.configureSocketPort(8007);
var Gpio = pigpio.Gpio
var state = require('./state.js')

var redLed = new Gpio(17, { mode: Gpio.OUTPUT })
var yellowLed = new Gpio(27, { mode: Gpio.OUTPUT })
var greenLed = new Gpio(22, { mode: Gpio.OUTPUT })

var gpio = {}

gpio.updateLedDevice = function(device) {
    let led = getLedfromDevice(device)
    let dutyCycle

    if (!device.on) {
        dutyCycle = 0
    } else {
        dutyCycle = device.brightness
    }
    led.pwmWrite(dutyCycle);
}

gpio.testLedDevice = function(device) {
    let led = getLedfromDevice(device)
    console.log('testing ' + device.id)
    let dutyCycle = 0
    let intervalId = setInterval(function () {
        led.pwmWrite(dutyCycle);

        dutyCycle += 5;
        if (dutyCycle > 255) {
            gpio.updateLedDevice(device)
            clearInterval(intervalId)
        }
    }, 20);
}

gpio.blinkGreen = function () {
    let dutyCycle = 255
    interval = setInterval(() => {
        greenLed.pwmWrite(dutyCycle);
        if (dutyCycle == 255) {
            dutyCycle = 0
        } else {
            dutyCycle = 255
        }
    }, 150);
}

gpio.solidGreen = function () {
    let dutyCycle = 255
    clearInterval(interval)
    greenLed.pwmWrite(dutyCycle)
    setTimeout(() => {
        greenLed.pwmWrite(0)
    }, 5000)
}

gpio.solidRed = function () {
    let dutyCycle = 255
    clearInterval(interval)
    redLed.pwmWrite(dutyCycle)
    setTimeout(() => {
        red.pwmWrite(0)
    }, 5000)
}


function getLedfromDevice(device) {
    let led
    switch (device.id) {
        case (1):
            led = redLed
            break
        case (2):
            led = greenLed
            break
        case (3):
            led = yellowLed
            break
        default:
            console.log('Wrong id for led device')
    }
    return led
}

module.exports = gpio