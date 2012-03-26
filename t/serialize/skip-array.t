#!/usr/bin/env coffee
require("./proof") 2, ({ serialize }) ->
  buffer = [ 0xff, 0xff, 0xff, 0xff ]
  serialize buffer, "x16[2], b16", 1, 6, [ 0xff, 0xff, 0xff, 0xff, 0x00, 0x01 ], "write a 16 bit integer after skipping four bytes"
