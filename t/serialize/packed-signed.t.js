#!/usr/bin/env node
require('./proof')(2 * 3, function (serialize) {
  serialize("b8{x2,-b3,x3}", -4, 1, [ 0x20 ], "write a bit packed signed negative integer");
  serialize("b8{x2,-b3,x3}", 3, 1, [ 0x18 ], "write a bit packed signed integer");
});
