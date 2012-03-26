#!/usr/bin/env coffee
require("./proof") 3, ({ parseEqual }) ->
  parseEqual "b8z|ascii()", [ 0x41, 0x42, 0x43, 0x00 ], 4, "ABC", "read a zero terminated ASCII string"
