#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('x8{a}')
    } catch (e) {
        equal(e.message, 'invalid number format at character 4', 'parse bad fill number.')
    }
})
