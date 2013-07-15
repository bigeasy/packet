#!/usr/bin/env node
require('./proof')(8, function (parseEqual) {
  parseEqual({ require: true }, 'l16, b8', [ 0xA0, 0xB0, 0xAA ], 3, 0xB0A0, 0xAA, 'read a 16 bit little-endian number');
  parseEqual({ require: true, subsequent: true }, 'l16, b8', [ 0xA0, 0xB0, 0xAA ], 3, 0xB0A0, 0xAA, 'read a 16 bit little-endian number');
});
