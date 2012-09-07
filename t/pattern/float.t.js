#!/usr/bin/env node
require("./proof")(1, function (parseEqual) {
  parseEqual("b32f", [
    { signed: true
    , bits: 32
    , endianness: "b"
    , bytes: 4
    , type: "f"
    , exploded: true
    , arrayed: false
    , repeat: 1
    }
  ], "test: parse a single 32 bit float.");
});
