const fs = require('fs')
const path = require('path')
const util = require('util')
const coalesce = require('extant')
const $ = require('programmatic')
const assert = require('assert')

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

function compiler ({ object, file, source }) {
    fs.writeFileSync(file, $(`
        module.exports = function ({ ${object} }) {
            `, source, `
        }
    `) + '\n')
}

module.exports = function (okay, options) {
    options.objects.forEach(function (actual, index) {
        const name = `${options.name}${options.objects.length == 1 ? '' : ` ${index + 1}`}`
        const intermediate = simplified(options.define)
        const filename = path.resolve(__filename, '../../generated/' + options.name)
        const compile = coalesce(options.compile, true)
        const required = coalesce(options.require, {})
        fs.mkdirSync(path.dirname(filename), { recursive: true })
        const packet = {
            parsers: { all: {}, inc: {}, bff: {} },
            serializers: { all: {}, inc: {}, bff: {} },
            sizeOf: {}
        }

        if (compile) {
            compiler({
                object: 'sizeOf',
                file: `${filename}.sizeof.js`,
                source: composers.sizeOf(intermediate, { require: required })
            })
        }
        require(`${filename}.sizeof.js`)(packet)
        const sizeOf = packet.sizeOf.object(actual)

        if (options.stopAt == 'sizeof') {
            console.log('sizeof', sizeOf)
            okay.inc(1)
            okay(true, `${options.name} sizeof`)
            return
        }

        if (compile) {
            compiler({
                object: 'serializers',
                file: `${filename}.serializer.all.js`,
                source: composers.serializer.all(intermediate, { require: required })
            })
        }
        require(`${filename}.serializer.all.js`)(packet)

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

        if (compile) {
            compiler({
                object: 'parsers',
                file: `${filename}.parser.all.js`,
                source: composers.parser.all(intermediate, { require: required })
            })
        }
        require(`${filename}.parser.all.js`)(packet)

        okay.inc(1)

        function fast (object) {
            if (typeof object == 'object' && object != null) {
                assert(%HasFastProperties(object))
                if (Array.isArray(object)) {
                    for (const element of object) {
                        fast(element)
                    }
                } else {
                    for (const key in object) {
                        fast(object[key])
                    }
                }
            }
        }

        function concat (object) {
            if (typeof object == 'object') {
                if (Array.isArray(object)) {
                    for (const element of object) {
                        concat(element)
                    }
                } else {
                    for (const key in object) {
                        if (Array.isArray(object[key]) && Buffer.isBuffer(object[key][0])) {
                            object[key] = [ Buffer.concat(object[key]) ]
                        } else {
                            concat(object[key])
                        }
                    }
                }
            }
        }

        try {
            const object = packet.parsers.all.object(expected, 0)
            fast(object)
            concat(object)
            concat(actual)
            okay(object, actual, `${name} whole parse`)
        } catch (error) {
            console.log(packet.parsers.all.object.toString())
            throw error
        }

        if (options.stopAt == 'parse.all') {
            return
        }

        if (compile) {
            compiler({
                object: 'serializers',
                file: `${filename}.serializer.inc.js`,
                source: composers.serializer.inc(intermediate, { require: required })
            })
        }
        require(`${filename}.serializer.inc.js`)(packet)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.inc.object(actual), start
                {
                    const slice = buffer.slice(0, buffer.length - i)
                    ; ({ start, serialize } = serialize(slice, 0, buffer.length - i))
                }
                const partial = start
                if (serialize != null) {
                    const slice = buffer.slice(start, buffer.length)
                    ; ({ start, serialize } = serialize(slice, 0, buffer.length - start))
                }
                okay({ start, partial, serialize, buffer: buffer.toJSON().data }, {
                    start: i == 0 ? buffer.length : buffer.length - partial,
                    partial: buffer.length - i,
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

        if (compile) {
            compiler({
                object: 'parsers',
                file: `${filename}.parser.inc.js`,
                source: composers.parser.inc(intermediate, { require: required })
            })
        }
        require(`${filename}.parser.inc.js`)(packet)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.inc.object(actual), start, object
                {
                    const slice = expected.slice(0, expected.length - i)
                    ; ({ start, object, parse } = parse(slice, 0, expected.length - i))
                }
                const partial = start
                if (parse != null) {
                    const slice = expected.slice(start, expected.length)
                    ; ({ start, object, parse } = parse(slice, 0, expected.length - start))
                }
                concat(object)
                concat(actual)
                okay({ start, partial, parse, object }, {
                    start: i == 0 ? expected.length : expected.length - partial,
                    partial: expected.length - i,
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

        if (compile) {
            compiler({
                object: 'serializers',
                file: `${filename}.serializer.bff.js`,
                source: composers.serializer.all(intermediate, {
                    bff: true,
                    require: required
                })
            })
        }
        require(`${filename}.serializer.bff.js`)(packet)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                const buffer = Buffer.alloc(sizeOf)
                let serialize = packet.serializers.bff.object(actual), start
                {
                    const slice = buffer.slice(0, buffer.length - i)
                    ; ({ start, serialize } = serialize(slice, 0, buffer.length - i))
                }
                const partial = start
                if (serialize != null) {
                    const slice = buffer.slice(start, buffer.length)
                    ; ({ start, serialize } = serialize(slice, 0, buffer.length - start))
                }
                okay({ start, partial, serialize, buffer: buffer.toJSON().data }, {
                    start: i == 0 ? buffer.length : buffer.length - partial,
                    partial: buffer.length - i,
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

        if (compile) {
            compiler({
                object: 'parsers',
                file: `${filename}.parser.bff.js`,
                source: composers.parser.all(intermediate, {
                    bff: true,
                    require: required
                })
            })
        }
        require(`${filename}.parser.bff.js`)(packet)

        okay.inc(sizeOf + 1)

        try {
            for (let i = 0; i <= expected.length; i++) {
                let parse = packet.parsers.bff.object(actual), start, object
                {
                    const slice = expected.slice(0, expected.length - i)
                    ; ({ start, object, parse } = parse(slice, 0, expected.length - i))
                }
                const partial = start
                if (parse != null) {
                    const slice = expected.slice(start, expected.length)
                    ; ({ start, object, parse } = parse(slice, 0, expected.length - start))
                }
                concat(object)
                concat(actual)
                okay({ start, partial, parse, object }, {
                    start: i == 0 ? expected.length : expected.length - partial,
                    partial: expected.length - i,
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
