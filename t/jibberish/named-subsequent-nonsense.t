#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 14",
          "error index after named pattern",
          -> parse("b8z => steve,z")
