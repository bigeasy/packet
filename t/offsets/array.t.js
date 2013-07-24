#!/usr/bin/env node

require('./proof')(3, function (offsetsOf) {
    offsetsOf('numbers: b8[3], byte: b8', [
        0xab, 0xcd, 0xef, 0xff
    ], [
        { name: 'numbers',
            pattern: 'b8[3]',
            value: [{ pattern: 'b8', value: 0xab, offset: 0, length: 1, hex: 'ab' },
                            { pattern: 'b8', value: 0xcd, offset: 1, length: 1, hex: 'cd' },
                            { pattern: 'b8', value: 0xef, offset: 2, length: 1, hex: 'ef' }],
            offset: 0,
            length: 3,
            hex: 'abcdef' },
        { name: 'byte', pattern: 'b8', value: 0xff, offset: 3, length: 1, hex: 'ff' }
    ], 'read a named array of 3 bytes')
})
