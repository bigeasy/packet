#!/usr/bin/env node

require('./proof')(9, function (parseEqual) {
    parseEqual({ require: true }, 'foo: b16', [ 0xA0, 0xB0 ], 2, { foo: 0xA0B0 }, 'word')
    parseEqual({ require: true }, 'foo: b16', [ 0xA0, 0xB0 ], [ 1, 1 ], { foo: 0xA0B0 }, 'word incremental')
    parseEqual({ require: true, subsequent: true }, 'foo: b16', [ 0xA0, 0xB0 ], 2, { foo: 0xA0B0 }, 'word subsequent')
})
