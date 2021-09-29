const lookup = [
  [
    '\x00',        'connect',
    'connack',     'publish',
    'puback',      'pubrec',
    'pubrel',      'pubcomp',
    'subscribe',   'suback',
    'unsubscribe', 'unsuback',
    'pingreq',     'pingresp',
    'disconnect',  'auth'
  ]
]

const sizeOf = {
    fixed: function () {
        return function (fixed) {
            let $start = 0

            $start += 1


            if ((value => value < 0x7f)(fixed.fixed.length)) {
                $start += 1
            } else if ((value => value < 0x3fff)(fixed.fixed.length)) {
                $start += 2
            } else if ((value => value < 0x1fffff)(fixed.fixed.length)) {
                $start += 3
            } else {
                $start += 4
            }

            return $start
        }
    } (),
    variable: function () {
        return function (variable) {
            let $start = 0, $$ = []

            switch (($ => $.fixed.header.type)(variable)) {
            case 'connect':

                $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                $start += 2

                $start += 1 * $$[0].length

                $start += 1

                $start += 1

                $start += 2

                $$[-1] = ($_ => Buffer.from($_ == null ? '' : $_))(variable.variable.clientId)

                $start += 2

                $start += 1 * $$[-1].length

                break

            case 'pingreq':


                break

            case 'pingresp':


                break
            }

            return $start
        }
    } ()
}

