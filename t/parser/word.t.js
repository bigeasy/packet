#!/usr/bin/env node

require('./proof')(9, function (parseEqual) {
  parseEqual({ require: true }, 'b16', [ 0xA0, 0xB0 ], 2, 0xA0B0, 'word');
  parseEqual({ require: true }, 'b16', [ 0xA0, 0xB0 ], [ 1, 1 ], 0xA0B0, 'word incremental');
  parseEqual({ require: true, subsequent: true }, 'b16', [ 0xA0, 0xB0 ], 2, 0xA0B0, 'word subsequent');
});
