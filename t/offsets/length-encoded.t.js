#!/usr/bin/env node

require("./proof")(6, function (offsetsOf) {
  offsetsOf("b16/b8 => numbers", [
    0x00, 0x02, 0xcd, 0xef
  ], [
    { name: 'numbers',
      pattern: 'b16/b8',
      value: [{ pattern: 'b8', value: 0xcd, offset: 2, length: 1, hex: "cd" },
              { pattern: 'b8', value: 0xef, offset: 3, length: 1, hex: "ef" }],
      count: { pattern: 'b16', value: 2, offset: 0, length: 2, hex: '0002' },
      offset: 0,
      length: 4,
      hex: '0002cdef' }
  ], "read a named length encoded array");
  offsetsOf("b16/b8", [
    0x00, 0x02, 0xcd, 0xef
  ], [
    { pattern: 'b16/b8',
      value: [{ pattern: 'b8', value: 0xcd, offset: 2, length: 1, hex: "cd" },
              { pattern: 'b8', value: 0xef, offset: 3, length: 1, hex: "ef" }],
      count: { pattern: 'b16', value: 2, offset: 0, length: 2, hex: '0002' },
      offset: 0,
      length: 4,
      hex: '0002cdef' }
  ], "read a length encoded array");
});
