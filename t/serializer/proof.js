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

    function _serialize (object) {
        var written

        var split = Array.isArray(object.length)

        counter(3 + (split ? 0 : object.expected.length))

        object.options || (object.options = {})
        object.buffer  || (object.buffer = new Buffer(1024))

        if (object.require || object.options.require) {
            object.options.precompiler = require('../require')
        }

        var serializer = createSerializer(object.options || {})

        serializer.serialize.call(serializer, object.pattern, object.object)

        var sizeOf = serializer.sizeOf

        if (split) {
            written = object.length.reduce(function (previous, current) {
                var written = serializer.write(object.buffer, previous, previous + current) - previous
                return previous + written
            }, 0)
            object.length = object.length.reduce(function (previous, current) {
                return previous + current
            }, 0)
        } else {
            written = serializer.write(object.buffer, 0, object.buffer.length)
        }

        equal(sizeOf, object.length, object.message + ' sizeOf')
        equal(written, object.length, object.message + ' byte count')
        deepEqual(toArray(object.buffer.slice(0, written)), object.expected, object.message + ' written')
        if (!split) {
            for (var i = 0; i < object.expected.length; i++) {
                var serializer = createSerializer(object.options || {})
                serializer.serialize.call(serializer, object.pattern, object.object)
                serializer.write(object.buffer, 0, i)
                for (var j = i; j < object.expected.length; j++) {
                    serializer.write(object.buffer, j, j + 1)
                }
                deepEqual(toArray(object.buffer.slice(0, written)),
                          object.expected, object.message + ' written offset ' + i)
            }
        }
    }

    return { createSerializer: createSerializer, serialize: serialize, toArray: toArray }
})
