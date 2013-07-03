#!/usr/bin/env node

require("./proof")(6, function (offsetsOf) {
  offsetsOf("b8[3] => numbers, b8 => byte", [
    0xab, 0xcd, 0xef, 0xff
  ], [
    { name: 'numbers',
      pattern: 'b8[3]',
      value: [{ pattern: 'b8', value: 0xab, offset: 0, length: 1, hex: "ab" },
              { pattern: 'b8', value: 0xcd, offset: 1, length: 1, hex: "cd" },
              { pattern: 'b8', value: 0xef, offset: 2, length: 1, hex: "ef" }],
      offset: 0,
      length: 3,
      hex: 'abcdef' },
    { name: 'byte', pattern: "b8", value: 0xff, offset: 3, length: 1, hex: "ff" }
  ], "read a named array of 3 bytes");
  offsetsOf("b8[3],b8", [
    0xab, 0xcd, 0xef, 0xff
  ], [
    { pattern: 'b8[3]',
      value: [{ pattern: 'b8', value: 0xab, offset: 0, length: 1, hex: "ab" },
              { pattern: 'b8', value: 0xcd, offset: 1, length: 1, hex: "cd" },
              { pattern: 'b8', value: 0xef, offset: 2, length: 1, hex: "ef" }],
      offset: 0,
      length: 3,
      hex: 'abcdef' },
    { pattern: "b8", value: 0xff, offset: 3, length: 1, hex: "ff" }
  ], "read an array of 3 bytes");
});
