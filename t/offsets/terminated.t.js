#!/usr/bin/env node

require('./proof')(3, function (offsetsOf) {
    offsetsOf('numbers: b8z', [
        0xab, 0xcd, 0xef, 0x00
    ], [
        { name: 'numbers',
            pattern: 'b8z',
            value: [{ pattern: 'b8', value: 0xab, offset: 0, length: 1, hex: 'ab' },
                            { pattern: 'b8', value: 0xcd, offset: 1, length: 1, hex: 'cd' },
                            { pattern: 'b8', value: 0xef, offset: 2, length: 1, hex: 'ef' }],
            offset: 0,
            terminator: { value: [ 0 ], offset: 3, length: 1, hex: '00' },
            length: 4,
            hex: 'abcdef00' }
    ], 'offsets of a named zero terminated array')
})
