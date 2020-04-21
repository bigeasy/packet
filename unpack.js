function fiddle (bits, offset, length, assignee) {
    var mask = 0xffffffff, shift
    mask = mask >>> (32 - bits)
    mask = mask >>> (bits - length)
    shift = bits - offset - length
    shift = shift ? `${assignee} >>> ` + shift : assignee
    return shift + ' & 0x' + mask.toString(16)
}

function unpack (path, field, assignee) {
    let bits = field.bits, offset = 0, bit = 0
    const packing = field.fields.map(function (field) {
        field.offset = bit
        bit += field.bits
        return field
    })
    return packing.filter(field => field.type == 'integer').map(function (field) {
        return `${path}${field.dotted} = ${fiddle(bits, field.offset, field.bits, assignee)}`
    }).join('\n')
}

module.exports = unpack
