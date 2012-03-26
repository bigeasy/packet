#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "bit size must be divisible by 8 at character 2",
          "parse a 7 bit pattern",
          -> parse("b7")
