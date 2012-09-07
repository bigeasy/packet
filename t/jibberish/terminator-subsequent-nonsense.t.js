#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8z< 10 , 13 > , z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 18", "error index after terminator");
  }
});
