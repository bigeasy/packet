#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
    parseEqual('foo: b8[8]z|ascii()', [ 0x41, 0x42, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00 ], 8, { foo: 'ABC' }, 'read a zero terminated 8 byte padded ASCII string')
    parseEqual('foo: b8[8]z|ascii()', [ 0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ], 8, { foo: '0000ABC' }, 'read a zero terminated 8 byte padded ASCII string that is 7 characters long')
})
