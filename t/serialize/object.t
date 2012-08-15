#!/usr/bin/env node
require('./proof')(2, function (Serializer, equal, deepEqual, toArray) {
  var serializer = new Serializer;
  var object = { length: 258, type: 8, name: "ABC" };
  serializer.buffer("b16 => length, b8 => type, b8z|utf8() => name", object, function (buffer) {
    equal(serializer.written, 7);
    deepEqual(toArray(buffer), [ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ]);
  });
});
