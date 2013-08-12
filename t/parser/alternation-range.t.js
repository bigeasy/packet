#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'b8(0-251: foo:b8 | 252: x8, bar:b16 | 253: x8, baz:b24 | 254: x8, bob:b64)', [ 0xfb ], 1, {foo: 251}, 'read a ranged alternative')
})
