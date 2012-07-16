#!/usr/bin/env node

require('./proof')(2, function (serialize) {
  serialize('b8', 0x01, 1, [ 0x01 ], 'write a byte');
});
