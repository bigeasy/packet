#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "array length must be non-zero at character 4",
          "error array length is zero",
          -> parse("b8[0]")
