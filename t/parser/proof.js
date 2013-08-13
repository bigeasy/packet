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

        object.options = parserOptions
        object.pattern = extracted.shift()
        object.bytes = extracted.shift()
        object.length = extracted.shift()
        object.expected = extracted.shift()

        parse(object)
    }

    function parse (parse) {
        var invoked = false

        counter(parse.count == null ? 3 : parse.count)

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

        if (Array.isArray(parse.length)) {
            var writes = parse.length
            var length = writes.reduce(function (offset, size) {
                return offset + size
            }, 0)
            // todo: could add a test here.
            writes.reduce(function (offset, size) {
                parser.parse(parse.bytes, offset, offset + size)
                return offset + size
            }, 0)
        } else {
            // todo: could add a test here.
            parser.parse(parse.bytes, 0, parse.bytes.length)
        }

        if (false && options.subsequent) {
            parser.parse([ 0 ], 0, 1)
        }

        ok(invoked, parse.message + ' invoked')
    }

    return { createParser: createParser, parseEqual: parseEqual, parse: parse }
})
