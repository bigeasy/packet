#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('name: b8[0]')
    } catch (e) {
        equal(e.message, 'array length must be non-zero at character 10', 'error array length is zero')
    }
})
