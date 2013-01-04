#!/usr/bin/env node
require('./proof')(3, function (serialize) {
  serialize("b8[3]z|utf8()", "ABC", 3, [ 0x41, 0x42, 0x43 ], "write a fixed width zero terminated UTF-8 string with no terminator");
});
