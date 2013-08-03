#!/usr/bin/env node
require('./proof')(2, function (parse, equal) {
    try {
        parse('name: b8,\nb7')
    } catch (e) {
        equal(e.message, 'bit size must be divisible by 8 at line 2 character 2',
                                          'parse a bad multi-line pattern')
    }
    try {
        parse('name: \nb8,\nb7')
    } catch (e) {
        equal(e.message, 'bit size must be divisible by 8 at line 3 character 2',
                                          'skip initial newline in report')
    }
})
