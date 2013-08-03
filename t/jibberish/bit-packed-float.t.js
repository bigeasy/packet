#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('b16{foo:b3,x6,b7f}')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 17', 'parse invalid bit pattern')
    }
})
