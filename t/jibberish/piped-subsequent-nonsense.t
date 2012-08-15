#!/usr/bin/env node
require("./proof")(1, function (parse, equal) {
  try {
    parse("b8z|twiddle(8, 'utf8'),z")
  } catch (e) {
    equal(e.message, "invalid pattern at character 24", "error index after pipeline");
  }
});
