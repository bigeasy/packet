var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet('header', function (header) { packet('value', 16) })
})
