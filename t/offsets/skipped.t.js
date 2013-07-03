#!/usr/bin/env node

require("./proof")(6, function (offsetsOf) {
  offsetsOf("x16,b16", [ 0x81, 0x01, 0x01, 0x00 ], [
    { pattern: "x16", offset: 0, length: 2, hex: "8101" },
    { pattern: "b16", value: 256, offset: 2, length: 2, hex: "0100" }
  ], "read a skipped word and a word")
  offsetsOf("x16,b16 => foo", [ 0x81, 0x01, 0x01, 0x00 ], [
    { pattern: "x16", offset: 0, length: 2, hex: "8101" },
    { name: "foo", pattern: "b16", value: 256, offset: 2, length: 2, hex: "0100" }
  ], "read a skipped word and a named word")
});
