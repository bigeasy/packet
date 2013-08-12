#!/usr/bin/env node
require('./proof')(0, function (serialize) {
    serialize({ require: true },
              [ 0xff, 0xff, 0xff, 0xff, 0xff, 0xff ], 'x16[2], foo: b16', { foo: 1 }, 6,
              [ 0xff, 0xff, 0xff, 0xff, 0x00, 0x01 ],
              'write a 16 bit integer after skipping four bytes')
})
