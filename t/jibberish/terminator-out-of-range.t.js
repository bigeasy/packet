#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('b8z <300>')
    } catch (e) {
        equal(e.message, 'name required at character 3', 'parse terminator out of range')
    }
})
