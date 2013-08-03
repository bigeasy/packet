#!/usr/bin/env node

// This is now a legacy test because wildcards (asterisks) are no longer
// supported.
require('./proof')(1, function (parse, equal) {
    try {
        parse('b8(0-*: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})')
    } catch (e) {
        equal(e.message, 'invalid number at character 6', 'parse invalid alternation range with any')
    }
})
