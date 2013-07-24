#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('name: b16[12], z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 16', 'error index after array')
    }
})
