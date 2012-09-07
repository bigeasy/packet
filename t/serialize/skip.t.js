#!/usr/bin/env node
require('./proof')(2, function (createSerializer, equal, deepEqual, toArray) {
  var serializer = createSerializer();
  var buffer = [ 0xff, 0xff, 0xff, 0xff ];
  serializer.serialize("x16, b16", 1);
  serializer.write(buffer);
  equal(serializer.length, 4, "bytes written");
  deepEqual(buffer, [  0xff, 0xff, 0x00, 0x01 ], "bytes");
});
