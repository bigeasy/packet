#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('blurdy')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 1', 'parse utter nonsense')
    }
})
