const $ = require('programmatic')

const fiddle = require('./fiddle/pack')

function subPack (path, pack, field) {
    switch (field.type) {
    case 'literal': {
            if (field.before.repeat != 0) {
                pack.fields.push(` (${fiddle(pack.bits, pack.offset, field.before.bits, '0x' + field.before.value)})`)
                pack.offset += field.before.bits
            }
            field.fields.forEach(f => subPack(path + field.dotted, pack, f))
        }
        break
    case 'integer': {
            let variable = path + field.dotted
            if (field.indexOf) {
                constants.other = field.indexOf
                variable = `other.indexOf[${object}.${field.name}]`
            }
            pack.fields.push(` (${fiddle(pack.bits, pack.offset, field.bits, variable)})`)
            pack.offset += field.bits
        }
        break
    }
}

// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function _pack (packet, path, stuff = 'let value') {
    const pack = { bits: packet.bits, offset: 0, fields: [] }
    let bits = 0
    for (const field of packet.fields) {
        subPack(path, pack, field)
    }
    return $(`
        ${stuff} =
            `, pack.fields.join(' |\n'), `
    `)
}
