#!/usr/bin/env node
require('./proof')(6, function (serialize) {
  var bytes =  [ 0x00, 0x03, 0x02, 0x03, 0x04 ];
  serialize("b16/b8", bytes.slice(2), 5, bytes, "write a length encoded array of bytes");
  serialize("b16/b8 => array", { array: bytes.slice(2) }, 5, bytes,
    "write a named length encoded array of bytes");
});
