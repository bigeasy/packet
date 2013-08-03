#!/usr/bin/env node

require('./proof')(3, function (parseEqual) {
    parseEqual({ compile: false }, 'foo: b8', [ 1 ], 1, { foo: 1 }, 'byte')
})
