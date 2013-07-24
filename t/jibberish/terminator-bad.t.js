#!/usr/bin/env node
require('./proof')(2, function (parse, equal) {
    try {
        parse('foo:b8z<0xA z>')
    } catch (e) {
        equal(e.message, 'invalid terminator value at character 9', 'parse bad terminator value')
    }
    try {
        parse('bar:b8z<0x0A,a>')
    } catch (e) {
        equal(e.message, 'invalid terminator value at character 14',
                                          'parse bad subsequent terminator value')
    }
})
