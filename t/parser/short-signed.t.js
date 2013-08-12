#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'foo: -b16', [ 0x80, 0x00 ], 2, { foo: -32768 }, 'mininum')
    parseEqual('foo: -b16', [ 0xff, 0xff ], 2, { foo: -1 }, 'negative')
    parseEqual('foo: -b16', [ 0x7f, 0xff ], 2, { foo: 32767 }, 'maximum')
    parseEqual('foo: -b16', [ 0x01, 0x02 ], 2, { foo: 258 }, 'positive')
})
