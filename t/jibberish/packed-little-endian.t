#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 3",
          "parse a little-endian integer packed in an integer",
          -> parse("b8{l4,b4}")
