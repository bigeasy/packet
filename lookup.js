// Node.js API.
const util = require('util')

// Format source code maintaining indentation.
const $ = require('programmatic')

module.exports = function (definition) {
    const lookup = []

    function seek (field) {
        switch (field.type) {
        case 'bigint':
        case 'integer':
            if (field.lookup != null) {
                if (lookup.length == field.lookup.index) {
                    if (Array.isArray(field.lookup.values)) {
                        lookup[field.lookup.index] = field.lookup.values
                    } else {
                        const reverse = {}
                        for (const key in field.lookup.values) {
                            reverse[field.lookup.values[key]] = key
                        }
                        lookup[field.lookup.index] = {
                            forward: field.lookup.values,
                            reverse: reverse
                        }
                    }
                }
            }
            if (field.fields != null) {
                field.fields.forEach(seek)
            }
            break
        case 'switch':
            field.cases.forEach(when => when.fields.forEach(seek))
            break
        case 'conditional':
            field.serialize.conditions.forEach(when => when.fields.forEach(seek))
            if (!field.split) {
                field.parse.conditions.forEach(when => when.fields.forEach(seek))
            }
            break
        case 'absent':
        case 'buffer':
            break
        case 'accumulator':
        case 'literal':
        case 'inline':
        case 'fixed':
        case 'lengthEncoded':
        case 'terminated':
        case 'structure':
            field.fields.forEach(seek)
            break
        default: throw new Error(field.type)
        }
    }

    for (const name in definition) {
        seek(definition[name])
    }

    return util.inspect(lookup, { depth: null })
}
