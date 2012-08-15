#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b16[12], z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 10", "error index after array");
  }
});
