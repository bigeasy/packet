#!/usr/bin/env node

require('./proof')(0, function (parse) {
    parse({
        message:        'named byte',
        pattern:        'byte: b8',
        bytes:          [ 1 ],
        length:         1,
        expected:       { byte: 1 }
    })

    parse({
        message:        'named byte',
        pattern:        'byte: b8',
        bytes:          [ 1 ],
        length:         1,
        expected:       { byte: 1 },
        require:        true
    })

    parse({
        message:        'named byte and subsequent pattern',
        pattern:        'byte: b8',
        bytes:          [ 1 ],
        length:         1,
        expected:       { byte: 1 },
        require:        true,
        subsequent:     true
    })
})
