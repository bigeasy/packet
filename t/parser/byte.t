#!/usr/bin/env coffee
require("./proof") 3, ({ parseEqual }) ->
  parseEqual "b8", [ 1 ], 1, 1, "byte"
