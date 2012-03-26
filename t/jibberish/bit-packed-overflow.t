#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "bit pack pattern overflow at character 5",
          "parse bit packed pattern overflow",
          -> parse("b16{b3,x6,b8}")
