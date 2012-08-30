#!/usr/bin/env node
require('./proof')(2, function (createParser, equal, deepEqual) {
  var parser = createParser();
  parser.extract("b16 => length, b8 => type, b8z|utf8() => name", function (object) {
    equal(parser.length, 7, "bytes read");
    var expected = {
      length: 258,
      type: 8,
      name: "ABC" };
    deepEqual(object, expected, "object read");
  });
  parser.parse([ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ]);
});
