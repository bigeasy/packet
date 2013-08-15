module.exports = require('proof')(function (counter, equal, deepEqual, ok) {
    var createParser = require('../..').createParser

    var slice = Function.prototype.call.bind(Array.prototype.slice)

    function parseEqual () {
        var extracted = slice(arguments, 0)
        var message = extracted.pop()
        var options


        if (typeof extracted[0] == 'object') {
            options = extracted.shift()
        } else {
            options = {}
        }

        var object = {}
        var parserOptions = {}
        for (var key in options) {
            parserOptions[key] = options[key]
            object[key] = options[key]
        }

        object.message = message
        object.options = parserOptions
        object.pattern = extracted.shift()
        object.bytes = extracted.shift()
        object.length = extracted.shift()
        object.expected = extracted.shift()

        parse(object)
    }

    function parse (parse) {
        var invoked = false
        var count = Array.isArray(parse.length) ? 3 : parse.bytes.length + 3

        counter(parse.count == null ? count : parse.count)

        parse.options || (parse.options = {})

        if (parse.require) {
            parse.options.precompiler = require('../require')
            parse.options.directory = 't/generated'
        }

        var parser = createParser(parse.options)

        parser.packet('packet', parse.pattern)
        parser.extract('packet', function (object, read) {
            equal(0, 0, parse.message + ' byte count')
            deepEqual(object, parse.expected, parse.message + ' expected')
            if (false && options.subsequent) {
                parser.extract('byte: b8', function (object, read) { return read })
            }
            invoked = true
            return read
        })

        var bytes = new Buffer(parse.bytes)

        if (Array.isArray(parse.length)) {
            var writes = parse.length
            var length = writes.reduce(function (offset, size) {
                return offset + size
            }, 0)
            // todo: could add a test here.
            writes.reduce(function (offset, size) {
                parser.parse(bytes, offset, offset + size)
                return offset + size
            }, 0)
        } else {
            // todo: could add a test here.
            parser.parse(bytes, 0, bytes.length)
        }

        if (false && options.subsequent) {
            parser.parse([ 0 ], 0, 1)
        }

        ok(invoked, parse.message + ' invoked')

        if (!Array.isArray(parse.length)) {
            for (var i = 0; i < bytes.length; i++) {
                parser.extract('packet', function (object) {
                    deepEqual(object, parse.expected, parse.message + ' parse offset ' + i)
                })
                parser.parse(bytes, 0, i)
                for (var j = i; j < bytes.length; j++) {
                    parser.parse(bytes, j, j + 1)
                }
            }
        }
    }

    return { createParser: createParser, parseEqual: parseEqual, parse: parse }
})
