#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('foo:b8{ 0x00 } , z')
    } catch (e) {
        equal(e.message, 'invalid pattern at character 18', 'error index after padding')
    }
})
