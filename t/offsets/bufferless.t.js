#!/usr/bin/env node

require("./proof")(1, function (offsetsOf, deepEqual) {
  var createParser = require('../..').createParser, parser = createParser();
  parser.packet('pattern', 'b8 => number');
  parser.extract('pattern', function (record) {
    var serializer = parser.createSerializer();
    serializer.serialize('pattern', record);
    var fields = serializer.offsetsOf();
    deepEqual(fields, [ { name: 'number', pattern: 'b8', value: 1, offset: 0, length: 1 } ], 'expected');
  });
  parser.parse([ 1 ]);
});
