var unpack = require('./_unpack')

function unpackAll (object, field) {
    var source = ''
    var bits = field.bytes * 8
    var offset = 0
    var bit = 0
    var packing = field.fields.map(function (field) {
        field.offset = bit
        bit += field.bits
        return field
    })
    return packing.map(function (field) {
        return object + '.' +
                field.name + ' = ' +
                unpack(bits, field.offset, field.bits)
    }).join('\n')
}

module.exports = unpackAll
