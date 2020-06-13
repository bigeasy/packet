const assert = require('assert')
const coalesce = require('extant')

// TODO It always needs to be an array of fields because we need to be able to
// insert checkpoints, even for ostensible fixed fields like literal.

// TODO Note that if a child of a literal starts with fixed, this is only the
// length encoding, it can be merged into the checkpoint before the literal.
// This can be done by adding and `arrayed` property to everything that loops
// and merging any initial fields are are unarrayed.

function integer (value, packed, extra = {}) {
    if (!packed && Math.abs(value % 8) == 1) {
        if (value < 0) {
            return {
                type: 'integer',
                dotted: '',
                fixed: true,
                bits: ~value,
                endianness: 'little',
                compliment: false,
                ...extra
            }
        }
        return {
            type: 'integer',
            dotted: '',
            fixed: true,
            bits: ~-value,
            endianness: 'little',
            compliment: true,
            ...extra
        }
    }
    return {
        type: 'integer',
        dotted: '',
        fixed: true,
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0,
        ...extra
    }
}

function packed (definitions, size, extra = {}) {
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
                                                when.push(packed(def1, 4, field, { value }))
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
    const complete = { ...integer(size, false, extra), fields }
    assert.equal(bits, complete.bits, 'packed integer does not match size')
    return complete
}

