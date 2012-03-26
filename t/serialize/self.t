#!/usr/bin/env coffee
require("./proof") 1, ({ Serializer }) ->
  serializer = new Serializer(@)
  serializer.write "b8", 0x01, -> @ok true, "set self"
