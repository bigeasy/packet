#!/usr/bin/env node
require('./proof')(3, function (serialize) {
    var bytes =  [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    serialize({ require: true }, 'foo: b8[8]', { foo: bytes }, 8, bytes, 'write an array of 8 bytes')
})
