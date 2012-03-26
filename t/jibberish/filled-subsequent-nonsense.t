#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 14",
          "error index after padding",
          -> parse("b8{ 0x00 } , z")
