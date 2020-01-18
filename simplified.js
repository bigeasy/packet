const assert = require('assert')

function integer (value, packed, extra = {}) {
    if (!packed && Math.abs(value % 8) == 1) {
        if (value < 0) {
            return {
                ...extra,
                type: 'integer',
                fixed: true,
                bits: ~value,
                endianness: 'little',
                compliment: false
            }
        }
        return {
            ...extra,
            type: 'integer',
            fixed: true,
            bits: ~-value,
            endianness: 'little',
            compliment: true
        }
    }
    return {
        ...extra,
        type: 'integer',
        fixed: true,
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0
    }
}

function packed (def, rest = {}) {
    const fields = []
    let bits = 0
    for (const field in def) {
        switch (typeof def[field]) {
        case 'number': {
                const definition = integer(def[field], true, { name: field })
                bits += definition.bits
                fields.push(definition)
            }
            break
        case 'object': {
                if (Array.isArray(def[field])) {
                    const when = []
                    switch (typeof def[field][0]) {
                    case 'object': {
                            if (Array.isArray(def[field][1])) {
                                console.log('yup',def)
                                console.log(def)
                            } else {
                                console.log('nope')
                            }
                        }
                        break
                    case 'function': {
                            switch (typeof def[field][1]) {
                            case 'object':
                                if (Array.isArray(def[field][1])) {
                                } else if (def[field][1] == null) {
                                } else {
                                    let bits2 = -1
                                    for (const value in def[field][1]) {
                                        const def1 = def[field][1][value]
                                        switch (typeof def1) {
                                        case 'object':
                                            if (Array.isArray(def1)) {
                                                const bits1 = def1[0]
                                                const literal = def1[1]
                                                if (bits2 == -1) {
                                                    bits2 = bits1
                                                } else {
                                                    assert(bits2 == bits1)
                                                }
                                                when.push({
                                                    value, type: 'integer', endianness: 'big', bits: bits1, literal
                                                })
                                            } else {
                                                const packed2 = []
                                                when.push(packed(def1, { value }))
                                                console.log(when)
                                            }
                                        }
                                    }
                                }
                            }
                            fields.push({
                                type: 'switch',
                                value: def[field][0].toString(),
                                name: field,
                                when: when
                            })
                        }
                        break
                    case 'number': {
                            // Two things here for now, a translation and length
                            // encoded arrays. For length encoded arrays, we
                            // assume either a simple type, like an integer, or
                            // a structure. For translations we exect there to
                            // be more than one value, otherwise what's the
                            // point? Ah, no, we're packed here.
                            const extra = { name: field }
                            if (Array.isArray(def[field][1])) {
                                extra.indexOf = def[field][1]
                            }
                            const definition = integer(def[field][0], true, extra)
                            bits += definition.bits
                            fields.push(definition)
                        }
                        break
                    }
                } else {
                    console.log('xxx', def)
                }
            }
            break
        }
    }
    return { ...rest, type: 'integer', bits, fields }
}

function map (definitions, packet, depth, extra = {}) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'object': {
            if (Array.isArray(packet)) {
                if (packet.length == 1 && typeof packet[0] == 'string') {
                    return [{ ...extra, ...definitions[packet[0]] }]
                } else if (packet.length == 2) {
                    switch (typeof packet[0]) {
                    case 'number': {
                            const fields = []
                            assert(Array.isArray(packet[1]))
                            const length = integer(packet[0], false, {})
                            fields.push({
                                ...extra,
                                type: 'lengthEncoding',
                                fixed: true,
                                bits: length.bits,
                                length
                            })
                            if (typeof packet[1][0] == 'number') {
                                const element = integer(packet[1][0], false, {})
                                fields.push({
                                    ...extra,
                                    type: 'lengthEncoded',
                                    fixed: false,
                                    bits: 0,
                                    element: element
                                })
                            } else {
                                const struct = map(definitions, packet[1][0], false, {}).shift()
                                fields.push({
                                    ...extra,
                                    type: 'lengthEncoded',
                                    bits: struct.bits,
                                    fixed: false,
                                    // TODO Length encode a structure.
                                    element: struct
                                })
                            }
                            return fields
                        }
                        break
                    }
                }
            } else if (Object.keys(packet).length == 2 && packet.$parse && packet.$serialize) {
                const parse = []
                for (const segment of packet.$parse) {
                    const bits = segment[0]
                    const value = segment[1].toString()
                    const done = segment[2].toString()
                    parse.push({ bits, value, done })
                }
                const serialize = []
                for (const segment of packet.$serialize) {
                    const bits = segment[0]
                    const value = segment[1].toString()
                    const advance = segment[2].toString()
                    const done = segment[3].toString()
                    serialize.push({ bits, value, advance, done })
                }
                return [ { type: 'compressed', parse, serialize } ]
            } else if (depth == 0) {
                const fields = []
                for (const field in packet) {
                    fields.push.apply(fields, map(definitions, packet[field], 1, { name: field }))
                }
                const fixed = fields.reduce((fixed, field) => {
                    return fixed && field.type != 'lengthEncoded'
                }, true)
                const bits = fields.reduce((sum, field) => sum + field.bits, 0)
                return [ { ...extra, fixed, bits, type: 'structure', fields } ]
            } else {
                return [ packed(packet, depth + 1) ]
            }
        }
        break
    case 'number': {
            return [ integer(packet, false, extra) ]
        }
        break
    }
    return [ definition ]
}

function visit (packet, f) {
    f(packet)
    switch (packet.type) {
    case 'structure':
        for (const field of packet.fields) {
            visit(field, f)
        }
        break
    }
}

module.exports = function (packets) {
    const definitions = []
    for (const packet in packets) {
        definitions.push.apply(definitions, map(definitions, packets[packet], 0, { name: packet }))
    }
    for (const definition of definitions) {
        visit(definition, (packet) => {
            if (packet.type == 'lengthEncoded') {
                definition.lengthEncoded = true
            }
        })
    }
    return definitions
}
