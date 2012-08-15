#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8{ 0x00 } , z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 14", "error index after padding");
  }
});
