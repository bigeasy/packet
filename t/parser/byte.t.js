#!/usr/bin/env node

require("./proof")(6, function (parseEqual) {
  parseEqual("b8 => byte", [ 1 ], 1, { byte: 1 }, "named byte");
  parseEqual("b8", [ 1 ], 1, 1, "byte");
});
