#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:b8z< 10 , 13 > , z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 22', 'error index after terminator')
    }
})
