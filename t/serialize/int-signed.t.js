#!/usr/bin/env node

require('./proof')(0, function (serialize) {
    serialize({ require: true }, 'foo: -b32', { foo: ~0x7fffffff }, 4, [ 0x80, 0x00, 0x00, 0x00 ], 'minimum')
    serialize({ require: true }, 'foo: -l32', { foo: ~0x7fffffff }, 4, [ 0x00, 0x00, 0x00, 0x80 ], 'little-endian minimum')
    serialize({ require: true }, 'foo: -b32', { foo: -1 }, 4, [ 0xff, 0xff, 0xff, 0xff ], 'negative')
    serialize({ require: true }, 'foo: -b32', { foo: 0x01020304 }, 4, [ 0x01, 0x02, 0x03, 0x04 ], 'positive')
    serialize({ require: true }, 'foo: -b32', { foo: 0x7fffffff }, 4, [ 0x7f, 0xff, 0xff, 0xff ], 'maximum')
})
