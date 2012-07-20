#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8[3]|ascii()", [ 0x41, 0x42, 0x43 ], 3, "ABC", "read a 3 byte ASCII string");
});
