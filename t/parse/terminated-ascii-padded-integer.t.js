#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual('foo: b8[8]z|ascii()|pad("0", 7)|atoi(10)',
        [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ], 8, { foo: 42 },
        'read a zero character padded zero terminated ASCII string converted to integer'
        )
})
