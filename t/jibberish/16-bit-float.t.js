#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b16f")
  } catch (e) {
    equal(e.message, "floats can only be 32 or 64 bits at character 2", "parse a float pattern other than 32 or 64 bits");
  }
});
