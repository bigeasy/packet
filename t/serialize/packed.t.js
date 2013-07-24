#!/usr/bin/env node
require('./proof')(2 * 3, function (serialize) {
    serialize('b8{x2,foo: b3,x3}', 5, 1, [ 0x28 ], 'write a bit packed integer')
    serialize('b8{foo: b2,x1,bar: b2,x3}', 3, 2, 1, [ 0xD0 ], 'write a bit packed integer with two fields')
})
