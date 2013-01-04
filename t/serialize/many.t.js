#!/usr/bin/env node
require('./proof')(3, function (serialize) {
  serialize("l16, b16", 0x1FF, 0x1FF, 4, [  0xFF, 0x01, 0x01, 0xFF ], "write a little-endian followed by a big-endian");
});
