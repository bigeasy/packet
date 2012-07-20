#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  var bytes =  [ 0x01, 0x02, 0x03, 0x00, 0x05, 0x06, 0x07, 0x08 ];
  var field =  bytes.slice(0, 3);
  parseEqual("b8[8]z", bytes, 8, field, "read a zero terminated array of 8 bytes");
});
