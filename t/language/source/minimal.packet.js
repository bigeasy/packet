var packet = require('packet')
// Bargle.
exports.object = packet(function (packet, object) {
    packet('value', 16)
})
