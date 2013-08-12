#!/usr/bin/env node

require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'foo: l32f', [ 0xcd, 0xcc, 0x2c, 0x41 ], 4, { foo: 10.800000190734863 }, 'positive')
    parseEqual({ require: true, subsequent: true }, 'foo: l32f', [ 0x00, 0x00, 0x20, 0xc1 ], 4, { foo: -10 }, 'negative, subsequent')
    parseEqual({ require: true }, 'foo: l32f', [ 0x00, 0x00, 0x20, 0xc1 ], [ 1, 3 ], { foo: -10 }, 'negative, fallback')
    parseEqual({ require: true }, 'foo: l32f', [ 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 3 ], { foo: 10.800000190734863 }, 'positive, fallback')
    parseEqual({ require: true }, 'foo: b8, bar: l32f', [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, { foo: 1, bar: 10.800000190734863 }, 'positive, buffers only')
    parseEqual({ require: true, subsequent: true }, 'foo: b8, bar: l32f', [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], 5, { foo: 1, bar: 10.800000190734863 }, 'positive, buffers only, subsequent')
    parseEqual({ require: true }, 'foo: b8, bar: l32f', [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ], [ 0, 5 ], { foo: 1, bar: 10.800000190734863 }, 'positive, buffers only, fallback')
    // Same as above, but big-endian.
    parseEqual({ require: true }, 'foo: b32f', [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(), 4, { foo: 10.800000190734863 }, 'big positive')
    parseEqual({ require: true, subsequent: true }, 'foo: b32f', [ 0x00, 0x00, 0x20, 0xc1 ].reverse(), 4, { foo: -10 }, 'negative, subsequent')
    parseEqual({ require: true }, 'foo: b32f', [ 0x00, 0x00, 0x20, 0xc1 ].reverse(), [ 1, 3 ], { foo: -10 }, 'negative, fallback')
    parseEqual({ require: true }, 'foo: b32f', [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(), [ 1, 3 ], { foo: 10.800000190734863 }, 'big positive, fallback')
    parseEqual({ require: true, buffersOnly: true }, 'foo: b8, bar: b32f', new Buffer([ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse()), 5, { foo: 1, bar: 10.800000190734863 }, 'big positive, buffers only')
    parseEqual({ require: true, buffersOnly: true, subsequent: true }, 'foo: b8,bar: b32f', new Buffer([ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse()), 5, { foo: 1, bar: 10.800000190734863 }, 'big positive, buffers only, subsequent')
    parseEqual({ require: true, buffersOnly: true }, 'foo: b8, bar: b32f', new Buffer([ 0xcd, 0xcc, 0x2c, 0x41, 0x01 ].reverse()), [ 0, 5 ], { foo: 1, bar: 10.800000190734863 }, 'big positive, buffers only, fallback')
    // Two in a row.
    parseEqual({ require: true }, 'foo: l32f, bar: l32f', [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], 8, { foo: -10, bar: 10.800000190734863 }, 'two in a row')
    parseEqual({ require: true, subsequent: true }, 'foo: l32f, bar: l32f', [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], 8, { foo: -10, bar: 10.800000190734863 }, 'two in a row, subsequent')
    parseEqual({ require: true }, 'foo: l32f, bar: l32f', [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ], [ 1, 7 ], { foo: -10, bar: 10.800000190734863 }, 'two in a row, fallback')
})
