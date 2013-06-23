#!/usr/bin/env node

require('proof')(4, function (equal) {
  var packet = require('../..');
  var parser = packet.createParser();
  parser.transform('bool', function (parsing, field, value) {
    if (parsing) {
      return value ? 'TRUE' : 'FALSE';
    } else {
      return value == 'TRUE' ? 1 : 0;
    }
  });
  parser.packet('bools', 'b8|bool(),b8|bool()');
  parser.extract('bools', function (first, second) {
    equal(first, 'FALSE', 'transformed from false');
    equal(second, 'TRUE', 'transformed from true');
  });
  parser.parse([ 0, 1 ]);
  var serializer = parser.createSerializer();
  serializer.serialize('bools', 'TRUE', 'FALSE');
  var buffer = new Buffer(2);
  serializer.write(buffer);
  equal(buffer[0], 1, 'transformed to true');
  equal(buffer[1], 0, 'transformed to false');
});
