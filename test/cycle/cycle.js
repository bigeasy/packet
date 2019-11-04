var path = require('path')
var compiler = require('../../require')
var transmogrify = require('../../transmogrifier')
var util = require('util')
var toJSON = require('../to-json')

const simplified = require('../../simplified')

// TODO: Make compiler a function that takes a prefix, then compile the four.
var composers = {
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
            parse: { all: {}, inc: {}, bff: {} },
            serialize: { all: {}, inc: {}, bff: {} },
            sizeOf: {}
        }
        composers.parser.inc(
            compiler('parse', filename + '.parser.inc.js'),
            intermediate
        )(packet.parse)
        composers.parser.all(
            compiler('parse', filename + '.parser.all.js'),
            intermediate
        )(packet.parse)
        composers.serializer.inc(
            compiler('serializers', filename + '.serializer.inc.js'),
            intermediate
        )(packet.serialize)
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.all.js'),
            intermediate
        )(packet.serialize)
        composers.serializer.inc(
            compiler('serializers', filename + '.serializer.inc.js'),
            intermediate
        )(packet.serialize)
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.bff.js'),
            intermediate,
            { bff: true }
        )(packet.serialize)
        composers.sizeOf(
            compiler('sizeOf', filename + '.sizeof.js'),
            intermediate
        )(packet.sizeOf)

        const sizeOf = packet.sizeOf.object(options.object)

        const expected = Buffer.alloc(sizeOf)

        const serialize = packet.serialize.all.object(options.object)
        const cursor = serialize(expected, 0, expected.length)
        okay.inc(2 + (sizeOf * 3) + 3)
        okay(cursor, {
            start: expected.length,
            serialize: null
        }, 'whole serialize')

        try {
            const object = packet.parse.all.object(expected, 0)
            okay(object, options.object, 'whole parse')
        } catch (error) {
            console.log(packet.parse.all.object.toString())
            throw error
        }

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serialize.inc.object(options.object), start
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
            console.log(packet.serialize.inc.object.toString())
            throw error
        }

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parse.inc.object(options.object), start, object
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
            console.log(packet.parse.inc.object.toString())
            throw error
        }

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serialize.bff.object(options.object), start
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
            console.log(packet.serialize.bff.object.toString())
            throw error
        }
    }
}
