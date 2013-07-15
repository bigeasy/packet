#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
  parseEqual({ require: true }, 'b8(&0x80: b16{x1,b15} | b8)', [ 0x81, 0x00 ], 2, 256, 'read a masked alternative');
  parseEqual({ require: true }, 'b8(&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})', [ 0x03 ], 1, 3, 'write full write alternation byte');
});
