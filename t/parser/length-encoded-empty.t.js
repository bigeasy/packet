#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual('foo: b16/b8', [ 0x00, 0x00, 0x01, 0x02], 2, { foo: [] }, 'read a length encoded array of bytes that is empty')
})
