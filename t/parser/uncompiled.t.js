#!/usr/bin/env node

require('./proof')(0, function (parseEqual) {
    parseEqual({ compile: false }, 'foo: b8', [ 1 ], 1, { foo: 1 }, 'byte')
})
