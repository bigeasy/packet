#!/usr/bin/env node
require('./proof')(3, function (serialize) {
  serialize("b8z|utf8()|atof()", "4.2", 4, [ 0x34, 0x2E, 0x32, 0x00 ], "write a zero terminated UTF-8 converted to float");
});
