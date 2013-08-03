module.exports = require('proof')(function (equal, deepEqual, ok) {
    var createParser = require('../..').createParser

    var slice = Function.prototype.call.bind(Array.prototype.slice)

    function parseEqual () {
        var invoked = false
        var extracted = slice(arguments, 0)
        var message = extracted.pop()
        var options = {}

        if (typeof extracted[0] == 'object') {
            options = extracted.shift()
        } else {
            options = {}
        }

        if (options.require) {
            options.precompiler = require('../require')
            options.directory = 't/generated'
        }

        var parser = createParser(options || {})
        var pattern = extracted.shift(), bytes = extracted.shift(), length = extracted.shift()

        parser.packet('packet', pattern)
        parser.extract('packet', function (object, read) {
            equal(0, 0, message + ' byte count')
            deepEqual(object, extracted[0], message + ' expected')
            if (options.subsequent) {
                parser.extract('byte: b8', function (object, read) { return read })
            }
            invoked = true
            return read
        })

        if (Array.isArray(length)) {
            var writes = length
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

        ok(invoked, message + ' invoked')
    }

    return { createParser: createParser, parseEqual: parseEqual }
})
