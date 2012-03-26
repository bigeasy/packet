#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "masks not permitted in ranges at character 6",
          "parse invalid alternation range with mask lower",
          -> parse("b8(0-&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
