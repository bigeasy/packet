var packet = require('../../..')

exports.object = packet(function (packet, object) {
    packet('string', [8], [0], 'utf8')
})
