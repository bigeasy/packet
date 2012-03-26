#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "bit size must be non-zero at character 2",
          "parse a 0 bit pattern.",
          -> parse("b0")
