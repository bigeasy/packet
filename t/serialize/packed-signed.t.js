#!/usr/bin/env node

require('./proof')(2 * 3 + 1, function (serialize, equal) {
    serialize('b8{x2,-b3,x3}', -4, 1, [ 0x20 ], 'write a bit packed signed negative integer');
    serialize('b8{x2,-b3,x3}', 3, 1, [ 0x18 ], 'write a bit packed signed integer');
    try {
        serialize('b8{x2,-b3,x3}', 4, 1, [ 0x18 ], '');
    } catch (e) {
        equal(e.message, 'value 4 will not fit in 3 bits', 'overflow');
    }
});
