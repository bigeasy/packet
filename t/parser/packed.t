#!/usr/bin/env node
require('./proof')(7, function (parseEqual) {
  parseEqual("b8{x2,b3,x3}", [ 0x28 ], 1, 5, "read a bit packed integer");
  parseEqual("b8{b2,x1,b2,x3}", [ 0xD0 ], 1, 3, 2, "read a bit packed integer with two fields");
});
