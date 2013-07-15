#!/usr/bin/env node

require('./proof')(12, function (serialize) {
  serialize('b8(&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})', 3, 1, [ 0x03 ], 'write full write alternation byte');
  serialize('b8(&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})', 258, 2, [ 0x81, 0x02 ], 'write full write alternation short');
  serialize('b8(&0x80: b16{x1,b15 => foo} | b8 => foo)/(0-0x7f: b8  => foo| b16{x1{1},b15 => foo})', { foo: 3 } , 1, [ 0x03 ], 'write full named write alternation byte');
  serialize('b8(&0x80: b16{x1,b15 => foo} | b8 => foo)/(0-0x7f: b8  => foo| b16{x1{1},b15 => foo})', { foo: 258 }, 2, [ 0x81, 0x02 ], 'write full named write alternation short');
});
