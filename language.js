// Node.js API.
const assert = require('assert')
const util = require('util')

// Wrapper around Buffer float parsing to exclude from NYC coverage.
const inlines = require('./inlines')

// Inline function argument parser.
const args = require('./arguments')

// Compare JSON object tree.
const deepEqual = require('fast-deep-equal')

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
        const abs = Math.abs(value % 8)
        const bits = abs != 0
            ? abs == 1
                ? value < 0
                    ? ~value
                    : ~-value
                : -~value
            : Math.abs(value)
        const bytes = []
        for (let i = 0, I = bits / 8; i < I; i++) {
            bytes.push({
                mask: 0xff,
                size: 8,
                shift: (I - i - 1) * 8,
                upper: 0x0
            })
        }
        if (Math.abs(value % 8) == 1) {
            if (value < 0) {
                return {
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: ~value,
                    bytes: bytes.reverse(),
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
                bytes: bytes.reverse(),
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
                bytes: bytes.reverse(),
                bits: -~value,
                endianness: 'little',
                compliment: true,
                ...extra
            }
        }
        // Big-endian integer. Two's compliment if the bit length is negative.
        return {
            type: 'integer',
            vivify: 'number',
            dotted: '',
            fixed: true,
            bytes: bytes,
            bits: Math.abs(value),
            endianness: 'big',
            compliment: value < 0,
            ...extra
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

module.exports = function (packets) {
    const definitions = [], lookups = { values: [], index: 0 }, snippets = {}

    // Please resist the urge to refactor based on, oh look, I'm performing this
    // test twice. A single if/else ladder will be easier to return to for
    // maintainence and expansion. Outer array.

    const is = {
        ultimately: function (packet, test) {
            if (test(packet)) {
                return true
            // **TODO**: See literal ambiguities. We're going to assume we've
            // forced them into arrays.
            }
            if (typeof packet == 'string') {
                return is.ultimately(snippets[packet], test)
            }
            if (is.literal.padded(packet)) {
                if (Array.isArray(packet[0]) && packet[0].some(item => typeof item == 'string')) {
                    return is.ultimately(packet[1], test)
                }
                return is.ultimately(packet[0], test)
            }
            if (is.inline.split(packet) || is.inline.mirrored(packet)) {
                return is.ultimately(packet[1], test)
            }
            if (is.accumulator(packet)) {
                return is.ultimately(packet[packet.length - 1], test)
            }
            if (is.switched(packet)) {
                return packet[1].filter((_, index) => index % 2 == 1).every(packet => {
                    return is.ultimately(packet, test)
                })
            }
            if (is.conditional.mirrored(packet)) {
                return packet.filter((_, index) => index % 2 == 1).every(packet => {
                    return is.ultimately(packet, test)
                })
            }
            if (is.conditional.split(packet)) {
                if (!packet[0].filter((_, index) => index % 2 == 1).every(packet => {
                    return is.ultimately(packet, test)
                })) {
                    return false
                }
                const sliced = packet[1].slice()
                if (typeof sliced[0] == 'number') {
                    sliced.shift()
                }
                return sliced.filter((_, index) => index % 2 == 1).every(packet => {
                    return is.ultimately(packet, test)
                })
            }
            return false
        },
        spread: function (packet) {
            if (
                Array.isArray(packet) &&
                Number.isInteger(packet[0]) &&
                packet[0] % 8 == 0 &&
                packet[0] > 0 &&
                packet.slice(1).every(item => {
                    return (
                        Number.isInteger(item) && 0 < item && item <= 8
                    ) || (
                        Array.isArray(item) &&
                        item.length == 2 &&
                        0 <= item[0] && item[0] <= 0xff &&
                        0 < item[1] && item[1] <= 8
                    )
                })
            ) {
                const spread = packet.slice(1)
                const abs = Math.abs(packet[0] % 8)
                const bits = abs != 0
                    ? abs == 1
                        ? packet[0] < 0
                            ? ~packet[0]
                            : ~-packet[0]
                        : -~packet[0]
                    : Math.abs(packet[0])
                const bytes = bits / 8
                while (bytes < spread.length) {
                    spread.splice(1, 0, spread[1])
                }
                return bits > spread.reduce((sum, item) => {
                    return sum + (Array.isArray(item) ? item[1] : item)
                }, 0)
            }
            return false
        },
        integer: function (packet) {
            if (Number.isInteger(packet)) {
                return true
            }
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
                (
                    Array.isArray(packet[1]) &&
                    packet[1].length > 1 &&
                    packet[1].filter(value => typeof value == 'string').length == packet[1].length
                ) ||
                (
                    typeof packet[1] == 'object' &&
                    Object.keys(packet[1]).length > 1 &&
                    function () {
                        for (const key in packet[1]) {
                            if (typeof packet[1][key] != 'string') {
                                return false
                            }
                        }
                        return true
                    } ()
                )
        },
        // **Literals**: Constant value padding bytes. A type definition with a
        // preceding or following literal or both. The preceding or following
        // element is defined by a either string of hexidecimal or an array with
        // a bit size as number preceding a string hexidecimal value, or a
        // string hexdecimal value followed by a repeat count as number.
        literal: {
            pattern: function (part) {
                return (
                    typeof part == 'string' &&
                    snippets[part[0]] == null
                ) ||
                (
                    Array.isArray(part) &&
                    (
                        part.length == 1 &&
                        typeof part[0] == 'string'
                    ) ||
                    (
                        part.length == 2 &&
                        part.filter(item => typeof item == 'string').length == 1 &&
                        part.filter(item => typeof item == 'number').length == 1
                    )
                )
            },
            constant: function (packet) {
                return is.literal.pattern(packet)
            },
            padded: function (packet) {
                return Array.isArray(packet) &&
                    (
                        packet.length == 2 &&
                        (
                            is.literal.pattern(packet[0]) ||
                            is.literal.pattern(packet[1])
                        )
                    ) ||
                    (
                        packet.length == 3 &&
                        is.literal.pattern(packet[0]) &&
                        is.literal.pattern(packet[2])
                    )
            }
        },
        // **Inline functions**: User defined functions that perform inline
        // transformations and assertions.
        inline: {
            split: function (packet) {
                return Array.isArray(packet) &&
                    packet.length == 3 &&
                    Array.isArray(packet[0]) &&
                    Array.isArray(packet[packet.length - 1]) &&
                    (
                        typeof packet[0][0] == 'function' ||
                        typeof packet[packet.length - 1][0] == 'function'
                    )
            },
            // **Inline mirrored functions**: User defined functions that
            // perform inline transformations or assertions defined once for
            // both pre-serialization and post-parsing.
            mirrored: function (packet) {
                return Array.isArray(packet) &&
                    packet.length == 2 &&
                    Array.isArray(packet[0]) &&
                    packet[0].length == 1 &&
                    Array.isArray(packet[0][0]) &&
                    typeof packet[0][0][0] == 'function'
            }
        },
        // **Packed integers**: Defined by an object that is not an array
        // followed by a number.
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
                (
                    packet[0].length == 1 &&
                    (
                        is.integer(packet[0][0]) ||
                        typeof packet[0][0] == 'function'
                    )
                ) &&
                Array.isArray(packet[1]) &&
                packet[1].length == 1
        },
        // **Length-encoded arrays**: Length encoded by a leading integer.
        lengthEncoded: function (packet) {
            return packet.length == 2 &&
                Array.isArray(packet[1]) &&
                packet[1].length == 1 &&
                is.ultimately(packet[0], value => is.integer(value) || is.spread(value))
        },
        switched: function (packet) {
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
        // *Accumulators*:
        accumulator: function (packet) {
            return Array.isArray(packet) &&
                packet.length == 2 &&
                typeof packet[0] == 'object' &&
                ! Array.isArray(packet[0]) &&
                ! Array.isArray(packet[0][0])
        },
        // **Conditionals**: TODO Come back and create a set of test functions
        // and maybe put them in an object. It would simplify this ladder. Kind
        // of don't want them named and scattered.
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
                    is.conditional.ladder(array.slice(1))
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

    function map (packet, extra = {}, pack = false) {
        // **References**: References to existing packet definitions.
        function string () {
            return map(snippets[packet], extra, pack)
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

        // **BigtInt**
        function bigint () {
            return [ integer(Number(packet), pack, { ...extra, type: 'bigint', vivify: 'bigint' }) ]
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

        // **Spread**: An integer spread out across multiple bytes that may or
        // may not use every bit in that byte.
        function spread () {
            const abs = Math.abs(packet[0] % 8)
            const bits = abs != 0
                ? abs == 1
                    ? Math.abs(~packet[0])
                    : -~packet[0]
                : Math.abs(packet[0])
            let spread = packet.slice(1)
            while (spread.length < bits / 8) {
                spread.splice(1, 0, spread[1])
            }
            spread = spread.map((item, index) => {
                return Array.isArray(item)
                    ? { upper: item[0], size: item[1] }
                    : { upper: 0, size: item }
            })
            const bytes = spread.map((item, index) => {
                return {
                    shift: spread.slice(index + 1).reduce((sum, item) => sum + item.size, 0),
                    size: item.size,
                    mask: 0xff >>> 8 - item.size,
                    upper: item.upper
                }
            })
            return [ integer(packet[0], false, { ...extra, bytes }) ]
        }
        //

        // **Mapped integers**: Integers mapped to a string value.
        function mapped () {
            const lookup = function () {
                const values = JSON.parse(JSON.stringify(packet[1]))
                for (let i = 0, I = lookups.values.length; i < I; i++) {
                    if (deepEqual(values, lookups.values[i])) {
                        return {
                            index: i,
                            values: values
                        }
                        break
                    }
                }
                const index = lookups.index++
                lookups.values[index] = values
                return { index, values }
            } ()
            return map(packet[0], { lookup, ...extra }, pack)
        }

        function literal (sliced, index) {
            if (
                typeof sliced[index] == 'string' &&
                snippets[sliced[index]] == null
            ) {
                const value = sliced.splice(index, 1).pop()
                return {
                    repeat: 1,
                    value: value,
                    bits: value.length * 4
                }
            // **TODO**: Ambiguity if we have literals inside literals.
            // Would be resolved by insisting on the array surrounding the
            // literal definition.
            // **TODO**: Second ambiguity. Includes can be confused with
            // literals. May have to force literals into arrays, or else
            // force includes into arrays. Maybe let's force literals into
            // arrays since arrays are there already.
            } else if (
                Array.isArray(sliced[index]) &
                sliced[index].length == 2 &&
                typeof sliced[index][1] == 'string' &&
                snippets[sliced[index][1]] == null
            ) {
                const packed = sliced.splice(index, 1).pop()
                return {
                    repeat: 1,
                    value: packed[1],
                    bits: packed[0]
                }
            } else if (
                Array.isArray(sliced[index]) &&
                (
                    sliced[index].length == 2 ||
                    sliced[index].length == 1
                ) &&
                typeof sliced[index][0] == 'string' &&
                snippets[sliced[index][0]] == null
            ) {
                const repeated = sliced.splice(index, 1).pop()
                const repeat = repeated[1] || 1
                const value = repeat < 0
                    ? repeated[0].match(/.{1,2}/g).reverse().join('')
                    : repeated[0]
                return {
                    repeat: repeat < 0 ? ~repeat : repeat,
                    value: value,
                    bits: repeated[0].length * 4
                }
            } else {
                return { repeat: 0, value: '', bits: 0 }
            }
        }

        function constant () {
            // TODO Do not want to create and then destroy, but this gets this
            // done for now.
            const before = literal([ packet.slice() ], 0)
            return [{
                type: 'literal',
                dotted: '',
                vivify: null,
                fixed: true,
                bits: before.repeat * before.bits,
                before: before,
                after: { repeat: 0, value: '', bits: 0 },
                fields: []
            }]
        }

        // **Literals**:
        function padded() {
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
            const into = integer(packet[1], pack, {
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
            const calculated = typeof packet[0][0] == 'function'
            const length = calculated ? args([ packet[0][0] ]) : packet[0][0]
            return [{
                type: 'fixed',
                vivify: fields[0].type == 'buffer' ? 'variant' : 'array',
                dotted: '',
                ...extra,
                pad,
                calculated,
                fixed: calculated ? false : fixed,
                align: 'left',
                length: length,
                bits: calculated ? 0 : bits * packet[0][0],
                fields
            }]
        }

        function lengthEncoded () {
            const fields = []
            assert(Array.isArray(packet[1]))
            const encoding = map(packet[0], { dotted: '' })
            const element = buffered(packet[1][0]) || map(packet[1][0], {})
            assert.equal(element.length, 1, 'badness')
            fields.push({
                type: 'lengthEncoded',
                vivify: element.type == 'buffer' ? 'variant' : 'array',
                encoding: encoding,
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
                                fields: map(field, {}, pack)
                            })
                            break
                        case 'boolean':
                            conditions.push({
                                test: null,
                                fields: map(field, {}, pack)
                            })
                            break
                        }
                    }
                    return { conditions }
                } ()
                function descend (parse) {
                    const sip = []
                    if (typeof parse[0] == 'number') {
                        sip.push(map(parse.shift(), {}).shift())
                    }
                    const conditions = []
                    while (parse.length) {
                        const test = parse.shift()
                        const field = parse.shift()
                        const fields = is.conditional.sip(field)
                            ? [ descend(field.slice(0)) ]
                            : map(field, {}, pack)
                        switch (typeof test) {
                        case 'function':
                            conditions.push({ test: { ...args([ test ]) }, fields: fields })
                            break
                        case 'boolean':
                            conditions.push({ test: null, fields: fields })
                            break
                        }
                    }
                    const vivify = conditions.slice(1).reduce((vivify, condition) => {
                        return vivify == 'variant' || vivify == vivified(condition.fields[0])
                            ? vivify
                            : 'variant'
                    }, conditions[0].fields[0].vivify)
                    return {
                        type: 'parse',
                        sip: sip.length ? sip : null,
                        vivify: vivify,
                        conditions: conditions
                    }
                }
                const parse = descend(packet[1].slice())
                // TODO Is fixed if all the alternations are the same length.
                fields.push({
                    type: 'conditional',
                    dotted: '',
                    vivify: parse.vivify == 'object' ? 'variant' : parse.vivify,
                    bits: 0,
                    fixed: false,
                    split: true,
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
                    const fields = map(packet.shift(), {}, pack)
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
                    split: false,
                    serialize: {
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
                        source: util.inspect(accumulator, { depth: null })
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

        function switched () {
            const cases = []
            const copy = packet[1].slice()
            while (copy.length != 0) {
                const [ when, field ] = copy.splice(0, 2)
                if (Array.isArray(when.$_)) {
                    if (when.$_.length == 0) {
                        cases.push({
                            value: null,
                            otherwise: true,
                            fields: map(field, {}, pack)
                        })
                    } else {
                        for (const value of when.$_) {
                            cases.push({
                                value: value,
                                otherwise: false,
                                fields: map(field, {}, pack)
                            })
                        }
                    }
                } else {
                    cases.push({
                        value: when.$_,
                        otherwise: false,
                        fields: map(field, {}, pack)
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
                select: { ...args([ packet[0] ]) },
                vivify: vivify == 'object' ? 'variant' : vivify,
                stringify: ! Array.isArray(packet[1]),
                bits: bits < 0 ? 0 : bits,
                fixed: bits > 0,
                cases: cases
            }]
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
            else if (is.spread(packet)) return spread()
            else if (is.mapped(packet)) return mapped()
            else if (is.literal.constant(packet)) return constant()
            else if (is.literal.padded(packet)) return padded()
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
            else if (is.switched(packet)) return switched()
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
        case 'bigint': return bigint()
        case 'object': return object()
        }

        throw new Error
    }
    // TODO If I'm ever able to parse from root, then I'll go ahead and add all
    // the snippets as well.
    for (const packet in packets) {
        if (packet[0] == '$') {
            snippets[packet] = packets[packet]
        } else {
            definitions.push(map(packets[packet], { name: packet }).shift())
        }
    }
    return definitions
}
