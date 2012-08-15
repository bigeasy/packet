#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8{l4,b4}")
  } catch (e) {
    equal(e.message, "invalid pattern at character 3", "parse a little-endian integer packed in an integer");
  }
});
