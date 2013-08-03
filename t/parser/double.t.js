#!/usr/bin/env node

require('./proof')(21, function (parseEqual) {
    parseEqual({ require: true }, 'foo: l64f', [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], 8, { foo: -9.1819281981e3 }, 'very negative')
    parseEqual({ require: true, subsequent: true }, 'foo: l64f', [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], 8, {foo: -10 }, 'negative, subsequent')
    parseEqual({ require: true }, 'foo: l64f', [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], [ 4, 4 ], { foo: -10 }, 'negative, fallback')
    parseEqual({ require: true }, 'foo: l64f', [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], [ 4, 4 ], { foo: -9.1819281981e3 }, 'very negative, fallback')
    // add a byte to get a different generated function name for coverage
    parseEqual({ buffersOnly: true, require: true }, 'foo: b8, bar: l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), 9, { foo: 1, bar: -10 }, 'negative, buffers only')
    parseEqual({ buffersOnly: true, require: true, subsequent: true }, 'foo: b8, bar: l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), 9, {foo: 1, bar: -10}, 'negative, buffers only, subsequent')
    parseEqual({ buffersOnly: true, require: true }, 'foo: b8, bar: l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), [ 0, 9 ], { foo: 1, bar: -10 }, 'negative, buffers only, fallback')
})
