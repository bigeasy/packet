#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b16/b8, z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 9", "error index after length encoding");
  }
});
