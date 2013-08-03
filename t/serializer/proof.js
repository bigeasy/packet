module.exports = require('proof')(function (equal, deepEqual) {
    var slice = Function.prototype.call.bind(Array.prototype.slice)
    var createSerializer = require('../..').createSerializer

    function toArray (buffer) {
        var array = [], i, I
        for (i = 0, I = buffer.length; i < I; i++) {
            array[i] = buffer[i]
        }
        return array
    }

    function serialize () {
        var vargs = slice(arguments, 0)
        var message = vargs.pop()
        var bytes = vargs.pop()
        var length = vargs.pop()
        var options = (typeof vargs[0] == 'object' && ! Array.isArray(vargs[0])) ? vargs.shift() : {}
        var buffer = Array.isArray(vargs[0]) ? vargs.shift() : new Buffer(1024)
        var written

        if (options.require) {
            options.precompiler = require('../require')
        }

        var serializer = createSerializer(options)

        serializer.serialize.apply(serializer, vargs)

        var sizeOf = serializer.sizeOf

        if (Array.isArray(length)) {
            written = length.reduce(function (previous, current) {
                var written = serializer.write(buffer, previous, previous + current) - previous
                return previous + written
            }, 0)
            length = length.reduce(function (previous, current) {
                return previous + current
            }, 0)
        } else {
            written = serializer.write(buffer, 0, buffer.length)
        }

        equal(sizeOf, length, message + ' sizeOf')
        equal(written, length, message + ' byte count')
        deepEqual(toArray(buffer.slice(0, written)), bytes, message + ' written')
    }

    return { createSerializer: createSerializer, serialize: serialize, toArray: toArray }
})
