#!/usr/bin/env coffee
require("./proof") 2, ({ Parser }) ->
  parser = new Parser
  parser.extract "b16 => length, b8 => type, b8z|utf8() => name", (object) =>
    @equal parser.getBytesRead(), 7, "bytes read"
    expected =
      length: 258
      type: 8
      name: "ABC"
    @deepEqual object, expected, "object read"
  parser.parse [ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ]
