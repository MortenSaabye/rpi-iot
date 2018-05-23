var dnssd = require('dnssd')

const ad = new dnssd.Advertisement(dnssd.udp('devicecontrol'), 5683,
    {
        name: 'Device Control',
    })

module.exports = ad


// ad.on('stopped', function () {
//     process.exit()
// })


// process.stdin.resume()
// process.on('SIGINT', function () {
//     ad.stop()
// })
