#!/usr/bin/env node
require('./proof')(3, function (serialize) {
  var bytes =  [ 0x01, 0x02, 0x03, 0x04, 0x00 ];
  serialize("b8z", bytes.slice(0, 4), 5, bytes, "write a zero terminated array of bytes");
});
