#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "terminator value out of range at character 5",
          "parse terminator out of range",
          -> parse("b8z<300>")
