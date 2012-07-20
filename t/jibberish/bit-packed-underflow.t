#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b16{b3,x6,b6}")
  } catch (e) {
    equal(e.message, "bit pack pattern underflow at character 5", "parse bit packed pattern underflow");
  }
});
