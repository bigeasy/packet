#!/usr/bin/env coffee
require("./proof") 3, ({ parseEqual }) ->
  parseEqual "b16", [ 0xA0, 0xB0 ], 2, 0xA0B0, "word"
