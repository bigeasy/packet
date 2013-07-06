#!/usr/bin/env node

require('./proof')(24, function (parseEqual) {
  parseEqual({ require: true }, "l32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], 4, 10.800000190734863, "positive");
  parseEqual({ require: true, subsequent: true }, "l32f", [ 0x00, 0x00, 0x20, 0xc1 ], 4, -10, "negative, subsequent");
  parseEqual({ require: true }, "l32f", [ 0x00, 0x00, 0x20, 0xc1 ], [ 1, 3 ], -10, "negative, fallback");
  parseEqual({ require: true }, "l32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 3 ], 10.800000190734863, "positive, fallback");
  parseEqual({ require: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, 1, 10.800000190734863, "positive, buffers only");
  parseEqual({ require: true, subsequent: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, 1, 10.800000190734863, "positive, buffers only, subsequent");
  parseEqual({ require: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], [ 0, 5 ], 1, 10.800000190734863, "positive, buffers only, fallback");
});
