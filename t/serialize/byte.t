#!/usr/bin/env coffee
require("./proof") 2, ({ serialize }) ->
  serialize "b8", 0x01, 1, [ 0x01 ], "write a byte"
