#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 10",
          "error index after array",
          -> parse("b16[12], z")
