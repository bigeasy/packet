#!/usr/bin/env node
require('./proof')(2, function (createParser, equal, deepEqual) {
    var parser = createParser()
    parser.extract('short: b16, b8{high: b2, x1, low: b2, x3}', function (object) {
        equal(parser.length, 3, 'bytes read')
        var expected = {
            short: 258,
            high: 3,
            low: 2 }
        deepEqual(object, expected, 'object read')
    })
    parser.parse([ 0x01, 0x02, 0xD0 ], 0, 3)
})
