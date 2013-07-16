#!/usr/bin/env node

require('./proof')(1, function (offsetsOf, deepEqual) {
    var createParser = require('../..').createParser, parser = createParser()
    parser.packet('pattern', 'b8{x4, number: b4}')
    parser.extract('pattern', function (record) {
        var serializer = parser.createSerializer()
        serializer.serialize('pattern', record)
        var fields = serializer.offsetsOf()
        deepEqual(fields, [
            { pattern: 'b8{x4,b4}',
                value: [
                    {  pattern: 'x4', bit: 0, bits: 4 },
                    {  name: 'number', pattern: 'b4', value: 1, bit: 4, bits: 4 }
                ],
                offset: 0,
                length: 1 } ], 'expected')
    })
    parser.parse([ 1 ], 0, 1)
})
