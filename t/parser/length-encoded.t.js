#!/usr/bin/env node

require('./proof')(0, function (parseEqual) {
    var bytes =  [ 0x00, 0x03, 0x02, 0x03, 0x04 ]
    var field =  bytes.slice(2)
    parseEqual({ require: true }, 'foo: b16/b8', bytes, 5, { foo: field }, 'read a length encoded array of bytes')
    parseEqual('array: b16/b8', bytes, 5, { array: field },
        'read a named length encoded array of bytes')
})
