#!/usr/bin/env node
require('./proof')(3, function (parseEqual) {
  parseEqual("b16/b8", [ 0x00, 0x00, 0x01, 0x02], 2, [], "read a length encoded array of bytes that is empty");
});
