#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
  parseEqual("b8z", [
    { signed: false
    , bits: 8
    , endianness: "b"
    , bytes: 1
    , type: "n"
    , exploded: false
    , arrayed: true
    , repeat: Number.MAX_VALUE
    , terminator: [ 0 ]
    }
  ], "parse a list of bytes terminated by zero.");
});
