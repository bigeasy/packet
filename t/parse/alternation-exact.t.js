#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'b8(0-251: foo:b8 | 252: x8, foo:b16 | 253: x8, bar:b24 | 254: x8, baz:b64)', [ 253, 0x00, 0x01, 0x00 ], 4, {bar:256}, 'read an exact alternative')
})
