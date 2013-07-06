#!/usr/bin/env node

require('./proof')(60, function (parseEqual) {
  parseEqual({ require: true }, "l32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], 4, 10.800000190734863, "positive");
  parseEqual({ require: true, subsequent: true }, "l32f", [ 0x00, 0x00, 0x20, 0xc1 ], 4, -10, "negative, subsequent");
  parseEqual({ require: true }, "l32f", [ 0x00, 0x00, 0x20, 0xc1 ], [ 1, 3 ], -10, "negative, fallback");
  parseEqual({ require: true }, "l32f", [ 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 3 ], 10.800000190734863, "positive, fallback");
  parseEqual({ require: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, 1, 10.800000190734863, "positive, buffers only");
  parseEqual({ require: true, subsequent: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, 1, 10.800000190734863, "positive, buffers only, subsequent");
  parseEqual({ require: true }, "b8,l32f", [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], [ 0, 5 ], 1, 10.800000190734863, "positive, buffers only, fallback");
  // Same as above, but big-endian.
  parseEqual({ require: true }, "b32f", [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(), 4, 10.800000190734863, "big positive");
  parseEqual({ require: true, subsequent: true }, "b32f", [ 0x00, 0x00, 0x20, 0xc1 ].reverse(), 4, -10, "negative, subsequent");
  parseEqual({ require: true }, "b32f", [ 0x00, 0x00, 0x20, 0xc1 ].reverse(), [ 1, 3 ], -10, "negative, fallback");
  parseEqual({ require: true }, "b32f", [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(), [ 1, 3 ], 10.800000190734863, "big positive, fallback");
  parseEqual({ require: true }, "b8,b32f", [ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse(), 5, 1, 10.800000190734863, "big positive, buffers only");
  parseEqual({ require: true, subsequent: true }, "b8,b32f", [ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse(), 5, 1, 10.800000190734863, "big positive, buffers only, subsequent");
  parseEqual({ require: true }, "b8,b32f", [ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse(), [ 0, 5 ], 1, 10.800000190734863, "big positive, buffers only, fallback");
  // Two in a row.
  parseEqual({ require: true }, "l32f,l32f", [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], 8, -10, 10.800000190734863, "two in a row");
  parseEqual({ require: true, subsequent: true }, "l32f,l32f", [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], 8, -10, 10.800000190734863, "two in a row, subsequent");
  parseEqual({ require: true }, "l32f,l32f", [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 7 ], -10, 10.800000190734863, "two in a row, fallback");
});
