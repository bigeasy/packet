#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual('foo: b8z|ascii()|atof()', [ 0x34, 0x2E, 0x32, 0x00 ], 4, { foo: 4.2 }, 'read a zero terminated ASCII string converted to float')
})
