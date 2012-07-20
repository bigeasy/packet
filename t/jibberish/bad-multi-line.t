#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8,\nb7")
  } catch (e) {
    equal(e.message, "bit size must be divisible by 8 at line 2 character 2", "parse a bad multi-line pattern");
  }
});
