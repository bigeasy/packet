#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)", [ 253, 0x00, 0x01, 0x00 ], 4, 256, "read an exact alternative");
});
