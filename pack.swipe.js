const $ = require('programmatic')

const fiddle = require('./pack')

// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function _pack (packet, object, stuff = 'let value') {
    const preface = []
    const packing = []
    let offset = 0
    for (const field of packet.fields) {
        switch (field.type) {
        case 'integer': {
                let variable = object + field.dotted
                if (field.indexOf) {
                    constants.other = packed.indexOf
                    variable = `other.indexOf[${object}.${packed.name}]`
                }
                packing.push(' (' + fiddle(packet.bits, offset, field.bits, variable) + ')')
                offset += field.bits
            }
            break
        case 'literal': {
                packing.push(` (${fiddle(packet.bits, offset, field.bits, `0x${field.value}`)})`)
                offset += field.bits
            }
            break
        case 'switch': {
                const cases = []
                for (const when of packed.when) {
                    if ('literal' in when) {
                        cases.push($(`
                            case ${JSON.stringify(when.value)}:
                                ${packed.name} = ${JSON.stringify(when.literal)}
                                break
                        `))
                    } else {
                        cases.push($(`
                            case ${JSON.stringify(when.value)}:
                                `, _pack(when, object, 'flags'), `
                                break
                        `))
                    }
                }
                preface.push($(`
                    let ${packed.name}
                    switch ((${packed.value})(object)) {
                    `, cases.join('\n'), `
                    }
                `))
                packing.push(` (${pack(4, offset, packed.bits, packed.name)})`)
            }
            break
        }
    }
    if (preface.length) {
        return $(`
            `, preface.join('\n'), `

            ${stuff} =
                `, packing.join(' |\n'), `
        `)
    }
    return $(`
        ${stuff} =
            `, packing.join(' |\n'), `
    `)
}
