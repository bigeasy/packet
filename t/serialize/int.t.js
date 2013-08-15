#!/usr/bin/env node

require('./proof')(0, function (serialize) {
    serialize({ require: true },
              'foo: b32',
              { foo: 0xCCADA001 }, 4, [ 0xCC, 0xAD, 0xA0, 0x01 ],
              'write a big-endian double-word')
    serialize({ require: true },
              'foo: l32',
              { foo: 0xCCADA001 }, 4, [ 0x01, 0xA0, 0xAD, 0xCC ],
              'write a little-endian double-word')
    serialize({ require: true },
              'foo: l32',
              { foo: 0xCCADA001 }, [ 2, 2 ], [ 0x01, 0xA0, 0xAD, 0xCC ],
              'write a little-endian double-word')
})
