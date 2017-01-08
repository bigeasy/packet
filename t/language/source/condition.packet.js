var packet = require('packet')

exports.object = packet(function (packet, object) {
    packet(object.flag, 8)
    if (object.flag == 16) {
        packet(object.number, 16)
    } else if (object.flag == 24) {
        packet(object.number, 24)
    } else {
        packet(object.number, 32)
    }
})
