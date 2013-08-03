#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
    parseEqual({ require: true }, 'foo: l16, bar: b8', [ 0xA0, 0xB0, 0xAA ], 3, { foo: 0xB0A0, bar: 0xAA }, 'read a 16 bit little-endian number')
    parseEqual({ require: true, subsequent: true }, 'foo: l16, bar: b8', [ 0xA0, 0xB0, 0xAA ], 3, { foo: 0xB0A0, bar: 0xAA }, 'read a 16 bit little-endian number')
})
