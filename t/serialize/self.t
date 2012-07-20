#!/usr/bin/env node
require('./proof')(1, function (Serializer, ok) {
  var self = this;
  var serializer = new Serializer(this);
  serializer.write("b8", 0x01, function () { ok(this === self, "set self") });
});
