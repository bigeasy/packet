#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8(&0x80: b16{x1,b15} | b8)", [ 0x81, 0x00 ], 2, 256, "read a masked alternative");
});
