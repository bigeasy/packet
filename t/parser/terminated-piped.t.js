#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8z|ascii()", [ 0x41, 0x80, 0x43, 0x00 ], 4, "A\u0000C", "read a zero terminated ASCII string");
});
