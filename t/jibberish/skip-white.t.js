#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse(' !')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 2', 'skip leading whitespace')
    }
})
