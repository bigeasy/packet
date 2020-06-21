const assert = require('assert')
const coalesce = require('extant')
const ieee = require('./ieee')

// TODO It always needs to be an array of fields because we need to be able to
// insert checkpoints, even for ostensible fixed fields like literal.

// TODO Note that if a child of a literal starts with fixed, this is only the
// length encoding, it can be merged into the checkpoint before the literal.
// This can be done by adding and `arrayed` property to everything that loops
// and merging any initial fields are are unarrayed.

function trim (source) {
    const $ = /\n(.*)}$/.exec(source)
    if ($ != null) {
        return source.replace(new RegExp(`^${$[1]}`, 'gm'), '')
    }
    return source
}

function integer (value, packed, extra = {}) {
    if (!packed && Math.abs(value % 8) == 1) {
        if (value < 0) {
            return {
                type: ~value > 32 ? 'bigint' : 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: ~value,
                endianness: 'little',
                compliment: false,
                ...extra
            }
        }
        return {
            type: ~-value > 32 ? 'bigint' : 'integer',
            vivify: 'number',
            dotted: '',
            fixed: true,
            bits: ~-value,
            endianness: 'little',
            compliment: true,
            ...extra
        }
    }
    return {
        type: value > 32 ? 'bigint' : 'integer',
        vivify: 'number',
        dotted: '',
        fixed: true,
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0,
        ...extra
    }
}

