require('proof')(module, function (body, assert) {
    var __slice = [].slice

    var options = {}
    options.precompiler = require('../require')
    options.directory = 't/generated'
    var packet = require('../..').createPacketizer(options)
    var subsequent = {}
    subsequent.parser = packet.createParser('foo: b8')
    subsequent.serializer = packet.createSerializer('foo: b8')

    function toArray (buffer) {
        var array = [], i, I
        for (i = 0, I = buffer.length; i < I; i++) {
            array[i] = buffer[i]
        }
        return array
    }

    function incremental (cycle, type) {
        var self = {}
        var prefix = cycle.message + ' ' + type + ' incremental '

        assert.inc(cycle.buffer.length * 4 + 2)

        function increment (i) {
            var prefix = cycle.message + ' ' + type + ' offset of ' + i + ' '
            self.parse = cycle.parser({}, function (object) {
                assert(object, cycle.object, prefix + 'parse')
                var buffer = new Buffer(cycle.buffer.length)
                buffer.fill(0)
                self.write = cycle.serializer(object)
                var start = self.write(buffer, 0, i)
                var end = cycle.buffer.length
                while (start != end) {
                    start = self.write(buffer, start, start + 1)
                }
                assert(start, cycle.buffer.length, prefix + 'bytes written')
                assert(toArray(buffer), cycle.buffer, prefix + 'serialize')
            })
            var start = self.parse(cycle.buffer, 0, i)
            var end = cycle.buffer.length
            while (start != end) {
                start = self.parse(cycle.buffer, start, start + 1)
            }
            assert(start, cycle.buffer.length, prefix + 'bytes parsed')
        }

        for (var i = 0, I = cycle.buffer.length; i < I; i++) {
            increment(i)
        }

        self.parse = cycle.parser({}, function (object) {
            var buffer = new Buffer(cycle.buffer.length + 1)
            buffer.fill(0)
            return subsequent.parser({}, function (next) {
                assert(next, { foo: 1 }, prefix + 'subsequent parser')
                self.write = cycle.serializer(object, function () {
                    return subsequent.serializer({ foo: 1 })
                })
                self.write(null, 0, 0)
                self.write(buffer, 0, buffer.length)
                assert(toArray(buffer), cycle.buffer.concat([ 1 ]), prefix + 'subsequent serializer')
            })
        })
        self.parse(null, 0, 0)
        self.parse(cycle.buffer.concat([ 1 ]), 0, cycle.buffer.length + 1)
    }

    function full (cycle, type) {
        var self = {}
        var prefix = cycle.message + ' ' + type + ' '

        assert.inc(7)

        assert(cycle.sizeOf(cycle.object), cycle.buffer.length, prefix + 'sizeOf')

        self.parse = cycle.parser({}, function (object) {
            assert(object, cycle.object, prefix + 'parse')
            var buffer = new Buffer(cycle.buffer.length)
            buffer.fill(0)
            self.write = cycle.serializer(object)
            var start = self.write(buffer, 0, buffer.length)
            assert(start, cycle.buffer.length, prefix + 'written')
            assert(toArray(buffer), cycle.buffer, prefix + 'serialize')
        })
        var start = self.parse(cycle.buffer, 0, cycle.buffer.length)
        assert(start, cycle.buffer.length, prefix + 'parsed')

        self.parse = cycle.parser({}, function (object) {
            var buffer = new Buffer(cycle.buffer.length + 1)
            buffer.fill(0)
            return subsequent.parser({}, function (next) {
                assert(next, { foo: 1 }, prefix + 'subsequent parser')
                self.write = cycle.serializer(object, function () {
                    return subsequent.serializer({ foo: 1 })
                })
                self.write(buffer, 0, buffer.length)
                assert(toArray(buffer), cycle.buffer.concat([ 1 ]), prefix + 'subsequent serializer')
            })
        })
        self.parse(cycle.buffer.concat([ 1 ]), 0, cycle.buffer.length + 1)
    }

    function cycle (cycle) {
        cycle.options || (cycle.options = {})
        cycle.types || (cycle.types = 'bff all inc')
        cycle.types = cycle.types.split(/\s+/)

        cycle.options.precompiler = require('../require')
        cycle.options.directory = 't/generated'

        var packet = require('../..').createPacketizer(cycle.options)

        cycle.parser = packet.createParser(cycle.pattern)
        cycle.serializer = packet.createSerializer(cycle.pattern)
        cycle.sizeOf = packet.createSizeOf(cycle.pattern)

        cycle.types.forEach(function (type) {
            switch (type) {
            case 'bff':
                full(cycle, 'bff')
                incremental(cycle, 'bff')
            }
        })
    }

    body(cycle)
})
