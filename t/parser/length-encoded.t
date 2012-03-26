#!/usr/bin/env coffee
require("./proof") 3, ({ parseEqual }) ->
  bytes = [ 0x03, 0x02, 0x03, 0x04 ]
  field = bytes.slice 1
  parseEqual "b8/b8", bytes, 4, field, "read a length encoded array of bytes"
