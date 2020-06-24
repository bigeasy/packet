// Node.js API.
const util = require('util')

// Format source code maintaining indents.
const $ = require('programmatic')

function generate (packet) {
    const $lookup = []

    function fields (fields) {
        for (const field of fields) {
            dispatch(field)
        }
    }

    function dispatch (field) {
        switch (field.type) {
        case 'switch': {
                for (const when of field.cases) {
                    fields(when.fields)
                }
            }
            break
        case 'conditional': {
                const block = []
                for (const field of field.serialize.conditions) {
                    fields(fields)
                }
                for (const field of field.parse.conditions) {
                    fields(fields)
                }
            }
            break
        case 'literal':
        case 'fixup':
        case 'structure':
        case 'fixed':
        case 'lengthEncoded':
        case 'terminated': {
                fields(field.fields)
            }
            break
        case 'integer':
            if (field.lookup) {
                $lookup.push(field.lookup)
            }
            break
        }
    }

    fields(packet.fields)

    if ($lookup.length == 0) {
        return null
    }

    return  $(`
        $lookup.${packet.name} = ${util.inspect($lookup, { depth: null })}
    `)
}

module.exports = function (packets) {
    return packets.map(packet => generate(packet))
}
