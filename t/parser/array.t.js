#!/usr/bin/env node
require('./proof')(27, function (parseEqual) {
  var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ];
  var field = bytes.slice(0);
  parseEqual({ require: true }, 'b8[4], b8[4]', bytes, 8, bytes.slice(0, 4), bytes.slice(4), 'read two arrays array of 4 bytes pre-compiled');
  parseEqual({ require: true, subsequent: true }, 'b8[4], b8[4]', bytes, 8, bytes.slice(0, 4), bytes.slice(4), 'read two arrays of 4 bytes pre-compiled, continue');
  parseEqual({
      require: true
    },
    'b8[4], b8[4]', bytes, [ 1, 7 ],
    bytes.slice(0, 4), bytes.slice(4),
    'read two arrays of 4 bytes pre-compiled, continue');
  parseEqual({ compiler: false }, 'b8[8]', bytes, 8, field, 'read an array of 8 bytes');
  bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ];
  parseEqual({ require: true }, 'b16[3], b16', bytes, 8, [ 0x0102, 0x0304, 0x0506 ], 0x0708, 'read an array of 3 bytes pre-compiled');
  parseEqual({
      require: true, subsequent: true
    },
    'b16[3], b16',
    bytes, 8,
    [ 0x0102, 0x0304, 0x0506 ], 0x0708,
    'read an array of 3 bytes pre-compiled, continue');
  parseEqual({
      require: true
    },
    'b16[3], b16',
    bytes, [ 4, 3, 1 ],
    [ 0x0102, 0x0304, 0x0506 ], 0x0708,
    'read an array of 3 bytes pre-compiled, fallback');
});
