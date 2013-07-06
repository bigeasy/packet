#!/usr/bin/env node

require("./proof")(12, function (parseEqual) {
  parseEqual("b8 => byte", [ 1 ], 1, { byte: 1 }, "named byte");
  parseEqual("b8", [ 1 ], 1, 1, "byte");
  parseEqual({ require: true }, "b8", [ 1 ], 1, 1, "named byte");
  parseEqual({ require: true, subsequent: true }, "b8", [ 1 ], 1, 1, "named byte");
});
