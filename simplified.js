const assert = require('assert')
const coalesce = require('extant')

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

function packed (definitions, extra = {}) {
    const fields = []
    let bits = 0
    for (const field in definitions) {
        switch (typeof definitions[field]) {
        case 'string': {
                bits += definitions[field].length * 4
                fields.push({
                    type: 'literal',
                    fixed: true,
                    bits: definitions[field].length * 4,
                    value: definitions[field]
                })
            }
            break
        case 'number': {
                const definition = integer(definitions[field], true, { name: field, dotted: `.${field}` })
                bits += definition.bits
                fields.push(definition)
            }
            break
        case 'object': {
                if (Array.isArray(definitions[field])) {
                    const when = []
                    switch (typeof definitions[field][0]) {
                    case 'object': {
                            if (Array.isArray(definitions[field][1])) {
                                console.log('yup',definitions)
                                console.log(definitions)
                            } else {
                                console.log('nope')
                            }
                        }
                        break
                    case 'function': {
                            switch (typeof definitions[field][1]) {
                            case 'object':
                                if (Array.isArray(definitions[field][1])) {
                                } else if (definitions[field][1] == null) {
                                } else {
                                    let bits2 = -1
                                    for (const value in definitions[field][1]) {
                                        const def1 = definitions[field][1][value]
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
                                                when.push(packed(def1, field, { value }))
                                                console.log(when)
                                            }
                                        }
                                    }
                                }
                            }
                            fields.push({
                                type: 'switch',
                                value: definitions[field][0].toString(),
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
                            if (Array.isArray(definitions[field][1])) {
                                extra.indexOf = definitions[field][1]
                            }
                            const definition = integer(definitions[field][0], true, extra)
                            bits += definition.bits
                            fields.push(definition)
                        }
                        break
                    }
                } else {
                    console.log('xxx', definitions)
                }
            }
            break
        }
    }
    return { ...integer(bits, false, extra), fields }
}

function map (definitions, packet, depth, extra = {}) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'string': {
            return [{ ...extra, ...definitions[packet] }]
        }
        break
    case 'object': {
            if (Array.isArray(packet)) {
                if (packet.filter(item => typeof item == 'string').length != 0) {
                    const fields = []
                    for (const part of packet) {
                        if (typeof part == 'string') {
                            assert(part.length % 2 == 0)
                            fields.push({
                                type: 'literal',
                                fixed: true,
                                bits: part.length * 4,
                                value: part
                            })
                        } else {
                            fields.push.apply(fields, map(definitions, part, depth, extra))
                        }
                    }
                    return fields
                } else if (typeof packet[packet.length - 1] == 'number') {
                    const fields = []
                    const terminator = []
                    for (let i = 1, I = packet.length; i < I; i++) {
                        terminator.push(packet[i])
                    }
                    return [{
                        ...extra,
                        type: 'terminated',
                        bits: 0,
                        fixed: false,
                        terminator: terminator,
                        fields: map(definitions, packet[0][0], depth, {})
                    }]
                } else if (packet.length == 2) {
                    if (typeof packet[0] == 'number') {
                        const fields = []
                        assert(Array.isArray(packet[1]))
                        const length = integer(packet[0], false, {})
                        fields.push({
                            ...length,
                            type: 'lengthEncoding',
                            ...extra
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
                                bits: 0,
                                fixed: false,
                                // TODO Length encode a structure.
                                element: struct
                            })
                        }
                        return fields
                    } else if (
                        Array.isArray(packet[0]) &&
                        Array.isArray(packet[1]) &&
                        Array.isArray(packet[0][0]) &&
                        typeof packet[0][0][0] == 'function'
                    ) {
                        const fields = []
                        const serialize = function () {
                            const conditions = []
                            for (const serialize of packet[0]) {
                                const [ test, packet ] = serialize
                                conditions.push({
                                    source: test.toString(),
                                    airty: test.length,
                                    fields: map(definitions, packet, false, {})
                                })
                            }
                            return { conditions }
                        } ()
                        const parse = function () {
                            const [ ...parse ] = packet[1]
                            const sip = map(definitions, parse.shift(), false, {})
                            const conditions = []
                            for (const serialize of parse) {
                                const [ test, packet ] = serialize
                                conditions.push({
                                    source: test.toString(),
                                    airty: 1,
                                    fields: map(definitions, packet, false, {})
                                })
                            }
                            return { sip, conditions }
                        } ()
                        // TODO Is fixed if all the alternations are the same
                        // length.
                        fields.push({
                            type: 'conditional',
                            bits: 0,
                            fixed: false,
                            serialize, parse, ...extra
                        })
                        return fields
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
                // TODO It's not depth == 0, more like start of structure.
                const fields = []
                for (const name in packet) {
                    fields.push.apply(fields, map(definitions, packet[name], 1, {
                        name, dotted: `.${name}`
                    }))
                }
                const fixed = fields.reduce((fixed, field) => {
                    return fixed && field.fixed
                }, true)
                const bits = fields.reduce((sum, field) => sum + field.bits, 0)
                return [ { ...extra, fixed, bits, type: 'structure', fields } ]
            } else {
                return [ packed(packet, extra) ]
            }
        }
        break
    case 'number': {
            return [ integer(packet, false, extra) ]
        }
    case 'function': {
            return [{
                type: 'function',
                source: packet.toString(),
                airty: packet.length
            }]
        }
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
            if (packet.type == 'terminated') {
                definition.arrayed = true
            }
        })
    }
    return definitions
}
