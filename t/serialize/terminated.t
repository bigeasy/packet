#!/usr/bin/env coffee
require("./proof") 2, ({ serialize }) ->
  bytes = [ 0x01, 0x02, 0x03, 0x04, 0x00 ]
  serialize "b8z", bytes[0..3], 5, bytes, "write a zero terminated array of bytes"
