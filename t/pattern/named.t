#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
  parseEqual("b8z|utf8()|atoi(8) => mode, b32 => l", [
    { signed: false
    , bits: 8
    , endianness: "b"
    , bytes: 1
    , type: "n"
    , name: "mode"
    , exploded: false
    , arrayed: true
    , repeat: Number.MAX_VALUE
    , terminator: [ 0 ]
    , pipeline:
      [
        { name: "utf8"
        , parameters: []
        }
        ,
        { name: "atoi"
        , parameters: [ 8 ]
        }
      ]
    },
    { signed: false
    , endianness: "b"
    , bits: 32
    , bytes: 4
    , type: "n"
    , exploded: false
    , arrayed: false
    , repeat: 1
    , name: "l"
    }
  ], "parse a named element.");
});
