#!/usr/bin/env node
require('./proof')(2, function (createSerializer, equal, deepEqual, toArray) {
  var serializer = createSerializer()
    , object = { length: 258, type: 8, name: "ABC" }
    , buffer = new Buffer(1024);
  serializer.serialize("b16 => length, b8 => type, b8z|utf8() => name", object);
  serializer.write(buffer);
  equal(serializer.length, 7, 'written');
  deepEqual(toArray(buffer.slice(0, serializer.length)), [ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ], 'buffer');
});
