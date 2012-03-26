#!/usr/bin/env coffee
require("./proof") 2, ({ Serializer }) ->
  serializer = new Serializer()
  buffer = [ 0xff, 0xff, 0xff, 0xff ]
  serializer.buffer buffer, "x16{0}, b16", 1
  @equal serializer.getBytesWritten(), 4, "bytes written"
  @deepEqual buffer, [  0x00, 0x00, 0x00, 0x01 ], "bytes"
