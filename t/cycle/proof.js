module.exports = require('proof')(function (counter, equal, deepEqual) {
    var __slice = [].slice

    function toArray (buffer) {
        var array = [], i, I
        for (i = 0, I = buffer.length; i < I; i++) {
            array[i] = buffer[i]
        }
        return array
    }

    function full (cycle, type) {
        var self = {}
        var prefix = cycle.message + ' ' + type + ' '

        counter(4)

        equal(cycle.sizeOf(cycle.object), cycle.buffer.length, prefix + 'sizeOf')

        self.parse = cycle.parser({}, function (object) {
            deepEqual(object, cycle.object, prefix + 'parse')
            var buffer = new Buffer(cycle.buffer.length)
            self.write = cycle.serializer(object)
            self.write(buffer, 0, buffer.length)
            deepEqual(toArray(buffer), cycle.buffer, prefix + 'serialize')
        })
        var start = self.parse(cycle.buffer, 0, cycle.buffer.length)
        equal(start, cycle.buffer.length, prefix + 'parsed')
    }

    function cycle (cycle) {
        cycle.options || (cycle.options = {})
        cycle.types || (cycle.types = 'bff all inc')

        cycle.options.precompiler = require('../require')
        cycle.options.directory = 't/generated'

        var packet = require('../..').createPacketizer(cycle.options)

        cycle.parser = packet.createParser(cycle.pattern)
        cycle.serializer = packet.createSerializer(cycle.pattern)
        cycle.sizeOf = packet.createSizeOf(cycle.pattern)

        full(cycle, 'bff')
    }

    return { cycle: cycle }
})
