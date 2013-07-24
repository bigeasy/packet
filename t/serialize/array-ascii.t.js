#!/usr/bin/env node
require('./proof')(6, function (serialize) {
    serialize('foo: b8[3]|ascii()', { foo: 'ABC' }, 3, [ 0x41, 0x42, 0x43 ], 'write a 3 byte ASCII string')
    serialize('foo: b8[3]|ascii()', { foo: 'A\u0000C' }, 3, [ 0x41, 0x00, 0x43 ], 'write a 3 byte ASCII string with a null character')
})
