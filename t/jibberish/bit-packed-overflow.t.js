#!/usr/bin/env node
require('./proof')(1, function (parse, equal) {
    try {
        parse('b16{foo:b3,x6,bar:b8}')
    } catch (e) {
        equal(e.message, 'bit pack pattern overflow at character 5', 'parse bit packed pattern overflow')
    }
})
