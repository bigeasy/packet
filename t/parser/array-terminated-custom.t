#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  var bytes =  [ 0x01, 0x02, 0x0D, 0x0D, 0x0A, 0x06, 0x07, 0x08 ];
  var field =  bytes.slice(0, 3);
  parseEqual("b8[8]z<13,10>", bytes, 8, field, "read a multiple terminated array of 8 bytes");
});
