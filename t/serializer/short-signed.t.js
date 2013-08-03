#!/usr/bin/env node
require('./proof')(5 * 3, function (serialize) {
    serialize({ require: true }, 'foo: -b16', { foo: -32768 }, 2, [ 0x80, 0x00 ], 'minimum')
    serialize({ require: true }, 'foo: -l16', { foo: -32768 }, 2, [ 0x00, 0x80 ], 'little-endian minimum')
    serialize({ require: true }, 'foo: -b16', { foo: -1 }, 2, [ 0xff, 0xff ], 'negative')
    serialize({ require: true }, 'foo: -b16', { foo: 258 }, 2, [ 0x01, 0x02 ], 'positive')
    serialize({ require: true }, 'foo: -b16', { foo:  32767 }, 2, [ 0x7f, 0xff ], 'maximum')
})