const serializer = {
    all: function ($lookup) {
        return {
            fixed: function () {
                return function (fixed, $buffer, $start) {
                    let $_

                    $_ =
                        $lookup[0].indexOf(fixed.fixed.header.type) << 4 & 0xf0

                    switch (($ => $.fixed.header.type)(fixed)) {
                    case 'publish':

                        $_ |=
                            fixed.fixed.header.flags.dup << 3 & 0x8 |
                            fixed.fixed.header.flags.qos << 1 & 0x6 |
                            fixed.fixed.header.flags.retain & 0x1

                        break

                    case 'pubrel':

                        $_ |=
                            0x2 & 0xf

                        break

                    case 'subscribe':

                        $_ |=
                            0x2 & 0xf

                        break

                    case 'unsubscribe':

                        $_ |=
                            0x2 & 0xf

                        break

                    default:

                        $_ |=
                            0x0 & 0xf

                        break
                    }

                    $buffer[$start++] = $_ & 0xff

                    if ((value => value < 0x7f)(fixed.fixed.length)) {
                        $buffer[$start++] = fixed.fixed.length & 0xff
                    } else if ((value => value < 0x3fff)(fixed.fixed.length)) {
                        $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length & 0x7f
                    } else if ((value => value < 0x1fffff)(fixed.fixed.length)) {
                        $buffer[$start++] = fixed.fixed.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length & 0x7f
                    } else {
                        $buffer[$start++] = fixed.fixed.length >>> 21 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = fixed.fixed.length & 0x7f
                    }

                    return { start: $start, serialize: null }
                }
            } (),
            variable: function () {
                return function (variable, $buffer, $start) {
                    let $_, $$ = []

                    switch (($ => $.fixed.header.type)(variable)) {
                    case 'connect':

                        $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        $$[0] = ($_ => 4)(variable.variable.version)

                        $buffer[$start++] = $$[0] & 0xff

                        $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(variable.variable.flags.username, variable)

                        $_ =
                            $$[0] << 7 & 0x80

                        $$[1] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                        $_ |=
                            $$[1] << 6 & 0x40

                        $_ |=
                            variable.variable.flags.wilRetain << 5 & 0x20 |
                            variable.variable.flags.willQoS << 3 & 0x18 |
                            variable.variable.flags.willFlag << 2 & 0x4 |
                            variable.variable.flags.cleanStart << 1 & 0x2 |
                            0x0 & 0x1

                        $buffer[$start++] = $_ & 0xff

                        $buffer[$start++] = variable.variable.keepAlive >>> 8 & 0xff
                        $buffer[$start++] = variable.variable.keepAlive & 0xff

                        $$[2] = ($_ => Buffer.from($_ == null ? '' : $_))(variable.variable.clientId)

                        $buffer[$start++] = $$[2].length >>> 8 & 0xff
                        $buffer[$start++] = $$[2].length & 0xff

                        $$[2].copy($buffer, $start, 0, $$[2].length)
                        $start += $$[2].length

                        break

                    case 'pingreq':


                        break

                    case 'pingresp':


                        break
                    }

                    return { start: $start, serialize: null }
                }
            } ()
        }
    } (lookup),
    inc: function ($lookup) {
        return {
            fixed: function () {
                return function (fixed, $step = 0) {
                    let $_, $bite

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                $bite = 0
                                $_ =
                                    $lookup[0].indexOf(fixed.fixed.header.type) << 4 & 0xf0

                                switch (($ => $.fixed.header.type)(fixed)) {
                                case 'publish':

                                    $_ |=
                                        fixed.fixed.header.flags.dup << 3 & 0x8 |
                                        fixed.fixed.header.flags.qos << 1 & 0x6 |
                                        fixed.fixed.header.flags.retain & 0x1

                                    break

                                case 'pubrel':

                                    $_ |=
                                        0x2 & 0xf

                                    break

                                case 'subscribe':

                                    $_ |=
                                        0x2 & 0xf

                                    break

                                case 'unsubscribe':

                                    $_ |=
                                        0x2 & 0xf

                                    break

                                default:

                                    $_ |=
                                        0x0 & 0xf

                                    break
                                }

                            case 1:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 1
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 2:

                                if ((value => value < 0x7f)(fixed.fixed.length)) {
                                    $step = 3
                                    continue
                                } else if ((value => value < 0x3fff)(fixed.fixed.length)) {
                                    $step = 5
                                    continue
                                } else if ((value => value < 0x1fffff)(fixed.fixed.length)) {
                                    $step = 8
                                    continue
                                } else {
                                    $step = 12
                                    continue
                                }

                            case 3:

                                $bite = 0
                                $_ = fixed.fixed.length

                            case 4:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 4
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                                $step = 17
                                continue

                            case 5:

                                $_ = fixed.fixed.length

                            case 6:

                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                            case 7:

                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 0 & 0x7f

                                $step = 17
                                continue

                            case 8:

                                $_ = fixed.fixed.length

                            case 9:

                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                            case 10:

                                if ($start == $end) {
                                    $step = 10
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                            case 11:

                                if ($start == $end) {
                                    $step = 11
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 0 & 0x7f

                                $step = 17
                                continue

                            case 12:

                                $_ = fixed.fixed.length

                            case 13:

                                if ($start == $end) {
                                    $step = 13
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 21 & 0x7f | 0x80

                            case 14:

                                if ($start == $end) {
                                    $step = 14
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                            case 15:

                                if ($start == $end) {
                                    $step = 15
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                            case 16:

                                if ($start == $end) {
                                    $step = 16
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 0 & 0x7f

                            }

                            break
                        }

                        return { start: $start, serialize: null }
                    }
                }
            } (),
            variable: function () {
                return function (variable, $step = 0, $$ = []) {
                    let $_, $bite, $copied = 0

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                switch (($ => $.fixed.header.type)(variable)) {
                                case 'connect':

                                    $step = 1
                                    continue

                                case 'pingreq':

                                    $step = 16
                                    continue

                                case 'pingresp':

                                    $step = 17
                                    continue
                                }

                            case 1:

                                $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                            case 2:

                                $bite = 1
                                $_ = $$[0].length

                            case 3:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 3
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 4: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 5:

                                $$[0] = ($_ => 4)(variable.variable.version)

                            case 6:

                                $bite = 0
                                $_ = $$[0]

                            case 7:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 7
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 8:

                                $bite = 0
                                $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(variable.variable.flags.username, variable)

                                $_ =
                                    $$[0] << 7 & 0x80

                                $$[1] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                                $_ |=
                                    $$[1] << 6 & 0x40

                                $_ |=
                                    variable.variable.flags.wilRetain << 5 & 0x20 |
                                    variable.variable.flags.willQoS << 3 & 0x18 |
                                    variable.variable.flags.willFlag << 2 & 0x4 |
                                    variable.variable.flags.cleanStart << 1 & 0x2 |
                                    0x0 & 0x1

                            case 9:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 9
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 10:

                                $bite = 1
                                $_ = variable.variable.keepAlive

                            case 11:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 11
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 12:

                                $$[2] = ($_ => Buffer.from($_ == null ? '' : $_))(variable.variable.clientId)

                            case 13:

                                $bite = 1
                                $_ = $$[2].length

                            case 14:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 14
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 15: {

                                const $bytes = Math.min($end - $start, $$[2].length - $copied)
                                $$[2].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[2].length) {
                                    $step = 15
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }
                                $step = 18
                                continue

                            case 16:
                                $step = 18
                                continue

                            case 17:

                            }

                            break
                        }

                        return { start: $start, serialize: null }
                    }
                }
            } ()
        }
    } (lookup)
}

