#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 24",
          "error index after pipeline",
          -> parse("b8z|twiddle(8, 'utf8'),z")
