#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8[0]")
  } catch (e) {
    equal(e.message, "array length must be non-zero at character 4", "error array length is zero");
  }
});
