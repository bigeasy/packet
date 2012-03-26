#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid number at character 4",
          "parse invalid alternation number pattern",
          -> parse("b8(Q: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
