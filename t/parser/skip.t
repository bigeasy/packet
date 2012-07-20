#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("x16, b16", [ 0x01, 0x02, 0x00, 0x01 ], 4, 1, "read a 16 bit integer after skipping two bytes");
});