const parser = {
    all: function ($lookup) {
        return {
            fixed: function () {
                return function ($buffer, $start) {
                    let $_, $sip = []

                    let fixed = {
                        fixed: {
                            header: {
                                type: 0,
                                flags: null
                            },
                            length: 0
                        }
                    }

                    $_ = $buffer[$start++]

                    fixed.fixed.header.type = $lookup[0][$_ >>> 4 & 0xf]

                    switch (($ => $.fixed.header.type)(fixed)) {
                    case 'publish':
                        fixed.fixed.header.flags = {
                            dup: 0,
                            qos: 0,
                            retain: 0
                        }

                        fixed.fixed.header.flags.dup = $_ >>> 3 & 0x1

                        fixed.fixed.header.flags.qos = $_ >>> 1 & 0x3

                        fixed.fixed.header.flags.retain = $_ & 0x1

                        break

                    case 'pubrel':

                        break

                    case 'subscribe':

                        break

                    case 'unsubscribe':

                        break

                    default:

                        break
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[0], fixed)) {
                        $start -= 1

                        fixed.fixed.length = $buffer[$start++]
                    } else {
                        $sip[1] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[1], fixed)) {
                            $start -= 2

                            fixed.fixed.length =
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            $sip[2] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[2], fixed)) {
                                $start -= 3

                                fixed.fixed.length =
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                            } else {
                                $start -= 3

                                fixed.fixed.length = (
                                    ($buffer[$start++] & 0x7f) << 21 |
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                                ) >>> 0
                            }
                        }
                    }

                    return fixed
                }
            } (),
            variable: function () {
                return function ($buffer, $start) {
                    let $_, $I = []

                    let variable = {
                        variable: null
                    }

                    switch (($ => $.fixed.header.type)(variable)) {
                    case 'connect':
                        variable.variable = {
                            protocol: [],
                            version: 0,
                            flags: {
                                username: 0,
                                password: 0,
                                wilRetain: 0,
                                willQoS: 0,
                                willFlag: 0,
                                cleanStart: 0
                            },
                            keepAlive: 0,
                            clientId: []
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        variable.variable.protocol = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        variable.variable.protocol = ($_ => $_.toString())()

                        variable.variable.version = $buffer[$start++]

                        $_ = $buffer[$start++]

                        variable.variable.flags.username = $_ >>> 7 & 0x1

                        variable.variable.flags.username = ($_ => $_)(variable.variable.flags.username)

                        variable.variable.flags.password = $_ >>> 6 & 0x1

                        variable.variable.flags.wilRetain = $_ >>> 5 & 0x1

                        variable.variable.flags.willQoS = $_ >>> 3 & 0x3

                        variable.variable.flags.willFlag = $_ >>> 2 & 0x1

                        variable.variable.flags.cleanStart = $_ >>> 1 & 0x1

                        variable.variable.keepAlive =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        variable.variable.clientId = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        variable.variable.clientId = ($_ => $_.toString())()

                        break

                    case 'pingreq':
                        variable.variable = null

                        break

                    case 'pingresp':
                        variable.variable = null

                        break
                    }

                    return variable
                }
            } ()
        }
    } (lookup),
    inc: function ($lookup) {
        return {
            fixed: function () {
                return function (fixed, $step = 0, $sip = []) {
                    let $_, $bite

                    return function $parse ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                fixed = {
                                    fixed: {
                                        header: {
                                            type: 0,
                                            flags: null
                                        },
                                        length: 0
                                    }
                                }

                            case 1:

                                $_ = 0
                                $bite = 0

                            case 2:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 2
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                fixed.fixed.header.type = $lookup[0][$_ >>> 4 & 0xf]

                                switch (($ => $.fixed.header.type)(fixed)) {
                                case 'publish':
                                    fixed.fixed.header.flags = {
                                        dup: 0,
                                        qos: 0,
                                        retain: 0
                                    }

                                    fixed.fixed.header.flags.dup = $_ >>> 3 & 0x1

                                    fixed.fixed.header.flags.qos = $_ >>> 1 & 0x3

                                    fixed.fixed.header.flags.retain = $_ & 0x1

                                    break

                                case 'pubrel':

                                    break

                                case 'subscribe':

                                    break

                                case 'unsubscribe':

                                    break

                                default:

                                    break
                                }

                            case 3:

                            case 4:

                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[0] = $buffer[$start++]

                            case 5:

                                if ((sip => (sip & 0x80) == 0)($sip[0], fixed, fixed)) {
                                    $step = 6
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff
                                    ]), 0, 1)
                                    continue
                                } else {
                                    $step = 8
                                    continue
                                }

                            case 6:

                            case 7:

                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, object: null, parse: $parse }
                                }

                                fixed.fixed.length = $buffer[$start++]

                                $step = 26
                                continue

                            case 8:

                            case 9:

                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[1] = $buffer[$start++]

                            case 10:

                                if ((sip => (sip & 0x80) == 0)($sip[1], fixed, fixed)) {
                                    $step = 11
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff
                                    ]), 0, 2)
                                    continue
                                } else {
                                    $step = 14
                                    continue
                                }

                            case 11:

                                $_ = 0

                            case 12:

                                if ($start == $end) {
                                    $step = 12
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 7

                            case 13:

                                if ($start == $end) {
                                    $step = 13
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] << 0

                                fixed.fixed.length = $_

                                $step = 26
                                continue

                            case 14:

                            case 15:

                                if ($start == $end) {
                                    $step = 15
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[2] = $buffer[$start++]

                            case 16:

                                if ((sip => (sip & 0x80) == 0)($sip[2], fixed, fixed)) {
                                    $step = 17
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff,
                                        $sip[2] & 0xff
                                    ]), 0, 3)
                                    continue
                                } else {
                                    $step = 21
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff,
                                        $sip[2] & 0xff
                                    ]), 0, 3)
                                    continue
                                }

                            case 17:

                                $_ = 0

                            case 18:

                                if ($start == $end) {
                                    $step = 18
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 14

                            case 19:

                                if ($start == $end) {
                                    $step = 19
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 7

                            case 20:

                                if ($start == $end) {
                                    $step = 20
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] << 0

                                fixed.fixed.length = $_

                                $step = 26
                                continue

                            case 21:

                                $_ = 0

                            case 22:

                                if ($start == $end) {
                                    $step = 22
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 21

                            case 23:

                                if ($start == $end) {
                                    $step = 23
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 14

                            case 24:

                                if ($start == $end) {
                                    $step = 24
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 7

                            case 25:

                                if ($start == $end) {
                                    $step = 25
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] << 0

                                fixed.fixed.length = $_




                            }

                            return { start: $start, object: fixed, parse: null }
                            break
                        }
                    }
                }
            } (),
            variable: function () {
                return function (variable, $step = 0, $I = []) {
                    let $_, $bite, $index = 0, $buffers = []

                    return function $parse ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                variable = {
                                    variable: null
                                }

                            case 1:

                                switch (($ => $.fixed.header.type)(variable)) {
                                case 'connect':

                                    variable.variable = {
                                        protocol: [],
                                        version: 0,
                                        flags: {
                                            username: 0,
                                            password: 0,
                                            wilRetain: 0,
                                            willQoS: 0,
                                            willFlag: 0,
                                            cleanStart: 0
                                        },
                                        keepAlive: 0,
                                        clientId: []
                                    }

                                    $step = 2
                                    continue

                                case 'pingreq':

                                    $step = 14
                                    continue

                                case 'pingresp':

                                    $step = 15
                                    continue
                                }

                            case 2:

                                $_ = 0
                                $bite = 1

                            case 3:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 3
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 4:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 4
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.protocol = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                variable.variable.protocol = ($_ => $_.toString())()

                            case 5:

                            case 6:

                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, object: null, parse: $parse }
                                }

                                variable.variable.version = $buffer[$start++]

                            case 7:

                                $_ = 0
                                $bite = 0

                            case 8:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 8
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                variable.variable.flags.username = $_ >>> 7 & 0x1

                                variable.variable.flags.username = ($_ => $_)(variable.variable.flags.username)

                                variable.variable.flags.password = $_ >>> 6 & 0x1

                                variable.variable.flags.wilRetain = $_ >>> 5 & 0x1

                                variable.variable.flags.willQoS = $_ >>> 3 & 0x3

                                variable.variable.flags.willFlag = $_ >>> 2 & 0x1

                                variable.variable.flags.cleanStart = $_ >>> 1 & 0x1

                            case 9:

                                $_ = 0
                                $bite = 1

                            case 10:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 10
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                variable.variable.keepAlive = $_

                            case 11:

                                $_ = 0
                                $bite = 1

                            case 12:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 12
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 13:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 13
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.clientId = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                variable.variable.clientId = ($_ => $_.toString())()
                                $step = 16
                                continue

                            case 14:

                                variable.variable = null
                                $step = 16
                                continue

                            case 15:

                                variable.variable = null

                            }

                            return { start: $start, object: variable, parse: null }
                            break
                        }
                    }
                }
            } ()
        }
    } (lookup)
}

