#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual('foo:-b8', [ 0xff ], 1, {foo:-1}, 'negative')
    parseEqual('foo:-b8', [ 0x80 ], 1, {foo:-128}, 'minimum')
    parseEqual('foo:-b8', [ 0x7f ], 1, {foo:127}, 'maximum')
    parseEqual('foo:-b8', [ 0x02 ], 1, {foo:2}, 'positive')
})
