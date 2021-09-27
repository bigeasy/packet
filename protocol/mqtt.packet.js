exports.packet = {
    $integer: [
        [
            value => value < 0x7f, 8,
            value => value < 0x3fff, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
            value => value < 0x1fffff, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
            true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
        ], [ 8,
            sip => (sip & 0x80) == 0, 8,
            true, [ 8,
                sip => (sip & 0x80) == 0, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                true, [ 8,
                    sip => (sip & 0x80) == 0, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                    true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
                ]
            ]
        ]
    ],
    mqtt: {
        header: [{
            type: [ 4, [
                '\u0000',
                'connect', 'connack',
                'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp',
                'subscribe', 'suback',
                'unsubscribe', 'unsuback',
                'pingreq', 'pingresp',
                'disconnect', 'auth'
            ]],
            flags: [ $ => $.header.type, [
                { $_: 'publish' }, [{ dup: 1, qos: 2, retain: 1 }, 4 ],
                { $_: [ 'pubrel', 'subscribe', 'unsubscribe' ] }, [ 4, '2' ],
                { $_: [] }, [ 4, '0' ]
            ]]
        }, 8 ],
        variable: [ $ => $.header.type, [
            { $_: 'connect' }, { value: 8 },
            { $_: [ 'pingreq', 'pingresp' ] }, null
        ]],
        body: [ '$integer' , [ Buffer ]]
    }
}
