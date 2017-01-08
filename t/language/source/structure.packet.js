var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet(object.header, function (header) { packet(header.value, 16) })
})
