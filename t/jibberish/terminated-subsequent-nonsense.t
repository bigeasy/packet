#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 9",
          "error index after length encoding",
          -> parse("b16/b8, z")
