var packet = require('../../..')

exports.structure = packet(function (packet, object) {
    parse('value', exports.encodedInteger)
})

exports.encodedInteger = packet(function (packet, object) {
    parse('value', 16)
})
