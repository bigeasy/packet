#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('steve: b8z, z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 13', 'error index after named pattern')
    }
})
