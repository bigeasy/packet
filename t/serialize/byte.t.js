#!/usr/bin/env node

require('./proof')(3, function (serialize) {
  serialize('b8', 0x01, 1, [ 0x01 ], 'write a byte');
});
