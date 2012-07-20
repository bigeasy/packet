#!/usr/bin/env node
require('./proof')(4, function (parseEqual) {
  parseEqual("l16, b8", [ 0xA0, 0xB0, 0xAA ], 3, 0xB0A0, 0xAA, "read a 16 bit little-endian number");
});
