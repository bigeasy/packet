#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "floats can only be 32 or 64 bits at character 2",
          "parse a float pattern other than 32 or 64 bits",
          -> parse("b16f")
