// Node.js API.
const assert = require('assert')

// Return the first non-null value.
const coalesce = require('extant')

// Wrapper around Buffer float parsing to exclude from NYC coverage.
const ieee = require('./ieee')

// Inline function argument parser.
const args = require('./arguments')

// Determine the vivified literal of the given field, descending into the actual
// field type for ethereal fields like inlines and literals.
function vivified (field) {
    if (field.vivify == 'descend') {
        return vivified(field.fields[0])
    }
    return field.vivify
}

function trim (source) {
    const $ = /\n(.*)}$/.exec(source)
    if ($ != null) {
        return source.replace(new RegExp(`^${$[1]}`, 'gm'), '')
    }
    return source
}

// TODO It always needs to be an array of fields because we need to be able to
// insert checkpoints, even for ostensible fixed fields like literal.

// TODO Note that if a child of a literal starts with fixed, this is only the
// length encoding, it can be merged into the checkpoint before the literal.
// This can be done by adding and `arrayed` property to everything that loops
// and merging any initial fields are are unarrayed.

// Interpret integers.
function integer (value, packed, extra = {}) {
    // Whole integers are expected to be multiples of 8-bits and if they are off
    // by one then someone applied bitwise NOT. We have to revert the bitwise
    // NOT to get the bit length. Two's compliment is indicated by a positive
    // value for bit length instead of a negative value.
    if (!packed) {
        if (Math.abs(value % 8) == 1) {
            if (value < 0) {
                return {
                    type: 'integer',
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
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: ~-value,
                endianness: 'little',
                compliment: true,
                ...extra
            }
        }
        if (value % 8 == 7) {
            return {
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: -~value,
                endianness: 'little',
                compliment: true,
                ...extra
            }
        }
    }
    // Big-endian integer. Two's compliment if the bit length is negative.
    return {
        type: 'integer',
        vivify: 'number',
        dotted: '',
        fixed: true,
        bits: Math.abs(value),
        endianness: 'big',
        compliment: value < 0,
        ...extra
    }
}

function map (definitions, packet, extra = {}, packed = false) {
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
                // **String maps**: A two element array with a number followed
                // by an array entirely of strings with more than one element.
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
                // **Literals**: Constant value padding bytes. A type definition
                // with a preceding or following literal or both. The preceding
                // or following element is defined by a either string of
                // hexidecimal or an array with a bit size as number preceding a
                // string hexidecimal value, or a string hexdecimal value
                // followed by a repeat count as number.
                } else if (
                    packet.filter(item => typeof item == 'string').length != 0 ||
                    (
                        Array.isArray(packet[0]) &&
                        packet[0].length == 2 &&
                        packet[0].filter(item => typeof item == 'string').length != 0
                    ) ||
                    (
                        Array.isArray(packet[packet.length - 1]) &&
                        packet[packet.length - 1].length == 2 &&
                        packet[packet.length - 1].filter(item => typeof item == 'string').length != 0
                    )
                ) {
                    function literal (packet, index) {
                        if (typeof packet[index] == 'string') {
                            const value = packet.splice(index, 1).pop()
                            return {
                                repeat: 1,
                                value: value,
                                bits: value.length * 4
                            }
                        // **TODO**: Ambiguity if we have literals inside
                        // literals. Would be resolved by insisting on the array
                        // surrounding the literal definition.
                        } else if (
                            Array.isArray(packet[index]) &
                            typeof packet[index][1] == 'string'
                        ) {
                            const packed = packet.splice(index, 1).pop()
                            return {
                                repeat: 1,
                                value: packed[1],
                                bits: packed[0]
                            }
                        } else if (
                            Array.isArray(packet[index]) &&
                            typeof packet[index][0] == 'string'
                        ) {
                            const repeated = packet.splice(index, 1).pop()
                            return {
                                repeat: repeated[1],
                                value: repeated[0],
                                bits: repeated[0].length * 4
                            }
                        } else {
                            return { repeat: 0, value: '', bits: 0 }
                        }
                    }
                    const sliced = packet.slice(0)
                    const before = literal(sliced, 0)
                    const after = literal(sliced, sliced.length - 1)
                    // TODO Use `field` as a common child then do bits
                    // recursively. Aren't we going by fixed anyway?
                    const fields = map(definitions, sliced[0], {}, packed)
                    // TODO Test literal wrap of a structure.
                    // TODO Test literal wrap of an array.
                    return [{
                        type: 'literal',
                        dotted: '',
                        vivify: 'descend',
                        fixed: fields[0].fixed,
                        bits: fields[0].fixed
                            ? fields[0].bits + before.repeat * before.bits
                                                + after.repeat * after.bits
                            : 0,
                        before: before,
                        fields: fields,
                        after: after,
                        ...extra
                    }]
                // **Doubles** specified with an array:
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
                // **Inline functions**: User defined functions that perform
                // inline transformations and assertions.
                } else if (
                    packet.length == 3 &&
                    Array.isArray(packet[0]) &&
                    Array.isArray(packet[packet.length - 1]) &&
                    (
                        typeof packet[0][0] == 'function' ||
                        typeof packet[packet.length - 1][0] == 'function'
                    )
                ) {
                    const inliner = function (inlined, field) {
                        if (typeof field[0] == 'function') {
                            field = field.slice()
                            const f = field.shift()
                            const inline = args(f)
                            while (field.length != 0 && typeof field[0] != 'function') {
                                inline.vargs.push(field.shift())
                            }
                            inlined.push(inline)
                            inliner(inlined, field)
                        }
                    }
                    packet = packet.slice()
                    const before = []
                    inliner(before, packet.shift().slice())
                    const after = []
                    inliner(after, packet.pop().slice())
                    const fields = map(definitions, packet[0], {})
                    return [{
                        type: 'inline',
                        // TODO Test with a structure member.
                        // TODO Test with an array member.
                        vivify: 'descend',
                        dotted: '',
                        bits: fields[0].bits,
                        fixed: fields[0].fixed,
                        ethereal: true,
                        before: before,
                        fields: fields,
                        after: after,
                        ...extra
                    }]
                // **Inline mirroed functions**: User defined functions that
                // perform inline transformations or assertions defined once for
                // both pre-serialization and post-parsing.
                } else if (
                    packet.length == 2 &&
                    Array.isArray(packet[0]) &&
                    packet[0].length == 1 &&
                    Array.isArray(packet[0][0]) &&
                    typeof packet[0][0][0] == 'function'
                ) {
                    // TODO You are repeating yourself now.
                    const inliner = function (inlined, field) {
                        if (typeof field[0] == 'function') {
                            field = field.slice()
                            const f = field.shift()
                            const inline = args(f)
                            while (field.length != 0 && typeof field[0] != 'function') {
                                inline.vargs.push(field.shift())
                            }
                            inlined.push(inline)
                            inliner(inlined, field)
                        }
                    }
                    packet = packet.slice()
                    const inlines = packet.shift()[0]
                    const before = []
                    inliner(before, inlines.slice())
                    const after = []
                    inliner(after, inlines.slice())
                    const fields = map(definitions, packet[0], {})
                    return [{
                        type: 'inline',
                        // TODO Test with a structure member.
                        // TODO Test with an array member.
                        vivify: 'descend',
                        dotted: '',
                        bits: fields[0].bits,
                        fixed: fields[0].fixed,
                        ethereal: true,
                        before: before,
                        fields: fields,
                        after: after,
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
                        return vivify == 'variant' || vivify == vivified(when.fields[0])
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
                // **Packed integers**: Defined by an object that is not an
                // array followed by a number.
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
                // **Terminated arrays**: An array followed by one or more
                // numbers representing termination bytes.
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
                // **Fixed length arrays**: Arrays of fixed length or calculated
                // length.
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
                // **Length-encoded arrays**: Length encoded by a leading
                // integer.
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
                // **Split conditionals**: Might get rid of them generally and
                // have only sipping conditionals, or at least have them the
                // only one's documented.
                } else if (
                    (packet.length == 2 || packet.length == 1) &&
                    Array.isArray(packet[0]) &&
                    typeof packet[0][0] == 'function'
                ) {
                    const fields = []
                    const serialize = function () {
                        const serialize = packet[0].slice()
                        const conditions = []
                        while (serialize.length) {
                            const first = serialize.shift()
                            if (serialize.length > 0) {
                                const second = serialize.shift()
                                conditions.push({
                                    test: {
                                        source: trim(first.toString()),
                                        arity: first.length
                                    },
                                    fields: map(definitions, second, {})
                                })
                            } else {
                                conditions.push({
                                    test: null,
                                    fields: map(definitions, first, {})
                                })
                            }
                        }
                        return { split: true, conditions }
                    } ()
                    const parse = function () {
                        const parse = packet[1].slice()
                        const sip = []
                        if (typeof parse[0] == 'number') {
                            sip.push(map(definitions, parse.shift(), {}).shift())
                            parse.push.apply(parse, parse.shift())
                        }
                        const conditions = []
                        while (parse.length) {
                            const first = parse.shift()
                            if (parse.length > 0) {
                                const second = parse.shift()
                                conditions.push({
                                    test: {
                                        source: trim(first.toString()),
                                        arity: first.length
                                    },
                                    fields: map(definitions, second, {})
                                })
                            } else {
                                conditions.push({
                                    test: null,
                                    fields: map(definitions, first, {})
                                })
                            }
                        }
                        return { sip: sip.length ? sip : null, conditions }
                    } ()
                    const vivify = parse.conditions.slice(1).reduce((vivify, condition) => {
                        return vivify == 'variant' || vivify == vivified(condition.fields[0])
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
                // **Conditionals**: TODO Come back and create a set of test
                // functions and maybe put them in an object. It would simplify
                // this ladder. Kind of don't want them named and scattered.
                //
                // TODO This is a weak test. We could test that every other
                // element is a function.
                } else if (
                    packet.length > 1 &&
                    packet.every((element, index) => {
                        return index % 2 == 1 ||
                            (
                                typeof element == 'function'  ||
                                index == packet.length - 1
                            )
                    })
                ) {
                    packet = packet.slice()
                    const fields = []
                    const conditions = []
                    while (packet.length) {
                        const first = packet.shift()
                        if (packet.length > 0) {
                            const fields = map(definitions, packet.shift(), {})
                            conditions.push({
                                body: {
                                    test: {
                                        source: trim(first.toString()),
                                        arity: first.length
                                    },
                                    fields: fields
                                },
                                bits: fields.reduce((bits, field) => {
                                    return bits == -1 || !field.fixed ? -1 : bits + field.bits
                                }, 0)
                            })
                        } else {
                            const fields = map(definitions, first, {})
                            conditions.push({
                                body: {
                                    test: null,
                                    fields: map(definitions, first, {})
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
                // *Variables*:
                } else if (
                    packet.length == 2 &&
                    typeof packet[0] == 'object' &&
                    ! Array.isArray(packet[0][0])
                ) {
                    const accumulators = Object.keys(packet[0]).map(name => {
                        const accumulator = packet[0][name]
                        switch (typeof accumulator) {
                        case 'function':
                            return {
                                type: 'function',
                                name: name,
                                ...args(accumulator)
                            }
                        default:
                            if (accumulator instanceof RegExp) {
                                return {
                                    type: 'regex',
                                    name: name,
                                    source: accumulator.toString()
                                }
                            }
                            return {
                                type: 'object',
                                name: name,
                                value: accumulator
                            }
                        }
                    })
                    const fields = map(definitions, packet[1], {})
                    return [{
                        type: 'accumulator',
                        dotted: '',
                        vivify: 'descend',
                        bits: fields[0].bits,
                        fixed: fields[0].fixed,
                        accumulators: accumulators,
                        fields: fields,
                        ...extra
                    }]
                    throw new Error('variables')
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
    throw new Error
}

module.exports = function (packets) {
    const definitions = []
    for (const packet in packets) {
        definitions.push.apply(definitions, map(definitions, packets[packet], { name: packet }))
    }
    return definitions
}
