#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:b8{l4,b4}')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 7', 'parse a little-endian integer packed in an integer')
    }
})
