#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 13",
          "parse invalid bit pattern",
          -> parse("b16{b3,x6,b7f}")
