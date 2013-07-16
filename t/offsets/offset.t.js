#!/usr/bin/env node

require('./proof')(1, function (offsetsOf, deepEqual) {
    var createParser = require('../..').createParser, parser = createParser()
    parser.packet('pattern', 'b8{x4, number: b4}')
    parser.extract('pattern', function (record) {
        var serializer = parser.createSerializer()
        serializer.serialize('pattern', record)
        var fields = serializer.offsetsOf(new Buffer([ 0, 1 ]), 1)
        deepEqual(fields, [
            { pattern: 'b8{x4,b4}',
                value: [
                    {  pattern: 'x4', bit: 0, bits: 4, hex: '00', binary: '0000' },
                    {  name: 'number', pattern: 'b4', value: 1, bit: 4, bits: 4, hex: '01', binary: '0001' }
                ],
                offset: 1,
                length: 1,
                hex: '01' } ], 'expected')
    })
    parser.parse([ 1 ], 0, 1)
})
