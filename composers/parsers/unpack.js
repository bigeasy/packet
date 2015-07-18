function unpack (bits, offset, length) {
    var mask = 0xffffffff, shift
    mask = mask >>> (32 - bits)
    mask = mask >>> (bits - length)
    shift = bits - offset - length
    shift = shift ? 'value >>> ' + shift : 'value'
    return shift + ' & 0x' + mask.toString(16)
}

function unpackAll (field) {
    var source = ''
    var bits = field.bytes * 8
    var offset = 0
    var bit = 0
    var packing = field.packing.map(function (field) {
        field.offset = bit
        bit += field.bits
        return field
    })
    return packing.map(function (field) {
        return 'object.' +
                field.name + ' = ' +
                unpack(bits, field.offset, field.bits)
    }).join('\n')
}

module.exports = unpackAll
