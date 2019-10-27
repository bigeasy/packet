var packet = require('../../..')

exports.object = packet(function (packet, object) {
    packet({ flag: 1, small: 3, remaining: 12 })
})
