#!/usr/bin/env node

require('./proof')(3, function (parseEqual) {
    var bytes =  [ 0x01, 0x0a, 0x02, 0x0d, 0x03, 0x04, 0x05, 0x06, 0x07, 0x0d, 0x0a ]
    var field =  bytes.slice(0, bytes.length - 2)
    parseEqual('foo: b8z<13,10>', bytes, 11, { foo: field }, 'read a multi-byte terminated array of bytes')
})
