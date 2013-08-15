#!/usr/bin/env node
require('./proof')(0, function (serialize) {
    serialize('foo: b16', { foo: 0x1FF }, 2, [  0x01, 0xFF ], 'write a big-endian 16 bit integer')
})
