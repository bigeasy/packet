var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet('header', function (header) {
        packet({ fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 4, mask: 1, length: 7 })
    })
    if (object.header.length == 127) {
        packet('length', 16)
    } else if (object.header.length == 126) {
        packet('length', 32)
    }
    if (object.header.mask == 1) {
        packet('mask', 16)
    }
})
