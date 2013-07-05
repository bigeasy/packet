#!/usr/bin/env node

require('./proof')(9, function (parseEqual) {
  parseEqual("b16", [ 0xA0, 0xB0 ], 2, 0xA0B0, "word");
  parseEqual("b16", [ 0xA0, 0xB0 ], [ 1, 1 ], 0xA0B0, "word incremental");
  parseEqual({ subsequent: true }, "b16", [ 0xA0, 0xB0 ], 2, 0xA0B0, "word subsequent");
});
