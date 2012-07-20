#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8z<300>")
  } catch (e) {
    equal(e.message, "terminator value out of range at character 5", "parse terminator out of range");
  }
});
