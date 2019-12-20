const path = require('path')
const compiler = require('../../require')
const util = require('util')
const toJSON = require('../to-json')

const simplified = require('../../simplified')

// TODO: Make compiler a function that takes a prefix, then compile the four.
const composers = {
    parser: {
        inc: require('../../parse.inc'),
        all: require('../../parse.all')
    },
    serializer: {
        inc: require('../../serialize.inc'),
        all: require('../../serialize.all')
    },
    sizeOf: require('../../sizeof')
}

module.exports = function (okay) {
    return function (options) {
        const intermediate = simplified(options.define)
        const filename = path.resolve(__filename, '../../generated/' + options.name)
        const packet = {
            parsers: { all: {}, inc: {}, bff: {} },
            serializers: { all: {}, inc: {}, bff: {} },
            sizeOf: {}
        }
        composers.sizeOf(
            compiler('sizeOf', filename + '.sizeof.js'),
            intermediate
        )(packet.sizeOf)

        const sizeOf = packet.sizeOf.object(options.object)

        if (options.stopAt == 'sizeOf') {
            console.log('sizeOf', sizeOf)
            return
        }
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.all.js'),
            intermediate
        )(packet.serializers)

        const expected = Buffer.alloc(sizeOf)

        const serialize = packet.serializers.all.object(options.object)
        const cursor = serialize(expected, 0, expected.length)
        okay.inc(1)
        okay(cursor, {
            start: expected.length,
            serialize: null
        }, 'whole serialize')

        if (options.stopAt == 'serialize.all') {
            console.log('serialize.all', expected.toJSON().data.map(b => b.toString(16)))
            return
        }

        composers.parser.inc(
            compiler('parsers', filename + '.parser.inc.js'),
            intermediate
        )(packet.parsers)
        composers.parser.all(
            compiler('parsers', filename + '.parser.all.js'),
            intermediate
        )(packet.parsers)
        composers.parser.all(
            compiler('parsers', filename + '.parser.bff.js'),
            intermediate,
            { bff: true }
        )(packet.parsers)
        composers.serializer.inc(
            compiler('serializers', filename + '.serializer.inc.js'),
            intermediate
        )(packet.serializers)
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.bff.js'),
            intermediate,
            { bff: true }
        )(packet.serializers)

        okay.inc(1)

        try {
            const object = packet.parsers.all.object(expected, 0)
            okay(object, options.object, 'whole parse')
        } catch (error) {
            console.log(packet.parsers.all.object.toString())
            throw error
        }

        if (options.stopAt == 'serialize.incremental') {
            return
        }

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.inc.object(options.object), start
                {
                    ({ start, serialize } = serialize(buffer, 0, buffer.length - i))
                }
                if (serialize != null) {
                    ({ start, serialize } = serialize(buffer, start, buffer.length))
                }
                okay({ start, serialize, buffer: buffer.toJSON().data }, {
                    start: buffer.length,
                    serialize: null,
                    buffer: expected.toJSON().data
                }, `incremental serialize ${i}`)
            }
        } catch (error) {
            console.log(packet.serializers.inc.object.toString())
            throw error
        }

        if (options.stopAt == 'parse.incremental') {
            return
        }

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.inc.object(options.object), start, object
                {
                    ({ start, object, parse } = parse(expected, 0, expected.length - i))
                }
                if (parse != null) {
                    ({ start, object, parse } = parse(expected, start, expected.length))
                }
                okay({ start, parse, object }, {
                    start: expected.length,
                    parse: null,
                    object: options.object
                }, `incremental parse ${i}`)
            }
        } catch (error) {
            console.log(packet.parsers.inc.object.toString())
            throw error
        }

        if (options.stopAt == 'serialize.bff') {
            return
        }

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.bff.object(options.object), start
                {
                    ({ start, serialize } = serialize(buffer, 0, buffer.length - i))
                }
                if (serialize != null) {
                    ({ start, serialize } = serialize(buffer, start, buffer.length))
                }
                okay({ start, serialize, buffer: buffer.toJSON().data }, {
                    start: buffer.length,
                    serialize: null,
                    buffer: expected.toJSON().data
                }, `best-foot-forward serialize ${i}`)
            }
        } catch (error) {
            console.log(packet.serializers.bff.object.toString())
            throw error
        }

        if (options.stopAt == 'parse.bff') {
            return
        }

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.bff.object(options.object), start, object
                {
                    ({ start, object, parse } = parse(expected, 0, expected.length - i))
                }
                if (parse != null) {
                    ({ start, object, parse } = parse(expected, start, expected.length))
                }
                okay({ start, parse, object }, {
                    start: expected.length,
                    parse: null,
                    object: options.object
                }, `best-foot-forward parse ${i}`)
            }
        } catch (error) {
            console.log(packet.parsers.bff.object.toString())
            throw error
        }
    }
}
