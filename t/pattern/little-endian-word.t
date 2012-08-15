#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
  parseEqual("l16", [
    { signed: false
    , bits: 16
    , endianness: "l"
    , bytes: 2
    , type: "n"
    , exploded: false
    , arrayed: false
    , repeat: 1
    }
  ], "parse a single little-endian 16 bit number");
});
