const fiddle = require('./fiddle/unpack')

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
