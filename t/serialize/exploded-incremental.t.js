#!/usr/bin/env node

require('./proof')(3, function (serialize) {
    serialize('foo: l32f', 10.8, [ 1, 3 ], [ 0xcd, 0xcc, 0x2c, 0x41 ], 'exploded incremental')
})
