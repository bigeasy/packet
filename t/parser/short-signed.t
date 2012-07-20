#!/usr/bin/env node
require('./proof')(12, function (parseEqual) {
  parseEqual("-b16", [ 0x80, 0x00 ], 2, -32768, "mininum");
  parseEqual("-b16", [ 0xff, 0xff ], 2, -1, "negative");
  parseEqual("-b16", [ 0x7f, 0xff ], 2, 32767, "maximum");
  parseEqual("-b16", [ 0x01, 0x02 ], 2, 258, "positive");
});
