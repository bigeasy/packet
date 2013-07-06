#!/usr/bin/env node
require("./proof")(2, function (parse, equal) {
  try {
    parse("b8z<0xA z>");
  } catch (e) {
    equal(e.message, "invalid terminator value at character 5", "parse bad terminator value");
  }
  try {
    parse("b8z<0x0A,a>")
  } catch (e) {
    equal(e.message, "invalid terminator value at character 10",
                     "parse bad subsequent terminator value");
  }
});
