var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet(object.header, function (header) {
        packet(header, { fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 4, mask: 1, length: 7 })
    })
    if (object.header.length == 127) {
        packet(object.length, 16)
    } else if (object.header.length == 126) {
        packet(object.length, 32)
    }
    if (object.header.mask == 1) {
        packet(object.mask, 16)
    }
})
