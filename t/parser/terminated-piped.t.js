#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
    parseEqual('foo: b8z|ascii()', [ 0x41, 0x80, 0x43, 0x00 ], 4, { foo: 'A\u0000C' }, 'read a zero terminated ASCII string')
})
