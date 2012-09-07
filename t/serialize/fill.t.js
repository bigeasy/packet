#!/usr/bin/env node
require('./proof')(2, function (createSerializer, equal, deepEqual) {
  var serializer = createSerializer()
  var buffer = [ 0xff, 0xff, 0xff, 0xff ];
  serializer.serialize("x16{0}, b16", 1);
  serializer.write(buffer);
  equal(serializer.length, 4, "bytes written");
  deepEqual(buffer, [  0x00, 0x00, 0x00, 0x01 ], "bytes");
});
