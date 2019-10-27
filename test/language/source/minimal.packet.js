var packet = require('../../..')
// Bargle.
exports.object = packet(function (packet, object) {
    packet('value', 16)
})
