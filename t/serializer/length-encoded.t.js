#!/usr/bin/env node
require('./proof')(3, function (serialize) {
    var bytes =  [ 0x00, 0x03, 0x02, 0x03, 0x04 ]
    serialize({ require: true },
              'array: b16/b8', { array: bytes.slice(2) }, 5, bytes,
              'write a named length encoded array of bytes')
})
