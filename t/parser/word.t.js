#!/usr/bin/env node

require('./proof')(6, function (parseEqual) {
  parseEqual("b16", [ 0xA0, 0xB0 ], 2, 0xA0B0, "word");
  parseEqual("b16", [ 0xA0, 0xB0 ], [ 1, 1 ], 0xA0B0, "word incremental");
});