module.exports = {
    sizeOf: sizeOf,
    serializer: {
        all: serializer.all,
        inc: serializer.inc,
        bff: function ($incremental) {
            return {
                fixed: function () {
                    return function (fixed) {
                        return function ($buffer, $start, $end) {
                            let $_

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 0)($buffer, $start, $end)
                            }

                            $_ =
                                $lookup[0].indexOf(fixed.fixed.header.type) << 4 & 0xf0

                            switch (($ => $.fixed.header.type)(fixed)) {
                            case 'publish':

                                $_ |=
                                    fixed.fixed.header.flags.dup << 3 & 0x8 |
                                    fixed.fixed.header.flags.qos << 1 & 0x6 |
                                    fixed.fixed.header.flags.retain & 0x1

                                break

                            case 'pubrel':

                                $_ |=
                                    0x2 & 0xf

                                break

                            case 'subscribe':

                                $_ |=
                                    0x2 & 0xf

                                break

                            case 'unsubscribe':

                                $_ |=
                                    0x2 & 0xf

                                break

                            default:

                                $_ |=
                                    0x0 & 0xf

                                break
                            }

                            $buffer[$start++] = $_ & 0xff

                            if ((value => value < 0x7f)(fixed.fixed.length)) {
                                if ($end - $start < 1) {
                                    return $incremental.fixed(fixed, 3)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length & 0xff
                            } else if ((value => value < 0x3fff)(fixed.fixed.length)) {
                                if ($end - $start < 2) {
                                    return $incremental.fixed(fixed, 5)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length & 0x7f
                            } else if ((value => value < 0x1fffff)(fixed.fixed.length)) {
                                if ($end - $start < 3) {
                                    return $incremental.fixed(fixed, 8)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length & 0x7f
                            } else {
                                if ($end - $start < 4) {
                                    return $incremental.fixed(fixed, 12)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length >>> 21 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length & 0x7f
                            }

                            return { start: $start, serialize: null }
                        }
                    }
                } (),
                variable: function () {
                    return function (variable) {
                        return function ($buffer, $start, $end) {
                            let $_, $$ = []

                            switch (($ => $.fixed.header.type)(variable)) {
                            case 'connect':

                                $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.variable(variable, 2, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ($end - $start < 3 + 1) {
                                    return $incremental.variable(variable, 5, $$)($buffer, $start, $end)
                                }

                                $$[0] = ($_ => 4)(variable.variable.version)

                                $buffer[$start++] = $$[0] & 0xff

                                $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(variable.variable.flags.username, variable)

                                $_ =
                                    $$[0] << 7 & 0x80

                                $$[1] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                                $_ |=
                                    $$[1] << 6 & 0x40

                                $_ |=
                                    variable.variable.flags.wilRetain << 5 & 0x20 |
                                    variable.variable.flags.willQoS << 3 & 0x18 |
                                    variable.variable.flags.willFlag << 2 & 0x4 |
                                    variable.variable.flags.cleanStart << 1 & 0x2 |
                                    0x0 & 0x1

                                $buffer[$start++] = $_ & 0xff

                                $buffer[$start++] = variable.variable.keepAlive >>> 8 & 0xff
                                $buffer[$start++] = variable.variable.keepAlive & 0xff

                                $$[2] = ($_ => Buffer.from($_ == null ? '' : $_))(variable.variable.clientId)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.variable(variable, 13, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[2].length >>> 8 & 0xff
                                $buffer[$start++] = $$[2].length & 0xff

                                $$[2].copy($buffer, $start, 0, $$[2].length)
                                $start += $$[2].length

                                break

                            case 'pingreq':


                                break

                            case 'pingresp':


                                break
                            }

                            return { start: $start, serialize: null }
                        }
                    }
                } ()
            }
        } (serializer.inc)
    },
    parser: {
        all: parser.all,
        inc: parser.inc,
        bff: function ($incremental) {
            return {
                fixed: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $_, $sip = []

                            let fixed = {
                                fixed: {
                                    header: {
                                        type: 0,
                                        flags: null
                                    },
                                    length: 0
                                }
                            }

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 1, $sip)($buffer, $start, $end)
                            }

                            $_ = $buffer[$start++]

                            fixed.fixed.header.type = $lookup[0][$_ >>> 4 & 0xf]

                            switch (($ => $.fixed.header.type)(fixed)) {
                            case 'publish':
                                fixed.fixed.header.flags = {
                                    dup: 0,
                                    qos: 0,
                                    retain: 0
                                }

                                fixed.fixed.header.flags.dup = $_ >>> 3 & 0x1

                                fixed.fixed.header.flags.qos = $_ >>> 1 & 0x3

                                fixed.fixed.header.flags.retain = $_ & 0x1

                                break

                            case 'pubrel':

                                break

                            case 'subscribe':

                                break

                            case 'unsubscribe':

                                break

                            default:

                                break
                            }

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 3, $sip)($buffer, $start, $end)
                            }

                            $sip[0] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[0], fixed)) {
                                if ($end - ($start - 1) < 1) {
                                    return $incremental.fixed(fixed, 6, $sip)($buffer, $start - 1, $end)
                                }

                                $start -= 1

                                fixed.fixed.length = $buffer[$start++]
                            } else {
                                if ($end - $start < 1) {
                                    return $incremental.fixed(fixed, 8, $sip)($buffer, $start, $end)
                                }

                                $sip[1] = $buffer[$start++]

                                if ((sip => (sip & 0x80) == 0)($sip[1], fixed)) {
                                    if ($end - ($start - 2) < 2) {
                                        return $incremental.fixed(fixed, 11, $sip)($buffer, $start - 2, $end)
                                    }

                                    $start -= 2

                                    fixed.fixed.length =
                                        ($buffer[$start++] & 0x7f) << 7 |
                                        $buffer[$start++]
                                } else {
                                    if ($end - $start < 1) {
                                        return $incremental.fixed(fixed, 14, $sip)($buffer, $start, $end)
                                    }

                                    $sip[2] = $buffer[$start++]

                                    if ((sip => (sip & 0x80) == 0)($sip[2], fixed)) {
                                        if ($end - ($start - 3) < 3) {
                                            return $incremental.fixed(fixed, 17, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        fixed.fixed.length =
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                    } else {
                                        if ($end - ($start - 3) < 4) {
                                            return $incremental.fixed(fixed, 21, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        fixed.fixed.length = (
                                            ($buffer[$start++] & 0x7f) << 21 |
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                        ) >>> 0
                                    }
                                }
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                },
                variable: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $_, $I = []

                            let variable = {
                                variable: null
                            }

                            switch (($ => $.fixed.header.type)(variable)) {
                            case 'connect':
                                variable.variable = {
                                    protocol: [],
                                    version: 0,
                                    flags: {
                                        username: 0,
                                        password: 0,
                                        wilRetain: 0,
                                        willQoS: 0,
                                        willFlag: 0,
                                        cleanStart: 0
                                    },
                                    keepAlive: 0,
                                    clientId: []
                                }

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 2, $I)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.variable(variable, 4, $I)($buffer, $start, $end)
                                }

                                variable.variable.protocol = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                variable.variable.protocol = ($_ => $_.toString())()

                                if ($end - $start < 4) {
                                    return $incremental.variable(variable, 5, $I)($buffer, $start, $end)
                                }

                                variable.variable.version = $buffer[$start++]

                                $_ = $buffer[$start++]

                                variable.variable.flags.username = $_ >>> 7 & 0x1

                                variable.variable.flags.username = ($_ => $_)(variable.variable.flags.username)

                                variable.variable.flags.password = $_ >>> 6 & 0x1

                                variable.variable.flags.wilRetain = $_ >>> 5 & 0x1

                                variable.variable.flags.willQoS = $_ >>> 3 & 0x3

                                variable.variable.flags.willFlag = $_ >>> 2 & 0x1

                                variable.variable.flags.cleanStart = $_ >>> 1 & 0x1

                                variable.variable.keepAlive =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 11, $I)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.variable(variable, 13, $I)($buffer, $start, $end)
                                }

                                variable.variable.clientId = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                variable.variable.clientId = ($_ => $_.toString())()

                                break

                            case 'pingreq':
                                variable.variable = null

                                break

                            case 'pingresp':
                                variable.variable = null

                                break
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
