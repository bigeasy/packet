#!/usr/bin/env node
require('./proof')(2, function (Serializer, equal, deepEqual) {
  var serializer = new Serializer;
  var buffer = [ 0xff, 0xff, 0xff, 0xff ];
  serializer.buffer(buffer, "x16, b16", 1);
  equal(serializer.written, 4, "bytes written");
  deepEqual(buffer, [  0xff, 0xff, 0x00, 0x01 ], "bytes");
});
