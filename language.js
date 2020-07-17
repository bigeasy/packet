// Node.js API.
const assert = require('assert')

// Return the first non-null value.
const coalesce = require('extant')

// Wrapper around Buffer float parsing to exclude from NYC coverage.
const inlines = require('./inlines')

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

// TODO It always needs to be an array of fields because we need to be able to
// insert checkpoints, even for ostensible fixed fields like literal.

// TODO Note that if a child of a literal starts with fixed, this is only the
// length encoding, it can be merged into the checkpoint before the literal.
// This can be done by adding and `arrayed` property to everything that loops
// and merging any initial fields are are unarrayed.

// Interpret integers.
function integer (value, pack, extra = {}) {
    // Whole integers are expected to be multiples of 8-bits and if they are off
    // by one then someone applied bitwise NOT. We have to revert the bitwise
    // NOT to get the bit length. Two's compliment is indicated by a positive
    // value for bit length instead of a negative value.
    if (!pack) {
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

function buffered (field) {
    if (field === Buffer) {
        return [{
            type: 'buffer',
            vivify: 'number',
            dotted: '',
            concat: true,
            bits: 8,
            fixed: true,
            dotted: '',
            endianness: 'big',
            compliment: false
        }]
    }
    if (
        Array.isArray(field) &&
        field.length == 1 &&
        field[0] === Buffer
    ) {
        return [{
            type: 'buffer',
            vivify: 'number',
            dotted: '',
            concat: false,
            bits: 8,
            fixed: true,
            endianness: 'big',
            compliment: false
        }]
    }
    return null
}

// Please resist the urge to refactor based on, oh look, I'm performing this
// test twice. A single if/else ladder will be easier to return to for
// maintainence and expansion. Outer array.

const is = {
    integer: function (packet) {
        return Number.isInteger(packet)
    },
    absent: function (packet) {
        return packet == null || (
            Array.isArray(packet) && packet.length == 0
        )
    },
    ieee: {
        // A floating point number whose integer part is 64 or 32.
        shorthand: function (packet) {
            const floor = Math.floor(packet)
            return packet - floor != 0 && (floor == 64 || floor == 32)
        },
        explicit: function (packet) {
            return packet.length == 2 &&
                typeof packet[0] == 'number' &&
                Math.floor(packet[0]) == 0 &&
                (
                    packet[0] * 100 ==  packet[1] ||
                    packet[0] * 100 == ~packet[1]
                )
        }
    },
    // **Mapped integers**: A two element array with an integer defintion
    // followed by an array entirely of strings with more than one element.
    mapped: function (packet) {
        return packet.length == 2 &&
            is.integer(packet[0]) &&
            Array.isArray(packet[1]) &&
            packet[1].length > 1 &&
            packet[1].filter(value => typeof value == 'string').length == packet[1].length
    },
    // **Literals**: Constant value padding bytes. A type definition with a
    // preceding or following literal or both. The preceding or following
    // element is defined by a either string of hexidecimal or an array with a
    // bit size as number preceding a string hexidecimal value, or a string
    // hexdecimal value followed by a repeat count as number.
    literal: function (packet) {
        return packet.filter(item => typeof item == 'string').length != 0 ||
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
    },
    // **Inline functions**: User defined functions that perform inline
    // transformations and assertions.
    inline: {
        split: function (packet) {
            return packet.length == 3 &&
                Array.isArray(packet[0]) &&
                Array.isArray(packet[packet.length - 1]) &&
                (
                    typeof packet[0][0] == 'function' ||
                    typeof packet[packet.length - 1][0] == 'function'
                )
        },
        // **Inline mirrored functions**: User defined functions that perform
        // inline transformations or assertions defined once for both
        // pre-serialization and post-parsing.
        mirrored: function (packet) {
            return packet.length == 2 &&
                Array.isArray(packet[0]) &&
                packet[0].length == 1 &&
                Array.isArray(packet[0][0]) &&
                typeof packet[0][0][0] == 'function'
        }
    },
    // **Packed integers**: Defined by an object that is not an array followed
    // by a number.
    packed: function (packet) {
        return typeof packet[0] == 'object' &&
            ! Array.isArray(packet[0]) &&
            typeof packet[1] == 'number'
    },
    // **Terminated arrays**: An array followed by one or more numbers
    // representing termination bytes.
    terminated: function (packet) {
        return Array.isArray(packet[0]) &&
            typeof packet[1] == 'number'
    },
    // **Fixed length arrays**: Arrays of fixed length or calculated length.
    fixed: function (packet) {
        return Array.isArray(packet[0]) &&
            typeof packet[0][0] == 'number' &&
            Array.isArray(packet[1])
    },
    // **Length-encoded arrays**: Length encoded by a leading integer.
    lengthEncoded: function (packet) {
        return packet.length == 2 &&
            typeof packet[0] == 'number'
    },
    switched: {
        variant: function (packet) {
            return typeof packet[0] == 'function' &&
                Array.isArray(packet[1]) &&
                packet[1].length % 2 == 0 &&
                packet[1].filter((value, index) => {
                    return index % 2 == 1 ||
                    (
                        typeof value == 'object' &&
                        (
                            (
                                Object.keys(value).length == 1 &&
                                ('$_' in value)
                            ) ||
                            (
                                Object.keys(value).length == 0 &&
                                index == packet[1].length - 2
                            )
                        )
                    )
                }).length == packet[1].length
        },
        stringified: function (packet) {
            return typeof packet[0] == 'function' &&
                typeof packet[1] == 'object' &&
                ! Array.isArray(packet[1]) &&
                (
                    packet.length == 2 || packet.length == 3
                )
        }
    },
    // *Accumulators*:
    accumulator: function (packet) {
        return packet.length == 2 &&
            typeof packet[0] == 'object' &&
            ! Array.isArray(packet[0][0])
    },
    // **Conditionals**: TODO Come back and create a set of test functions and
    // maybe put them in an object. It would simplify this ladder. Kind of don't
    // want them named and scattered.
    //
    // TODO This is a weak test. We could test that every other element is a
    // function.
    conditional: {
        ladder: function (array) {
            if (!Array.isArray(array) || array.length % 2 != 0) {
                return false
            }
            if (typeof array[array.length - 2] == 'boolean') {
                array = array.slice(0, array.length - 2)
            } else if (array.length < 4) {
                return false
            }
            return array.filter((value, index) => {
                return index % 2 == 1 || typeof value == 'function'
            }).length == array.length
        },
        sip: function (array) {
            return typeof array[0] == 'number' &&
                is.conditional.ladder(array[1])
        },
        split: function (packet) {
            return packet.length == 2 &&
                is.conditional.ladder(packet[0]) &&
                (
                    is.conditional.ladder(packet[1]) ||
                    is.conditional.sip(packet[1])
                )

        },
        mirrored: function (packet) {
            return is.conditional.ladder(packet)
        }
    }
}


module.exports = function (packets) {
    const definitions = []

    function map (packet, extra = {}, pack = false) {
        // **References**: References to existing packet definitions.
        function string () {
            return [{ ...extra, ...definitions[packet] }]
        }

        const ieee = {
            shorthand: function () {
                const fractional = packet - Math.floor(packet) != 0
                switch (Math.floor(packet)) {
                case 64:
                    if (fractional == 0.46) {
                        return map([ 0.64, ~64 ], extra)
                    }
                    return map([ 0.64, 64 ], extra)
                case 32:
                default:
                    if (fractional == 0.23) {
                        return map([ 0.32, ~32 ], extra)
                    }
                    return map([ 0.32, 32 ], extra)
                }
            },
            explicit: function () {
                if (Math.abs(packet[1]) % 8 == 1) {
                    const bits = Math.abs(packet[1] + 1)
                    assert.equal(packet[0] * 100, bits, 'bits mismatch')
                    switch (bits) {
                    case 64:
                        return map([[
                            inlines.writeDoubleLE
                        ], [[ 8 ], [ Buffer ]], [
                            inlines.readDoubleLE
                        ]], extra)
                    case 32:
                        return map([[
                            inlines.writeFloatLE
                        ], [[ 4 ], [ Buffer ]], [
                            inlines.readFloatLE
                        ]], extra)
                    }
                }
                assert.equal(packet[0] * 100, packet[1], 'bits mismatch')
                switch (packet[1]) {
                case 64:
                    return map([[
                        inlines.writeDoubleBE
                    ], [[ 8 ], [ Buffer ]], [
                        inlines.readDoubleBE
                    ]], extra)
                case 32:
                    return map([[
                        inlines.writeFloatBE
                    ], [[ 4 ], [ Buffer ]], [
                        inlines.readFloatBE
                    ]], extra)
                }
            }
        }
        //

        // **Integers or IEEE754 shorthand**:
        function number () {
            if (is.ieee.shorthand(packet)) return ieee.shorthand()
            else return [ integer(packet, pack, extra) ]
        }
        //

        // **Absent**: A `null` or empty array `[]` on parse, ignored on
        // serialize. Used when there should be no value, combined with
        // conditionals to implement optional fields.
        function absent (value) {
            return [{
                ...extra,
                type: 'absent',
                vivify: value == null ? 'variant' : 'array',
                value: value,
                bits: 0,
                fixed: true
            }]
        }
        //

        // **Mapped integers**: Integers mapped to a string value.
        function mapped () {
            return map(packet[0], { lookup: packet[1].slice(), ...extra }, pack)
        }

        // **Literals**:
        function literal() {
            function literal (packet, index) {
                if (typeof packet[index] == 'string') {
                    const value = packet.splice(index, 1).pop()
                    return {
                        repeat: 1,
                        value: value,
                        bits: value.length * 4
                    }
                // **TODO**: Ambiguity if we have literals inside literals.
                // Would be resolved by insisting on the array surrounding the
                // literal definition.
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
            // TODO Use `field` as a common child then do bits recursively.
            // Aren't we going by fixed anyway?
            const fields = map(sliced[0], {}, pack)
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
        }
        //

        //
        const inline = {
            inliner: function (inlined, array) {
                while (array.length != 0) {
                    inlined.push(args(array))
                }
            },
            split: function () {
                const define = packet.slice()
                const before = []
                inline.inliner(before, define.shift().slice())
                const after = []
                inline.inliner(after, define.pop().slice())
                const fields = map(define[0], {})
                return [{
                    type: 'inline',
                    // TODO Test with a structure member.
                    // TODO Test with an array member.
                    vivify: 'descend',
                    dotted: '',
                    bits: fields[0].bits,
                    fixed: fields[0].fixed,
                    before: before,
                    fields: fields,
                    after: after,
                    ...extra
                }]
            },
            mirrored: function () {
                const inlines = packet[0][0]
                const before = []
                inline.inliner(before, inlines.slice())
                const after = []
                inline.inliner(after, inlines.slice())
                const fields = map(packet[1], {})
                return [{
                    type: 'inline',
                    // TODO Test with a structure member.
                    // TODO Test with an array member.
                    vivify: 'descend',
                    dotted: '',
                    bits: fields[0].bits,
                    fixed: fields[0].fixed,
                    before: before,
                    fields: fields,
                    after: after,
                    ...extra
                }]
            }
        }

        function packed () {
            const fields = []
            for (const name in packet[0]) {
                fields.push.apply(fields, map(packet[0][name], {
                    name: name, dotted: `.${name}`
                }, true))
            }
            const into = integer(packet[1], true, {
                vivify: 'object',
                ...extra
            })
            return [{ ...into, fields, ...extra }]
        }

        function terminated () {
            const terminator = []
            for (let i = 1, I = packet.length; i < I; i++) {
                terminator.push(packet[i])
            }
            const fields = buffered(packet[0][0]) || map(packet[0][0], {})
            return [{
                dotted: '',
                ...extra,
                type: 'terminated',
                vivify: fields[0].type == 'buffer' ? 'variant' : 'array',
                bits: 0,
                fixed: false,
                terminator: terminator,
                fields: fields
            }]
        }

        function fixed () {
            const pad = []
            const slice = packet.slice(2)
            while (typeof slice[0] == 'number')  {
                pad.push(slice.shift())
            }
            const fields = buffered(packet[1][0]) || map(packet[1][0], {})
            const fixed = fields.filter(field => ! field.fixed).length == 0
            const bits = fixed
                       ? fields.reduce((bits, field) => bits + field.bits, 0)
                       : 0
            return [{
                type: 'fixed',
                vivify: fields[0].type == 'buffer' ? 'variant' : 'array',
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
        }

        function lengthEncoded () {
            const fields = []
            assert(Array.isArray(packet[1]))
            const encoding = integer(packet[0], false, {})
            const element = buffered(packet[1][0]) || map(packet[1][0], {})
            assert.equal(element.length, 1, 'badness')
            fields.push({
                type: 'lengthEncoded',
                vivify: element.type == 'buffer' ? 'variant' : 'array',
                encoding: [ encoding ],
                dotted: '',
                bits: 0,
                fixed: false,
                // TODO Length encode a structure.
                fields: [ element[0] ],
                ...extra
            })
            return fields
        }

        const conditional = {
            split: function () {
                const fields = []
                const serialize = function () {
                    const serialize = packet[0].slice()
                    const conditions = []
                    while (serialize.length) {
                        const test = serialize.shift()
                        const field = serialize.shift()
                        switch (typeof test) {
                        case 'function':
                            conditions.push({
                                test: { ...args([ test ]) },
                                fields: map(field, {})
                            })
                            break
                        case 'boolean':
                            conditions.push({
                                test: null,
                                fields: map(field, {})
                            })
                            break
                        }
                    }
                    return { split: true, conditions }
                } ()
                const parse = function () {
                    const parse = packet[1].slice()
                    const sip = []
                    if (typeof parse[0] == 'number') {
                        sip.push(map(parse.shift(), {}).shift())
                        parse.push.apply(parse, parse.shift())
                    }
                    const conditions = []
                    while (parse.length) {
                        const test = parse.shift()
                        const field = parse.shift()
                        switch (typeof test) {
                        case 'function':
                            conditions.push({
                                test: { ...args([ test ]) },
                                fields: map(field, {})
                            })
                            break
                        case 'boolean':
                            conditions.push({
                                test: null,
                                fields: map(field, {})
                            })
                            break
                        }
                    }
                    return { sip: sip.length ? sip : null, conditions }
                } ()
                const vivify = parse.conditions.slice(1).reduce((vivify, condition) => {
                    return vivify == 'variant' || vivify == vivified(condition.fields[0])
                        ? vivify
                        : 'variant'
                }, parse.conditions[0].fields[0].vivify)
                // TODO Is fixed if all the alternations are the same length.
                fields.push({
                    type: 'conditional',
                    vivify: vivify == 'object' ? 'variant' : vivify,
                    bits: 0,
                    fixed: false,
                    serialize, parse, ...extra
                })
                return fields
            },
            mirrored: function () {
                packet = packet.slice()
                const fields = []
                const conditions = []
                while (packet.length) {
                    const test = packet.shift()
                    const fields = map(packet.shift(), {})
                    switch (typeof test) {
                    case 'function':
                        conditions.push({
                            body: {
                                test: { ...args([ test ]) },
                                fields: fields
                            },
                            bits: fields.reduce((bits, field) => {
                                return bits == -1 || !field.fixed ? -1 : bits + field.bits
                            }, 0)
                        })
                        break
                    case 'boolean':
                        conditions.push({
                            body: {
                                test: null,
                                fields: fields
                            },
                            bits: fields.reduce((bits, field) => {
                                return bits == -1 || !field.fixed ? -1 : bits + field.bits
                            }, 0)
                        })
                        break
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
            }
        }

        function accumulator () {
            const accumulators = Object.keys(packet[0]).map(name => {
                const accumulator = packet[0][name]
                switch (typeof accumulator) {
                case 'function':
                    return {
                        type: 'function',
                        name: name,
                        ...args([ accumulator ])
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
            const fields = map(packet[1], {})
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
        }

        const switched = {
            node: function (cases) {
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
                    select: { ...args([ packet[0] ]) },
                    vivify: vivify == 'object' ? 'variant' : vivify,
                    stringify: ! Array.isArray(packet[1]),
                    bits: bits < 0 ? 0 : bits,
                    fixed: bits > 0,
                    cases: cases
                }]
            },
            stringified: function () {
                const cases = []
                for (const value in packet[1]) {
                    cases.push({
                        value: value,
                        otherwise: false,
                        fields: map(packet[1][value], {})
                    })
                }
                if (packet.length > 2) {
                    cases.push({
                        value: null,
                        otherwise: true,
                        fields: map(packet[2], {})
                    })
                }
                return switched.node(cases)
            },
            variant: function () {
                const cases = []
                const copy = packet[1].slice()
                while (copy.length != 0) {
                    const [ when, field ] = copy.splice(0, 2)
                    if ('$_' in when) {
                        cases.push({
                            value: when.$_,
                            otherwise: false,
                            fields: map(field, {})
                        })
                    } else {
                        cases.push({
                            value: null,
                            otherwise: true,
                            fields: map(field, {})
                        })
                    }
                }
                return switched.node(cases)
            }
        }
        //

        // **Structure**: Group fields into an object. Does not add any
        // structure to the underlying binary representation, merely groups them
        // in the serialized/parsed JavaScript object.
        function structure () {
            const fields = []
            for (const name in packet) {
                fields.push.apply(fields, map(packet[name], {
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

        function array () {
            if (is.absent(packet)) return absent([])
            else if (is.mapped(packet)) return mapped()
            else if (is.literal(packet)) return literal()
            else if (is.ieee.explicit(packet)) return ieee.explicit()
            else if (is.inline.split(packet)) return inline.split()
            else if (is.inline.mirrored(packet)) return inline.mirrored()
            else if (is.packed(packet)) return packed()
            else if (is.terminated(packet)) return terminated()
            else if (is.fixed(packet)) return fixed()
            else if (is.lengthEncoded(packet)) return lengthEncoded()
            else if (is.conditional.split(packet)) return conditional.split()
            else if (is.conditional.mirrored(packet)) return conditional.mirrored()
            else if (is.accumulator(packet)) return accumulator()
            else if (is.switched.variant(packet)) return switched.variant()
            else if (is.switched.stringified(packet)) return switched.stringified()
            else throw new Error('unknown')
        }

        function object () {
            if (Array.isArray(packet)) return array()
            else if (is.absent(packet)) return absent(null)
            else return structure()

        }

        switch (typeof packet) {
        case 'string': return string()
        case 'number': return number()
        case 'object': return object()
        }

        throw new Error
    }
    for (const packet in packets) {
        definitions.push(map(packets[packet], { name: packet }).shift())
    }
    return definitions
}
