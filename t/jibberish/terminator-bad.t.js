#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8z<0x0A,a>")
  } catch (e) {
    equal(e.message, "invalid terminator at character 10", "parse bad terminator");
  }
});
