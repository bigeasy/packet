#!/usr/bin/env coffee
require("./proof") 1, ({ parse }) ->
  @throws "invalid pattern at character 1",
          "parse utter nonsense",
            -> parse("blurdy")
