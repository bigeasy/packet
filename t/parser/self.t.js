#!/usr/bin/env node
require('./proof')(1, function (createParser, ok) {
  var self = this;
  var parser = createParser({ context: this });
  parser.extract("b8", function (field) { ok(self == this, "set self") });
  parser.parse([ 1 ], 0, 1);
});
