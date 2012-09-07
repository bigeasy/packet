#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
  parseEqual("-l16, b8",
  [
    { signed: true
    , bits: 16
    , endianness: "l"
    , bytes: 2
    , type: "n"
    , exploded: true
    , arrayed: false
    , repeat: 1
    }
  ,
    { signed: false
    , bits: 8
    , endianness: "b"
    , bytes: 1
    , type: "n"
    , exploded: false
    , arrayed: false
    , repeat: 1
    }
  ], "parse a signed little-endian 16 bit number followed by a byte");
});
