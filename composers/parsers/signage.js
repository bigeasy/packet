function signage (field, name) {
    var mask = 0xffffffff, test = 1
    var bits = field.bytes * 8
    var width = field.bytes * 8
    if (!field.signed) return ''
    mask = mask >>> (32 - bits)
    test = test << (width - 1) >>> 0
    return (name || 'value') + ' = value & 0x' + test.toString(16) +
        ' ? (0x' + mask.toString(16) + ' - value + 1) * -1 : value'
}

module.exports = signage
