#!/usr/bin/env node

require('./proof')(24, function (parseEqual) {
  parseEqual({ require: true }, 'l64f', [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], 8, -9.1819281981e3, 'very negative');
  parseEqual({ require: true, subsequent: true }, 'l64f', [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], 8, -10, 'negative, subsequent');
  parseEqual({ require: true }, 'l64f', [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], [ 4, 4 ], -10, 'negative, fallback');
  parseEqual({ require: true }, 'l64f', [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], [ 4, 4 ], -9.1819281981e3, 'very negative, fallback');
  // add a byte to get a different generated function name for coverage
  parseEqual({ buffersOnly: true, require: true }, 'b8,l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), 9, 1, -10, 'negative, buffers only');
  parseEqual({ buffersOnly: true, require: true, subsequent: true }, 'b8,l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), 9, 1, -10, 'negative, buffers only, subsequent');
  parseEqual({ buffersOnly: true, require: true }, 'b8,l64f', new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]), [ 0, 9 ], 1, -10, 'negative, buffers only, fallback');
});
