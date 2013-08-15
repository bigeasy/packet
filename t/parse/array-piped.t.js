#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'foo:b8[3]|ascii()', [ 0x41, 0x42, 0x43 ], 3, {foo:'ABC'}, 'read a 3 byte ASCII string')
})
