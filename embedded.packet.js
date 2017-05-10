var packet = require('./packet')

exports.frame = packet(function (packet, object) {
    packet('packet', 32)
    packet('length', 32)
})

exports.descriptor = packet(function (packet, object) {
    packet('uuid', [8], [0], 'utf8')
    packet('name', [8], [0], 'utf8')
    packet('manufacturerNumber', 32)
    packet('productType', 32)
    packet('productNumber', 32)
})

exports.device = packet(function (packet, object) {
    packet('attributes', 32, [function () {
        packet('attributeId', 32)
        packet('value', [8], [0], 'utf8')
    }])
})
