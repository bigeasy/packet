#!/usr/bin/env node

require('./proof')(3, function (offsetsOf) {
    offsetsOf('number: l32f', new Buffer([ 0x00, 0x00, 0x20, 0xc1 ]), [
        { name: 'number', pattern: 'l32f', value: -10, offset: 0, length: 4, hex: '000020c1' }
    ], 'byte')
})
