#!/usr/bin/env coffee
require("./proof") 1, ({ parseEqual }) ->
  parseEqual "-b16", [
    { signed: true
    , bits: 16
    , endianness: "b"
    , bytes: 2
    , type: "n"
    , exploded: true
    , arrayed: false
    , repeat: 1
    }
  ], "parse a single signed 16 bit number"
