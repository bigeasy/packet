#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "field alternates not allowed at character 9",
          "parse invalid alternation range with junk before colon",
          -> parse("b8(&0x80/0-0x7f: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
