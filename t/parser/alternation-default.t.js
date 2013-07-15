#!/usr/bin/env node
require('./proof')(6, function (parseEqual) {
  parseEqual({ require: true }, "b8(&0x80: b16{x1,b15} | b8)", [ 0x7f ], 1, 127, "read a default after a masked alternative");
  parseEqual({ require: true }, "b8(252/252-0xffff: x8{252}, b16 => foo | 0-251: b8 => foo | 253/0x10000-0xffffff: x8{253}, b24 => foo | x8{254}, b64=> foo)",  [ 254, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff ], 9, { foo: 0x01ffffff }, "write named alternation long");
});
