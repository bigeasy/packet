var packet = require('../../..')

exports.object = packet(function (packet, object) {
    packet('flag', 8)
    if (object.flag == 16) {
        packet('number', 16)
    } else if (object.flag == 24) {
        packet('number', 24)
    } else {
        packet('number', 32)
    }
})
