#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:l16b8')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 8', 'parse two patterns together without a comma.')
    }
})
