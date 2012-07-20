#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8z => steve,z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 14", "error index after named pattern");
  }
});
