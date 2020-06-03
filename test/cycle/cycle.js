const path = require('path')
const compiler = require('../../require')
const util = require('util')

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

module.exports = function (okay, options) {
    options.objects.forEach(function (actual, index) {
        const name = `${options.name}${options.objects.length == 1 ? '' : ` ${index + 1}`}`
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

        const sizeOf = packet.sizeOf.object(actual)

        if (options.stopAt == 'sizeof') {
            console.log('sizeof', sizeOf)
            okay.inc(1)
            okay(true, `${options.name} sizeof`)
            return
        }
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.all.js'),
            intermediate
        )(packet.serializers)

        const expected = Buffer.alloc(sizeOf)

        const serialize = packet.serializers.all.object(actual)
        const cursor = serialize(expected, 0, expected.length)
        okay.inc(1)
        okay(cursor, {
            start: expected.length,
            serialize: null
        }, `${name} whole serialize`)

        if (options.stopAt == 'serialize.all') {
            console.log('serialize.all', expected.toJSON().data.map(b => b.toString(16)))
            return
        }

        composers.parser.all(
            compiler('parsers', filename + '.parser.all.js'),
            intermediate
        )(packet.parsers)

        okay.inc(1)

        try {
            okay(packet.parsers.all.object(expected, 0), actual, `${name} whole parse`)
        } catch (error) {
            console.log(packet.parsers.all.object.toString())
            throw error
        }

        if (options.stopAt == 'parse.all') {
            return
        }

        composers.serializer.inc(
            compiler('serializers', filename + '.serializer.inc.js'),
            intermediate
        )(packet.serializers)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.inc.object(actual), start
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
                }, `${name} incremental serialize ${i}`)
            }
        } catch (error) {
            console.log(packet.serializers.inc.object.toString())
            throw error
        }

        if (options.stopAt == 'serialize.inc') {
            return
        }

        okay.inc(sizeOf + 1)

        composers.parser.inc(
            compiler('parsers', filename + '.parser.inc.js'),
            intermediate
        )(packet.parsers)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.inc.object(actual), start, object
                {
                    ({ start, object, parse } = parse(expected, 0, expected.length - i))
                }
                if (parse != null) {
                    ({ start, object, parse } = parse(expected, start, expected.length))
                }
                okay({ start, parse, object }, {
                    start: expected.length,
                    parse: null,
                    object: actual
                }, `${name} incremental parse ${i}`)
            }
        } catch (error) {
            console.log(packet.parsers.inc.object.toString())
            throw error
        }

        if (options.stopAt == 'parse.inc') {
            return
        }
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.bff.js'),
            // () => require(filename + '.serializer.bff.js'),
            intermediate,
            { bff: true }
        )(packet.serializers)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.bff.object(actual), start
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
                }, `${name} best-foot-forward serialize ${i}`)
            }
        } catch (error) {
            console.log(packet.serializers.bff.object.toString())
            throw error
        }

        if (options.stopAt == 'serialize.bff') {
            return
        }

        composers.parser.all(
            compiler('parsers', filename + '.parser.bff.js'),
            intermediate,
            { bff: true }
        )(packet.parsers)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.bff.object(actual), start, object
                {
                    ({ start, object, parse } = parse(expected, 0, expected.length - i))
                }
                if (parse != null) {
                    ({ start, object, parse } = parse(expected, start, expected.length))
                }
                okay({ start, parse, object }, {
                    start: expected.length,
                    parse: null,
                    object: actual
                }, `${name} best-foot-forward parse ${i}`)
            }
        } catch (error) {
            console.log(packet.parsers.bff.object.toString())
            throw error
        }
    })
}
