#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 18",
          "error index after terminator",
          -> parse("b8z< 10 , 13 > , z")
