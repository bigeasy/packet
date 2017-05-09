var packet = require('../../..')

exports.object = packet(function (packet, object) {
    packet('values', 16, [function () {
        packet('key', 16)
        packet('value', 16)
    }])
})
