#!/usr/bin/env node
require('./proof')(2, function (equal, createParser) {
  var parser = createParser();
  parser.packet("alt", "b8(&0x80: b16{x1,b15} | b8)");
  parser.extract("alt", function (value) {
    equal(value, 256, "set");
    parser.extract("alt", function (value) {
      equal(value, 1, "unset");
    });
  });
  parser.parse([ 0x81, 0x00, 0x01 ]);
});
