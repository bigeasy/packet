#!/usr/bin/env node

require("./proof")(3, function (offsetsOf) {
  offsetsOf("b8[3] => numbers", [
    0xab, 0xcd, 0xef
  ], {
    numbers: { pattern: 'b8[3]',
               value: [{ pattern: 'b8', value: 0xab, offset: 0, length: 1, hex: "ab" },
                       { pattern: 'b8', value: 0xcd, offset: 1, length: 1, hex: "cd" },
                       { pattern: 'b8', value: 0xef, offset: 2, length: 1, hex: "ef" }],
               offset: 0,
               length: 3,
               hex: 'abcdef' }
  }, "read an array of 3 bytes");
});
