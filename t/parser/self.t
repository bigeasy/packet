#!/usr/bin/env node
require('./proof')(1, function (Parser, ok) {
  var self = this;
  var parser = new Parser(this);
  parser.extract("b8", function (field) { ok(self == this, "set self") });
  parser.parse([ 1 ]);
});
