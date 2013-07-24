#!/usr/bin/env node

require('./proof')(3, function (offsetsOf) {
    offsetsOf('b16{x1, foo: b9, bar: -b6}', [ 0x81, 0x01 ], [
        { pattern: 'b16{x1,b9,-b6}', value: [
            {  pattern: 'x1', bit: 0, bits: 1, hex: '80', binary: '1' },
            {  name: 'foo', pattern: 'b9', value: 4, bit: 1, bits: 9, hex: '0100', binary: '000000100' },
            {  name: 'bar', pattern: '-b6', value: 1, bit: 10, bits: 6, hex: '01', binary: '000001' },
        ], offset: 0, length: 2, hex: '8101' }
    ], 'read a named masked alternative with packed bits')
})
