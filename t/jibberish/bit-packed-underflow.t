#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "bit pack pattern underflow at character 5",
          "parse bit packed pattern underflow",
          -> parse("b16{b3,x6,b6}")
