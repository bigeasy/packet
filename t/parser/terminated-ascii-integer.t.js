#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
    parseEqual('foo: b8z|ascii()|atoi(10)', [ 0x34, 0x32, 0x00 ], 3, { foo: 42 }, 'read a zero terminated ASCII string converted to integer')
})
