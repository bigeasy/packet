#!/usr/bin/env node

require('./proof')(6, function (parseEqual) {
  var bytes =  [ 0x00, 0x03, 0x02, 0x03, 0x04 ];
  var field =  bytes.slice(2);
  parseEqual("b16/b8", bytes, 5, field, "read a length encoded array of bytes");
  parseEqual("b16/b8 => array", bytes, 5, { array: field },
    "read a named length encoded array of bytes");
});
