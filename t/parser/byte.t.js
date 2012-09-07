#!/usr/bin/env node

require("./proof")(3, function (parseEqual) {
  parseEqual("b8", [ 1 ], 1, 1, "byte");
});
