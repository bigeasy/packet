#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
  parseEqual("-l16", [
    { signed: true
    , bits: 16
    , endianness: "l"
    , bytes: 2
    , type: "n"
    , exploded: true
    , arrayed: false
    , repeat: 1
    }
  ], "parse a single signed little-endian 16 bit number");
});
