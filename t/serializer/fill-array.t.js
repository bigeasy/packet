#!/usr/bin/env node
require('./proof')(2 * 3 + 1, function (serialize, deepEqual) {
    serialize({ require: true },
              [ 0x01, 0x01, 0x01, 0x01, 0xff, 0xff ],
              'x16[2]{0}, foo: b16', { foo: 1 }, 6,
              [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 ],
              'write a 16 bit integer after filling four bytes')
    var buffer = [ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 ]
    serialize({ require: true },
              buffer, 'x8[2]{0},x8[2]{2}', 4,
              [ 0x00, 0x00, 0x02, 0x02 ],
              'write 2 zero filled bytes then two 2 filled bytes')
    deepEqual(buffer, [ 0x00, 0x00, 0x02, 0x02, 0x01, 0x01 ], 'no overwrite')
})
