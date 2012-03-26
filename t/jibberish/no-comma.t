#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 4",
          "parse two patterns together without a comma.",
          -> parse("l16b8")
