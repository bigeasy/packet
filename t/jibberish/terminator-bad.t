#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid terminator at character 10",
          "parse bad terminator",
          -> parse("b8z<0x0A,a>")
