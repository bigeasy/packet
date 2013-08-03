#!/usr/bin/env node

require('./proof')(3, function (offsetsOf) {
    offsetsOf('x16{0xaaaa}, foo: b16', [ 0x81, 0x01, 0x01, 0x00 ], [
        { pattern: 'x16{0xaaaa}', offset: 0, length: 2, hex: '8101' },
        { name: 'foo', pattern: 'b16', value: 256, offset: 2, length: 2, hex: '0100' }
    ], 'read a skipped word and a named word')
})
