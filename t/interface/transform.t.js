#!/usr/bin/env node

require('proof')(4, function (equal) {
    var packet = require('../..')
    var parser = packet.createParser({ precompiler: require('../require') })
    parser.transform('bool', function (parsing, field, value) {
        if (parsing) {
            return value ? 'TRUE' : 'FALSE'
        } else {
            return value == 'TRUE' ? 1 : 0
        }
    })
    parser.packet('bools', 'foo: b8|bool(), bar: b8|bool()')
    parser.extract('bools', function (record) {
        equal(record.foo, 'FALSE', 'transformed from false')
        equal(record.bar, 'TRUE', 'transformed from true')
    })
    parser.parse([ 0, 1 ], 0, 2)
    var serializer = parser.createSerializer()
    serializer.serialize('bools', { foo: 'TRUE', bar: 'FALSE' })
    var buffer = new Buffer(2)
    serializer.write(buffer, 0, buffer.length)
    equal(buffer[0], 1, 'transformed to true')
    equal(buffer[1], 0, 'transformed to false')
})
