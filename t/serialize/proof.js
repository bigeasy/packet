module.exports = require('proof')(function (counter, equal, deepEqual) {
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

        if (vargs.length == 1) {
            return _serialize(vargs.shift())
        }

        // todo: rename write?
        var object = {}

        var message = vargs.pop()
        var bytes = vargs.pop()
        var length = vargs.pop()
        var options = (typeof vargs[0] == 'object' && ! Array.isArray(vargs[0])) ? vargs.shift() : {}
        var buffer = Array.isArray(vargs[0]) ? vargs.shift() : new Buffer(1024)

        object.buffer = buffer
        object.options = options
        object.expected = bytes
        object.length = length
        object.message = message
        object.pattern = vargs.shift()
        object.object = vargs.shift()

        _serialize(object)
    }

    function _serialize (write) {
        var written

        var split = Array.isArray(write.length)

        counter(3 + (split ? 0 : write.expected.length))

        write.options || (write.options = {})
        write.buffer  || (write.buffer = new Buffer(1024))

        if (write.require || write.options.require) {
            write.options.precompiler = require('../require')
        }

        // todo: initialiation not necessary @trivial
        var serializer = createSerializer(write.options || {})

        serializer.serialize.call(serializer, write.pattern, write.object)

        var sizeOf = serializer.sizeOf

        if (split) {
            written = write.length.reduce(function (previous, current) {
                var written = serializer.write(write.buffer, previous, previous + current) - previous
                return previous + written
            }, 0)
            write.length = write.length.reduce(function (previous, current) {
                return previous + current
            }, 0)
        } else {
            written = serializer.write(write.buffer, 0, write.buffer.length)
        }

        equal(sizeOf, write.length, write.message + ' sizeOf')
        equal(written, write.length, write.message + ' byte count')
        deepEqual(toArray(write.buffer.slice(0, written)), write.expected, write.message + ' written')
        if (!split) {
            for (var i = 0; i < write.expected.length; i++) {
        // todo: initialiation not necessary @trivial
                var buffer = new Buffer(written)
                buffer.fill(0xff)
                var serializer = createSerializer(write.options || {})
                serializer.serialize.call(serializer, write.pattern, write.object)
                serializer.write(buffer, 0, i)
                for (var j = i; j < write.expected.length; j++) {
                    serializer.write(buffer, j, j + 1)
                }
                deepEqual(toArray(buffer), write.expected, write.message + ' written offset ' + i)
            }
        }
    }

    return { createSerializer: createSerializer, serialize: serialize, toArray: toArray }
})
