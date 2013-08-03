#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:b8z|twiddle(8, "utf8"),z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 28', 'error index after pipeline')
    }
})