function map (definitions, packet, extra = {}, packed = false) {
    const definition = { parse: null, serialize: null }
    switch (typeof packet) {
    case 'string': {
            return [{ ...extra, ...definitions[packet] }]
        }
        break
    case 'object': {
            // Please resist the urge to refactor based on, oh look, I'm
            // performing this test twice. A single if/else ladder will be
            // easier to return to for maintainence and expansion.
            // Outer array.
            if (Array.isArray(packet)) {
                if (
                    packet.length == 2 &&
                    typeof packet[0] == 'number' &&
                    Array.isArray(packet[1]) &&
                    packet[1].length > 1 &&
                    packet[1].filter(value => typeof value == 'string').length == packet[1].length
                ) {
                    const field = map(definitions, packet[0], extra, packed).shift()
                    field.lookup = packet[1].slice()
                    return [ field ]
                // Seems that we could still have an object for integer with
                // padding before and after, we could make literals wrappers.
                // [ 'ac', 16 ] or [ 'ac', [ 'utf8' ] ]
                } else if (
                    packet.filter(item => typeof item == 'string').length != 0 ||
                    (Array.isArray(packet[0]) && typeof packet[0][0] == 'string') ||
                    (
                        Array.isArray(packet[packet.length - 1]) &&
                        typeof packet[packet.length - 1][0] == 'string'
                    )
                ) {
                    const before = { repeat: 0, value: '' }, after = { repeat: 0, value: '' }
                    packet = packet.slice(0)
                    if (typeof packet[0] == 'string') {
                        before.repeat = 1
                        before.value = packet.shift()
                        before.bits = before.value.length * 4
                    } else if (
                        Array.isArray(packet[0]) &&
                        typeof packet[0][0] == 'string'
                    ) {
                        before.repeat = packet[0][1]
                        before.value = packet[0][0]
                        before.bits = before.value.length * 4
                        packet.shift()
                    }
                    if (typeof packet[packet.length - 1] == 'string') {
                        after.repeat = 1
                        after.value = packet.pop()
                        after.bits = after.value.length * 4
                    } else if (
                        Array.isArray(packet[packet.length - 1]) &&
                        typeof packet[packet.length - 1][0] == 'string'
                    ) {
                        after.repeat = packet[packet.length - 1][1]
                        after.value = packet[packet.length - 1][0]
                        after.bits = after.value.length * 4
                    }
                    // TODO Use `field` as a common child then do bits
                    // recursively. Aren't we going by fixed anyway?
                    const fields = map(definitions, packet[0], extra, packed)
                    const bits = fields[0].fixed
                               ? fields[0].bits + before.repeat * before.value.length * 4
                                                + after.repeat * after.value.length * 4
                               : 0
                    return [{
                        type: 'literal',
                        dotted: '',
                        ethereal: true,
                        fixed: fields[0].fixed,
                        bits: bits,
                        before: before,
                        fields: fields,
                        after: after
                    }]
                // Switch statements.
                } else if (
                    typeof packet[0] == 'function' &&
                    typeof packet[1] == 'object'
                ) {
                    const cases = []
                    for (const value in packet[1]) {
                        cases.push({
                            value: value,
                            fields: map(definitions, packet[1][value], {})
                        })
                    }
                    const otherwise = packet.length > 2
                        ? map(definitions, packet[2], {})
                        : null
                    const bits = cases.reduce((value, when) => {
                        return value != -1 && value == when.fields[0].bits ? value : -1
                    }, otherwise[0].bits || cases[0].fields[0].bits)
                    return [{
                        type: 'switch',
                        source: packet[0].toString(),
                        bits: bits < 0 ? 0 : bits,
                        fixed: bits > 0,
                        cases: cases,
                        otherwise: otherwise,
                        ...extra
                    }]
                // Packed integers.
                } else if (
                    typeof packet[0] == 'object' &&
                    ! Array.isArray(packet[0]) &&
                    typeof packet[1] == 'number'
                ) {
                    const fields = []
                    for (const name in packet[0]) {
                        fields.push.apply(fields, map(definitions, packet[0][name], {
                            name: name, dotted: `.${name}`
                        }, true))
                    }
                    const into = integer(packet[1], false, extra)
                    return [{ ...into, fields, ...extra }]
                // Terminated arrays.
                } else if (
                    Array.isArray(packet[0]) &&
                    typeof packet[1] == 'number'
                ) {
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
                        fields: map(definitions, packet[0][0], {})
                    }]
                // Fixed length arrays.
                } else if (
                    Array.isArray(packet[0]) &&
                    typeof packet[0][0] == 'number' &&
                    Array.isArray(packet[1])
                ) {
                    const pad = []
                    const slice = packet.slice(2)
                    while (typeof slice[0] == 'number')  {
                        pad.push(slice.shift())
                    }
                    const fields = map(definitions, packet[1][0], {})
                    const fixed = fields.filter(field => ! field.fixed).length == 0
                    const bits = fixed
                               ? fields.reduce((bits, field) => bits + field.bits, 0)
                               : 0
                    return [{
                        type: 'fixed',
                        length: packet[0],
                        ...extra,
                        pad,
                        fixed,
                        align: 'left',
                        length: packet[0][0],
                        bits: bits * packet[0][0],
                        fields
                    }]
                // Length-encoded arrays.
                } else if (
                    packet.length == 2 &&
                    typeof packet[0] == 'number'
                ) {
                    const fields = []
                    assert(Array.isArray(packet[1]))
                    const encoding = integer(packet[0], false, {})
                    const element = map(definitions, packet[1][0], {})
                    assert.equal(element.length, 1, 'badness')
                    fields.push({
                        type: 'lengthEncoded',
                        encoding: [ encoding ],
                        dotted: '',
                        bits: 0,
                        fixed: false,
                        // TODO Length encode a structure.
                        fields: [ element[0] ],
                        ...extra
                    })
                    return fields
                // Split conditionals.
                } else if (
                    (packet.length == 2 || packet.length == 1) &&
                    Array.isArray(packet[0]) &&
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
                                arity: test.length,
                                fields: map(definitions, packet, {})
                            })
                        }
                        return { split: true, conditions }
                    } ()
                    const parse = function () {
                        const parse = packet[1].slice()
                        const sip = typeof parse[0] == 'number'
                                  ? map(definitions, parse.shift(), {})
                                  : null
                        const conditions = []
                        for (const serialize of parse) {
                            const [ test, packet ] = serialize
                            conditions.push({
                                source: test.toString(),
                                arity: 1,
                                fields: map(definitions, packet, {})
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
                // Mirrored conditionals.
                } else if (
                    packet.length > 1 &&
                    packet.slice(0, packet.length - 1).filter(element => {
                        return Array.isArray(element) &&
                               element.length == 2 &&
                               typeof element[0] == 'function'
                    }).length == packet.length - 1 &&
                    (
                        Array.isArray(packet[packet.length - 1]) &&
                        (
                            packet[packet.length - 1].length == 1 ||
                            (
                                packet[packet.length - 1].length == 2 &&
                                typeof packet[packet.length - 1][0] == 'function'
                            )
                        )
                    )
                ) {
                    const fields = []
                    const conditions = []
                    for (const condition of packet) {
                        if (condition.length == 1) {
                            condition.unshift(() => true)
                        }
                        const [ test, field ] = condition
                        const fields = map(definitions, field, {})
                        conditions.push({
                            body: {
                                source: test.toString(),
                                arity: 1,
                                fields: fields,
                            },
                            bits: fields.reduce((bits, field) => {
                                return bits == -1 || !field.fixed ? -1 : bits + field.bits
                            }, 0)
                        })
                    }
                    const fixed = conditions.reduce((bits, cond) => {
                        return cond.bits == -1 ? -1
                                               : bits == cond.bits ? bits
                                                                   : -1
                    }, conditions[0].bits)
                    return [{
                        type: 'conditional',
                        bits: fixed == -1 ? 0 : conditions[0].bits,
                        fixed: fixed != -1,
                        serialize: {
                            split: false,
                            conditions: conditions.map(cond => cond.body)
                        },
                        parse: {
                            sip: null,
                            conditions: JSON.parse(JSON.stringify(conditions)).map(cond => cond.body)
                        },
                        ...extra
                    }]
                } else {
                    throw new Error('unknown')
                }
            } else {
                const fields = []
                for (const name in packet) {
                    fields.push.apply(fields, map(definitions, packet[name], {
                        name, dotted: `.${name}`
                    }))
                }
                const fixed = fields.reduce((fixed, field) => {
                    return fixed && field.fixed
                }, true)
                const bits = fields.reduce((sum, field) => sum + field.bits, 0)
                return [{
                    dotted: '',
                    fixed,
                    bits,
                    type: 'structure',
                    fields,
                    ...extra
                }]
            }
        }
        break
    case 'number': {
            return [ integer(packet, packed, extra) ]
        }
    case 'function': {
            return [{
                type: 'function',
                source: packet.toString(),
                arity: packet.length
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
        definitions.push.apply(definitions, map(definitions, packets[packet], { name: packet }))
    }
    for (const definition of definitions) {
        visit(definition, (packet) => {
            // TODO Try to sort this out in the generators.
            if (packet.type == 'lengthEncoded') {
                definition.lengthEncoded = true
            }
            if (packet.type == 'terminated' || packet.type == 'fixed') {
                definition.arrayed = true
            }
        })
    }
    return definitions
}
