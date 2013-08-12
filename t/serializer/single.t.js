#!/usr/bin/env node

require('./proof')(0 * 3, function (serialize) {
    serialize({ require: true }, 'foo: l32f', { foo: 10.8 }, 4, [ 0xcd, 0xcc, 0x2c, 0x41 ], 'positive')
    serialize({ require: true }, 'foo: l32f', { foo: -10 }, 4, [ 0x00, 0x00, 0x20, 0xc1 ], 'negative')
    serialize({ buffersOnly: true, require: true }, 'foo: l32f', { foo: 10.8 }, 4, [ 0xcd, 0xcc, 0x2c, 0x41 ], 'positive')
    serialize({ buffersOnly: true, require: true }, 'foo: l32f', { foo: -10 }, 4, [ 0x00, 0x00, 0x20, 0xc1 ], 'negative')
})
