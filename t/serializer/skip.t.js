#!/usr/bin/env node
require('./proof')(0, function (serialize) {
    serialize([ 0xff, 0xff, 0xaa, 0xaa ], 'x16, foo: b16', { foo: 1 }, 4, [ 0xff, 0xff, 0x00, 0x01 ],
              'write a 16 bit integer after skipping 2 bytes')
    serialize({ require: true }, [ 0xff, 0xff, 0xaa, 0xaa ], 'x16{0xaa55}, foo: b16', { foo: 1 }, 4, [ 0xaa, 0x55, 0x00, 0x01 ],
              'write a 16 bit integer after skipping 2 bytes')
})
