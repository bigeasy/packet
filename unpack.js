const fiddle = require('./fiddle/unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')

function unpack (path, field, assignee) {
    let bits = field.bits, offset = 0, bit = 0
    function unpack (field) {
        switch (field.type) {
        case 'literal':
            bit += field.before.bits || 0
            const unpacked = unpack(field.fields[0])
            bit += field.after.bits || 0
            return unpacked
        case 'integer':
            field.offset = bit
            bit += field.bits
            return field
        }
    }
    const packing = field.fields.map(unpack)
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
