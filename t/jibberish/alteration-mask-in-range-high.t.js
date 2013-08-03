#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('b8(&0x01-&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})')
    } catch (e) {
        equal(e.message, 'masks not permitted in ranges at character 4', 'parse invalid alternation range with mask higher')
    }
})
