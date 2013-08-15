#!/usr/bin/env node

require('./proof')(0, function (serialize) {
    serialize({
        message:    'write a byte',
        pattern:    'foo: b8',
        object:     { foo: 0x01 },
        length:     1,
        expected:   [ 0x01 ],
        require:    true
    })
})
