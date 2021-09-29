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
    $fixed: {
        fixed: {
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
                flags: [ $ => $.fixed.header.type, [
                    { $_: 'publish' }, [{ dup: 1, qos: 2, retain: 1 }, 4 ],
                    { $_: [ 'pubrel', 'subscribe', 'unsubscribe' ] }, [ 4, '2' ],
                    { $_: [] }, [ 4, '0' ]
                ]]
            }, 8 ],
            length: '$integer'
        }
    },
    $variable: {
        variable: [ $ => $.fixed.header.type, [
            { $_: 'connect' }, {
                // TODO Can we nest the definitions?
                protocol: [ [ $_ => Buffer.from('MQTT') ], [ 16, [ Buffer ] ], [ $_ => $_.toString() ] ],
                version: [ [ $_ => 4 ], 8, [] ],
                flags: [{
                    username: [ [ ($_, $) => $.variable.username == null ? 0 : 1 ], 1, [ $_ => $_ ] ],
                    password: [ [ ($_, $) => $.variable.password == null ? 0 : 1 ], 1, [] ],
                    wilRetain: 1,
                    willQoS: 2,
                    willFlag: 1,
                    cleanStart: 1,
                    reserved: [ 1, '0' ]
                }, 8 ],
                keepAlive: 16,
                clientId: [ [ $_ => Buffer.from($_ == null ? '' : $_) ], [ 16, [ Buffer ] ], [ $_ => $_.toString() ] ]
            },
            { $_: [ 'pingreq', 'pingresp' ] }, null
        ]]
    },
    fixed: '$fixed',
    variable: '$variable'
}
