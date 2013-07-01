#!/usr/bin/env node

require('./proof')(2 * 3, function (serialize) {
  serialize("b32f", 10.8, 4, [ 0xcd, 0xcc, 0x2c, 0x41 ], "positive");
  serialize("b32f", -10, 4, [ 0x00, 0x00, 0x20, 0xc1 ], "negative");
});
