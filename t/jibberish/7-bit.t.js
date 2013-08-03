#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('b7')
    } catch (e) {
        equal(e.message, 'bit size must be divisible by 8 at character 2', 'parse a 7 bit pattern')
    }
})
