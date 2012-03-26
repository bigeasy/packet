#!/usr/bin/env coffee
require("./proof") 1, ({ Parser }) ->
  parser = new Parser(@)
  parser.extract "b8", (field) -> @ok true, "set self"
  parser.parse [ 1 ]
