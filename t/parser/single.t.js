#!/usr/bin/env node

require('./proof')(12, function (parseEqual) {
  parseEqual({ require: true }, "b32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], 4, 10.800000190734863, "positive");
  parseEqual({ require: true, subsequent: true }, "b32f", [ 0x00, 0x00, 0x20, 0xc1 ], 4, -10, "negative, subsequent");
  parseEqual({ require: true }, "b32f", [ 0x00, 0x00, 0x20, 0xc1 ], [ 1, 3 ], -10, "negative, fallback");
  parseEqual({ require: true }, "b32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 3 ], 10.800000190734863, "positive, fallback");
});
