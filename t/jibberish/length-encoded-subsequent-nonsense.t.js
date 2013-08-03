#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:b16/b8, z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 13', 'error index after length encoding')
    }
})
