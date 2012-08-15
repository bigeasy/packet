#!/usr/bin/env node
require("./proof")(1, function (parseEqual) {
  parseEqual("-b8", [
    { signed: true
    , bits: 8
    , endianness: "b"
    , bytes: 1
    , type: "n"
    , exploded: true
    , arrayed: false
    , repeat: 1
    }
  ], "parse a single signed byte");
});
