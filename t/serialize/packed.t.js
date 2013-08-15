#!/usr/bin/env node
require('./proof')(0, function (serialize) {
    serialize({ require: true },
              'b8{x2, foo: b3, x3}', { foo: 5 }, 1, [ 0x28 ],
              'write a bit packed integer')
    serialize({ require: true },
              'b8{foo: b2, x1, bar: b2, x3}', { foo: 3, bar: 2 }, 1, [ 0xD0 ],
              'write a bit packed integer with two fields')
})
