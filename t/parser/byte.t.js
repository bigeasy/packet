#!/usr/bin/env node

require('./proof')(9, function (parseEqual) {
    parseEqual('byte: b8', [ 1 ], 1, { byte: 1 }, 'named byte')
    parseEqual({ require: true }, 'byte: b8', [ 1 ], 1, { byte: 1 }, 'named byte')
    parseEqual({ require: true, subsequent: true }, 'byte: b8', [ 1 ], 1, { byte: 1 }, 'named byte')
})
