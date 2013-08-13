#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    var bytes =  [ 0x01, 0x02, 0x0D, 0x0D, 0x0A, 0x06, 0x07, 0x08 ]
    var field =  bytes.slice(0, 3)
    parseEqual({ require: true }, 'foo:b8[8]z<13,10>', bytes, 8, { foo: field }, 'read a multiple terminated array of 8 bytes')
    parseEqual({ require: true, subsequent: true }, 'bar:b8[8]z<13,10>', bytes, 8, { bar: field }, 'read a multiple terminated array of 8 bytes')
    parseEqual({ require: true }, 'baz:b8[8]z<13,10>,bob:b8', bytes.concat(1), 9, { baz: field, bob: 1 }, 'read a multiple terminated array of 8 bytes')
})
