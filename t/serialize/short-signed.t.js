#!/usr/bin/env node
require('./proof')(5 * 3, function (serialize) {
  serialize("-b16", -32768, 2, [ 0x80, 0x00 ], "minimum");
  serialize("-l16", -32768, 2, [ 0x00, 0x80 ], "little-endian minimum");
  serialize("-b16", -1, 2, [ 0xff, 0xff ], "negative");
  serialize("-b16",  258, 2, [ 0x01, 0x02 ], "positive");
  serialize("-b16",  32767, 2, [ 0x7f, 0xff ], "maximum");
});
