#!/usr/bin/env coffee
require("./proof") 2, ({ serialize }) ->
  bytes = [ 0x03, 0x02, 0x03, 0x04 ]
  serialize "b8/b8", bytes.slice(1), 4, bytes, "write a length encoded array of bytes"
