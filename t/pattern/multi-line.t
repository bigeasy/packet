#!/usr/bin/env coffee
require("./proof") 1, ({ parseEqual }) ->
  pattern = """
    -l16,
    b8
  """
  parseEqual pattern,
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
  ], "parse a multi-line pattern"
