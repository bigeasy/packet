#!/usr/bin/env node

require('./proof')(2, function (createParser, equal) {
  var parser = createParser();
  var buffer = [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ];
  parser.extract('x64, b64f', function (number) {
    equal(number, -10, 'parsed');
    equal(parser.length, buffer.length, 'length');
  });
  parser.parse(buffer.slice(0, 4));
  parser.parse(buffer.slice(4, 12));
  parser.parse(buffer.slice(12));
});
