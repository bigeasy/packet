#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'b8{x2, foo: -b3,x3}', [ 0x20 ], 1, { foo: -4 }, 'read a bit packed signed negative integer')
    parseEqual({ require: true }, 'b8{x2, foo: -b3,x3}', [ 0x18 ], 1, { foo: 3 }, 'read a bit packed signed integer')
})
