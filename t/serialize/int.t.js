#!/usr/bin/env node

require('./proof')(2 * 3, function (serialize) {
  serialize('b32', 0xCCADA001, 4, [ 0xCC, 0xAD, 0xA0, 0x01 ], 'write a big-endian double-word');
  serialize('l32', 0xCCADA001, 4, [ 0x01, 0xA0, 0xAD, 0xCC ], 'write a little-endian double-word');
});
