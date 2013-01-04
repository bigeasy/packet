#!/usr/bin/env node
require('./proof')(3, function (serialize) {
  serialize("b16{x1{1},b15}", 258, 2, [ 0x81, 0x02 ], "write a bit packed integer with padded field");
});
