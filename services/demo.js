var coap = require('coap')


var req = coap.request('coap://raspberry.local./devices')

req.method = 'GET'
req.write(JSON.stringify({
    isOn: true,
    state: "New state"
}))

req.on('response', function (res) {
    console.log(JSON.parse(res.payload.toString()))
    res.on('end', function () {
        process.exit(0)
    })
})

req.end()
