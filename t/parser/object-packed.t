#!/usr/bin/env coffee
require("./proof") 2, ({ Parser }) ->
  parser = new Parser
  parser.extract "b16 => short, b8{b2 => high, x1, b2 => low, x3}", (object) =>
    @equal parser.getBytesRead(), 3, "bytes read"
    expected =
      short: 258
      high: 3
      low: 2
    @deepEqual object, expected, "object read"
  parser.parse [ 0x01, 0x02, 0xD0 ], 0, 3
