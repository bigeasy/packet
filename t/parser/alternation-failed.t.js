#!/usr/bin/env node

require('./proof')(1, function (parseEqual, equal) {
    try {
        parseEqual('b8(&0x80: b16{x1,b15})', [ 0x7f ], 'unused');
    } catch (e) {
        equal(e.message, 'Cannot match branch.', 'failed alternation');
    }
});
