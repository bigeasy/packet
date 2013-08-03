#!/usr/bin/env node
require('./proof')(21, function (parseEqual) {
    var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    var field = bytes.slice(0)
    parseEqual({ require: true },
               'foo: b8[4], bar: b8[4]', bytes, 8, { foo: bytes.slice(0, 4), bar: bytes.slice(4) },
               'read two arrays array of 4 bytes pre-compiled')
    parseEqual({ require: true, subsequent: true },
               'foo: b8[4], bar: b8[4]', bytes, 8, { foo:bytes.slice(0, 4), bar:bytes.slice(4) },
               'read two arrays of 4 bytes pre-compiled, continue')
    parseEqual({ require: true },
               'foo: b8[4], bar: b8[4]', bytes, [ 1, 7 ], { foo:bytes.slice(0, 4), bar:bytes.slice(4) },
               'read two arrays of 4 bytes pre-compiled, continue')
    parseEqual({ compiler: false },
               'foo: b8[8]', bytes, 8, {foo:field},
               'read an array of 8 bytes')
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    parseEqual({ require: true },
               'foo: b16[3], bar: b16', bytes, 8, { foo:[ 0x0102, 0x0304, 0x0506 ], bar:0x0708 },
               'read an array of 3 bytes pre-compiled')
    parseEqual({ require: true, subsequent: true },
               'foo: b16[3], bar: b16', bytes, 8, { foo:[ 0x0102, 0x0304, 0x0506 ], bar: 0x0708 },
               'read an array of 3 bytes pre-compiled, continue')
    parseEqual({ require: true },
               'foo: b16[3], bar: b16', bytes, [ 4, 3, 1 ], {foo:[ 0x0102, 0x0304, 0x0506 ], bar:0x0708},
               'read an array of 3 bytes pre-compiled, fallback')
})
