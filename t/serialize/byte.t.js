#!/usr/bin/env node

require('./proof')(3, function (serialize) {
    serialize('foo: b8', { foo: 0x01 }, 1, [ 0x01 ], 'write a byte')
})
