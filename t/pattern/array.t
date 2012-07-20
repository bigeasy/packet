#!/usr/bin/env node
require("./proof")(1, function (parseEqual) {
  parseEqual("b8[8]", [
    { signed: false
    , bits: 8
    , endianness: "b"
    , bytes: 1
    , type: "n"
    , exploded: false
    , arrayed: true
    , repeat: 8
    }
  ], "parse an array of 8 bytes.");
});
