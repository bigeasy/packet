#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "any not permitted in ranges at character 6",
          "parse invalid alternation range with any",
          -> parse("b8(0-*: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
