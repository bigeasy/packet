#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
    parseEqual({ require: true }, 'b8{x2, foo: b3,x3}', [ 0x28 ], 1, { foo: 5 }, 'read a bit packed integer')
    parseEqual('b8{foo: b2,x1,bar: b2,x3}', [ 0xD0 ], 1, { foo: 3, bar:  2 }, 'read a bit packed integer with two fields')
})