function isFixup (field) {
    return Array.isArray(field) && field.length == 1 && typeof field[0] == 'function'
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
                // Array of string values for an integer.
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
                    const fields = map(definitions, packet[0], {}, packed)
                    const bits = fields[0].fixed
                               ? fields[0].bits + before.repeat * before.value.length * 4
                                                + after.repeat * after.value.length * 4
                               : 0
                    // TODO Test literal wrap of a structure.
                    // TODO Test literal wrap of an array.
                    return [{
                        type: 'literal',
                        dotted: '',
                        vivify: fields[0].vivify,
                        fixed: fields[0].fixed,
                        bits: bits,
                        before: before,
                        fields: fields,
                        after: after,
                        ...extra
                    }]
                // Doubles with bit information.
                } else if (
                    packet.length == 2 &&
                    typeof packet[0] == 'number' &&
                    typeof packet[1] == 'number'
                ) {
                    if (Math.abs(packet[1]) % 8 == 1) {
                        const bits = Math.abs(packet[1] + 1)
                        assert.equal(packet[0] * 100, bits, 'bits mismatch')
                        switch (bits) {
                        case 64:
                            return map(definitions, [[
                                ieee.writeDoubleLE
                            ], [[ 8 ], [ 8 ]], [
                                ieee.readDoubleLE
                            ]], extra)
                        case 32:
                            return map(definitions, [[
                                ieee.writeFloatLE
                            ], [[ 4 ], [ 8 ]], [
                                ieee.readFloatLE
                            ]], extra)
                        }
                    }
                    assert.equal(packet[0] * 100, packet[1], 'bits mismatch')
                    switch (packet[1]) {
                    case 64:
                        return map(definitions, [[
                            ieee.writeDoubleBE
                        ], [[ 8 ], [ 8 ]], [
                            ieee.readDoubleBE
                        ]], extra)
                    case 32:
                        return map(definitions, [[
                            ieee.writeFloatBE
                        ], [[ 4 ], [ 8 ]], [
                            ieee.readFloatBE
                        ]], extra)
                    }
                // Fixups.
                } else if (
                    isFixup(packet[0]) || isFixup(packet[packet.length - 1])
                ) {
                    const fixup = packet.slice()
                    const before = isFixup(fixup[0]) ? fixup.shift() : null
                    const after = isFixup(fixup[fixup.length - 1]) ? fixup.pop() : null
                    const fields = map(definitions, fixup[0], {})
                    return [{
                        type: 'fixup',
                        // TODO Test with a structure member.
                        // TODO Test with an array member.
                        vivify: fields[0].vivify,
                        dotted: '',
                        bits: fields[0].bits,
                        fixed: fields[0].fixed,
                        ethereal: true,
                        before: before != null
                            ? { source: trim(before.toString()), arity: before.length }
                            : null,
                        fields: fields,
                        after: after != null
                            ? { source: trim(after.toString()), arity: after.length }
                            : null,
                        ...extra
                    }]
                // Switch statements.
                } else if (
                    typeof packet[0] == 'function' &&
                    typeof packet[1] == 'object'
                ) {
                    const cases = []
                    if (Array.isArray(packet[1])) {
                        for (const when of packet[1]) {
                            if (when.length == 2) {
                                cases.push({
                                    value: when[0],
                                    otherwise: false,
                                    fields: map(definitions, when[1], {})
                                })
                            } else {
                                cases.push({
                                    value: null,
                                    otherwise: true,
                                    fields: map(definitions, when[0], {})
                                })
                            }
                        }
                    } else {
                        for (const value in packet[1]) {
                            cases.push({
                                value: value,
                                otherwise: false,
                                fields: map(definitions, packet[1][value], {})
                            })
                        }
                        if (packet.length > 2) {
                            cases.push({
                                value: null,
                                otherwise: true,
                                fields: map(definitions, packet[2], {})
                            })
                        }
                    }
                    const bits = cases.slice(1).reduce((value, when) => {
                        return value != -1 && value == when.fields[0].bits ? value : -1
                    }, cases[0].fields[0].bits)
                    const vivify = cases.slice(1).reduce((vivify, when) => {
                        return vivify == 'variant' || vivify == when.fields[0].vivify
                            ? vivify
                            : 'variant'
                    }, cases[0].fields[0].vivify)
                    return [{
                        ...extra,
                        type: 'switch',
                        vivify: vivify == 'object' ? 'variant' : vivify,
                        stringify: ! Array.isArray(packet[1]),
                        source: trim(packet[0].toString()),
                        bits: bits < 0 ? 0 : bits,
                        fixed: bits > 0,
                        cases: cases
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
                    const into = integer(packet[1], true, {
                        vivify: 'object',
                        ...extra
                    })
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
                        dotted: '',
                        ...extra,
                        type: 'terminated',
                        vivify: 'array',
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
                        vivify: 'array',
                        length: packet[0],
                        dotted: '',
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
                        vivify: 'array',
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
                            if (serialize.length == 2) {
                                const [ test, packet ] = serialize
                                conditions.push({
                                    test: {
                                        source: trim(test.toString()),
                                        arity: test.length
                                    },
                                    fields: map(definitions, packet, {})
                                })
                            } else {
                                source: null
                                conditions.push({
                                    test: null,
                                    fields: map(definitions, serialize[0], {})
                                })
                            }
                        }
                        return { split: true, conditions }
                    } ()
                    const parse = function () {
                        const parse = packet[1].slice()
                        const sip = typeof parse[0] == 'number'
                                  ? map(definitions, parse.shift(), {})
                                  : null
                        const conditions = []
                        for (const condition of parse) {
                            if (condition.length == 2) {
                            const [ test, packet ] = condition
                                conditions.push({
                                    test: {
                                        source: trim(test.toString()),
                                        arity: 1
                                    },
                                    fields: map(definitions, packet, {})
                                })
                            } else {
                                source: null
                                conditions.push({
                                    test: null,
                                    fields: map(definitions, condition[0], {})
                                })
                            }
                        }
                        return { sip, conditions }
                    } ()
                    const vivify = parse.conditions.slice(1).reduce((vivify, condition) => {
                        return vivify == 'variant' || vivify == condition.fields[0].vivify
                            ? vivify
                            : 'variant'
                    }, parse.conditions[0].fields[0].vivify)
                    // TODO Is fixed if all the alternations are the same
                    // length.
                    fields.push({
                        type: 'conditional',
                        vivify: vivify == 'object' ? 'variant' : vivify,
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
                        if (condition.length == 2) {
                            const [ test, field ] = condition
                            const fields = map(definitions, field, {})
                            conditions.push({
                                body: {
                                    test: {
                                        source: trim(test.toString()),
                                        arity: 1
                                    },
                                    fields: fields,
                                },
                                bits: fields.reduce((bits, field) => {
                                    return bits == -1 || !field.fixed ? -1 : bits + field.bits
                                }, 0)
                            })
                        } else {
                            const fields = map(definitions, condition[0], {})
                            conditions.push({
                                body: {
                                    test: null,
                                    fields: fields,
                                },
                                bits: fields.reduce((bits, field) => {
                                    return bits == -1 || !field.fixed ? -1 : bits + field.bits
                                }, 0)
                            })
                        }
                    }
                    const fixed = conditions.reduce((bits, cond) => {
                        return cond.bits == -1 ? -1
                                               : bits == cond.bits ? bits
                                                                   : -1
                    }, conditions[0].bits)
                    const vivify = conditions.slice(1).reduce((vivify, condition) => {
                        return vivify == 'variant' || vivify == condition.body.fields[0].vivify
                            ? vivify
                            : 'variant'
                    }, conditions[0].body.fields[0].vivify)
                    return [{
                        type: 'conditional',
                        bits: fixed == -1 ? 0 : conditions[0].bits,
                        fixed: fixed != -1,
                        vivify: vivify == 'object' ? 'variant' : vivify,
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
                    type: 'structure',
                    vivify: 'object',
                    dotted: '',
                    fixed,
                    bits,
                    fields,
                    ...extra
                }]
            }
        }
        break
    case 'number': {
            const fractional = packet - Math.floor(packet)
            if (fractional != 0) {
                switch (Math.floor(packet)) {
                case 64:
                    if (fractional == 0.46) {
                        return map(definitions, [ 0.64, ~64 ], extra)
                    }
                    return map(definitions, [ 0.64, 64 ], extra)
                case 32:
                default:
                    if (fractional == 0.23) {
                        return map(definitions, [ 0.32, ~32 ], extra)
                    }
                    return map(definitions, [ 0.32, 32 ], extra)
                }
            }
            return [ integer(packet, packed, extra) ]
        }
    case 'function': {
            return [{
                type: 'function',
                source: trim(packet.toString()),
                arity: packet.length
            }]
        }
    }
    return [ definition ]
}

module.exports = function (packets) {
    const definitions = []
    for (const packet in packets) {
        definitions.push.apply(definitions, map(definitions, packets[packet], { name: packet }))
    }
    return definitions
}
