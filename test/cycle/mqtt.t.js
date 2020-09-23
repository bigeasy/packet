require('proof')(0, okay => {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'conditional/mqtt',
        define: {
            $integer: [
                [
                    value => value <= 0x7f, 8,
                    value => value <= 0x3fff, [ 16, [ 0x80, 7 ], 7 ],
                    value => value <= 0x1fffff, [ 24, [ 0x80, 7 ], 7 ],
                    // TODO Assume that we expand the middle, so that if
                    // there are three entries and the size is four or more,
                    // the middle repeated, if there are two entries the end
                    // is repeated.
                    true, [ 32, [ 0x80, 7 ], 7 ]
                ],
                [ 8,
                    sip => (sip & 0x80) == 0, 8,
                    true, [ 8,
                        sip => (sip & 0x80) == 0, [ 16, [ 0x80, 7 ] ],
                        true, [ 8,
                            sip => (sip & 0x80) == 0, [ 24, [ 0x80, 7 ] ],
                            true, [ 32, [ 0x80, 7 ] ]
                        ]
                    ]
                ]
            ],
            object: {
                header: [{
                    type: [ 4, [
                        'connect', 'connack',
                        'publish', 'puback', 'pubrec',
                        'pubcomp', 'subscribe', 'suback',
                        'unsubscribe', 'unsuback',
                        'pingreq', 'pingresp',
                        'disconnect', 'auth'
                    ]],
                    flags: [ $ => $.header.type, [
                        { $_: 'publish' }, [{ dup: 1, qos: 2, retain: 1 }, 4 ]],
                        { $_: [] }, [ 4, '0' ]
                    ]
                }, 8 ]
            }
        },
        objects: [{
            header: { type: 'connect', flags: null }
        }]
    })
})
