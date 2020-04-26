const fiddle = require('./fiddle/unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')

function unpack (path, field, assignee) {
    let bits = field.bits, offset = 0, bit = 0
    const packing = field.fields.map(function (field) {
        field.offset = bit
        bit += field.bits
        return field
    })
    // TODO Faster with an if statement rather than a reassignment (see
    // generated code) or with a temporary variable.
    return packing.filter(field => field.type == 'integer').map(function (field) {
        const assign = `${path}${field.dotted} = ${fiddle(bits, field.offset, field.bits, assignee)}`
        if (field.compliment) {
            return $(`
                `, assign, `
                ${path}${field.dotted} =
                    `, unsign(path + field.dotted, field.bits), `
            `)
        }
        return assign
    }).join('\n')
}

module.exports = unpack
