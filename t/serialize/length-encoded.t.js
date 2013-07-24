#!/usr/bin/env node
require('./proof')(6, function (serialize) {
    var bytes =  [ 0x00, 0x03, 0x02, 0x03, 0x04 ]
    serialize('foo: b16/b8', bytes.slice(2), 5, bytes, 'write a length encoded array of bytes')
    serialize('array: b16/b8', { array: bytes.slice(2) }, 5, bytes,
        'write a named length encoded array of bytes')
})
