#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8z|ascii()|atof()", [ 0x34, 0x2E, 0x32, 0x00 ], 4, 4.2, "read a zero terminated ASCII string converted to float");
});
