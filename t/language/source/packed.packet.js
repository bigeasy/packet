var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet(object, { flag: 1, small: 3, remaining: 12 })
})
