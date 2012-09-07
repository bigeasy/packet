#!/usr/bin/env node
require('./proof')(12, function (parseEqual) {
  parseEqual("-b8", [ 0xff ], 1, -1, "negative");
  parseEqual("-b8", [ 0x80 ], 1, -128, "minimum");
  parseEqual("-b8", [ 0x7f ], 1, 127, "maximum");
  parseEqual("-b8", [ 0x02 ], 1, 2, "positive");
});
