#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b8(&0x80: b16{x1,b15} | b8)", [ 0x7f ], 1, 127, "read a default after a masked alternative");
});
