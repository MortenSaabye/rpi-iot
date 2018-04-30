var dnssd = require('dnssd')
var coap = require('coap')

const ad = new dnssd.Advertisement(dnssd.udp('coap'), 5683, 
    {
        name: 'Device Control', 
        txt: [
                'red light (/red)', 
                'green light (/green)', 
                'yellow light (/yellow)'
            ]
        })
ad.start()

var server = coap.createServer()

server.on('request', function (req, res) {
    console.log(req.url)
    switch(req.url) {
        case('/red'):
        res.end('toggle red light')
        break
        case('/green'):
        res.end('toggle green light')
        break
        case('/yellow'):
        res.end('toggle yellow light')
        break 
        default:
        res.end('No such resource')
    }
})




// the default CoAP port is 5683 
server.listen(function () {
    console.log('The CoAP server is listening')
})


process.stdin.resume()
process.on('SIGINT', function () {
    ad.stop()
});

ad.on('stopped', function() {
    process.exit()
})