#!/usr/bin/env node
require('./proof')(2, function (deepEqual, createParser) {
    var parser = createParser()
    parser.packet('alt', 'b8(&0x80: b16{x1, foo: b15} | bar: b8)')
    parser.extract('alt', function (value) {
        deepEqual(value, { foo: 256 }, 'set')
        parser.extract('alt', function (value) {
            deepEqual(value, { bar: 1 }, 'unset')
        })
    })
    parser.parse([ 0x81, 0x00, 0x01 ], 0, 3)
})
