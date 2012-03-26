#!/usr/bin/env coffee
require("./proof") 1, ({ parseEqual }) ->
  parseEqual "b8{b2 => high, x1, b2 => low, x3}", [
    { "signed": false
    , "endianness": "b"
    , "bits": 8
    , "type": "n"
    , "bytes": 1
    , "exploded": false
    , "packing":
      [
        { "signed": false
        , "endianness": "b"
        , "bits": 2
        , "type": "n"
        , "bytes": 2
        , "repeat": 1
        , "arrayed": false
        , "exploded": false
        , "name": "high"
        }
      ,
        { "signed": false
        , "endianness": "x"
        , "bits": 1
        , "type": "n"
        , "bytes": 1
        , "repeat": 1
        , "arrayed": false
        , "exploded": false
        }
      ,
        { "signed": false
        , "endianness": "b"
        , "bits": 2
        , "type": "n"
        , "bytes": 2
        , "repeat": 1
        , "arrayed": false
        , "exploded": false
        , "name": "low"
        }
      ,
        { "signed": false
        , "endianness": "x"
        , "bits": 3
        , "type": "n"
        , "bytes": 3
        , "repeat": 1
        , "arrayed": false
        , "exploded": false
        }
      ]
    }
  ], "parse a named bit packed pattern."
