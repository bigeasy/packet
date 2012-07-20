#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  var bytes =  [ 0x03, 0x02, 0x03, 0x04 ];
  var field =  bytes.slice(1);
  parseEqual("b8/b8", bytes, 4, field, "read a length encoded array of bytes");
});
