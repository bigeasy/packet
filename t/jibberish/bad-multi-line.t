#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "bit size must be divisible by 8 at line 2 character 2",
          "parse a bad multi-line pattern",
          -> parse("b8,\nb7")
