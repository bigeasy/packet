#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
  parseEqual("b8{x2,-b3,x3}", [ 0x20 ], 1, -4, "read a bit packed signed negative integer");
  parseEqual("b8{x2,-b3,x3}", [ 0x18 ], 1, 3, "read a bit packed signed integer");
});
