#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b16{b3,x6,b7f}")
  } catch (e) {
    equal(e.message, "invalid pattern at character 13", "parse invalid bit pattern");
  }
});
