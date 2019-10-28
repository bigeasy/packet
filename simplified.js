const assert = require('assert')

function integer (value, packed, extra = {}) {
    if (!packed && value % 8 == 1) {
        if (value < 0) {
            return {
                ...extra,
                type: 'integer',
                bits: ~value,
                endianness: 'little',
                compliment: false
            }
        }
        return {
            ...extra,
            type: 'integer',
            bits: ~-value,
            endianness: 'little',
            compliment: true
        }
    }
    return {
        ...extra,
        type: 'integer',
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0
    }
}

function Packed (def, rest = {}) {
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
                                                when.push(Packed(def1, { value }))
                                                console.log(when)
                                            }
                                        }
                                    }
                                }
                            }
                            fields.push({
                                type: 'switch',
                                value: def[field][0].toString(),
                                when: when
                            })
                        }
                        break
                    case 'number': {
                            const extra = {}
                            if (Array.isArray(def[field][1])) {
                                extra.indexOf = def[field][1]
                            }
                            const definition = integer(def[field][0], true, extra)
                            console.log('>>>>', integer(def[field][0], true, extra))
                            console.log(bits, definition, definition.bits)
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
    return { ...rest, type: 'packed', bits, fields }
}

function parse (packet, depth, extra = {}) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'object': {
            if (Object.keys(packet).length == 2 && packet.$parse && packet.$serialize) {
                const segments = []
                for (const segment of packet.$parse) {
                    const bits = segment[0]
                    const value = segment[1].toString()
                    const done = segment[2].toString()
                    segments.push({ bits, value, done })
                }
                return { type: 'compressed', segments }
            } else if (depth == 0) {
                const fields = []
                for (const field in packet) {
                    fields.push(parse(packet[field], 1, { name: field }))
                }
                return {
                    type: 'structure',
                    fields
                }
            } else {
                return Packed(packet)
            }
        }
        break
    case 'number': {
            return integer(packet, false, extra)
        }
        break
    }
    return definition
}

function serialize (packet, depth, extra = {}) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'object': {
            if (Object.keys(packet).length == 2 && packet.$parse && packet.$serialize) {
                const segments = []
                for (const segment of packet.$serialize) {
                    const bits = segment[0]
                    const value = segment[1].toString()
                    const advance = segment[2].toString()
                    const done = segment[3].toString()
                    segments.push({ bits, value, advance, done })
                }
                return { type: 'compressed', segments }
            } else {
                const fields = []
                for (const field in packet) {
                    fields.push(parse(packet[field], 1, { name: field }))
                }
                return {
                    type: 'structure',
                    fields
                }
            }
        }
        break
    case 'number': {
            return integer(packet, false, extra)
        }
        break
    }
    return definition
}

module.exports = function (packets) {
    const definitions = { parse: {}, serialize: {} }
    for (const packet in packets) {
        definitions.parse[packet] = parse(packets[packet], 0)
        definitions.serialize[packet] = serialize(packets[packet], 0)
    }
    return definitions
}
