#!/usr/bin/env node

require('./proof')(6, function (parseEqual) {
  parseEqual("b32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], 4, 10.800000190734863, "positive");
  parseEqual("b32f", [ 0x00, 0x00, 0x20, 0xc1 ], 4, -10, "negative");
});
