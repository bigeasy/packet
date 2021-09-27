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
    mqtt: function () {
        return function (mqtt) {
            let $start = 0

            $start += 1

            switch (($ => $.header.type)(mqtt)) {
            case 'connect':

                $start += 1

                break

            case 'pingreq':


                break

            case 'pingresp':


                break
            }


            if ((value => value < 0x7f)(mqtt.body.length)) {
                $start += 1
            } else if ((value => value < 0x3fff)(mqtt.body.length)) {
                $start += 2
            } else if ((value => value < 0x1fffff)(mqtt.body.length)) {
                $start += 3
            } else {
                $start += 4
            }

            $start += 1 * mqtt.body.length

            return $start
        }
    } ()
}

const serializer = {
    all: function ($lookup) {
        return {
            mqtt: function () {
                return function (mqtt, $buffer, $start) {
                    let $_

                    $_ =
                        $lookup[0].indexOf(mqtt.header.type) << 4 & 0xf0

                    switch (($ => $.header.type)(mqtt)) {
                    case 'publish':

                        $_ |=
                            mqtt.header.flags.dup << 3 & 0x8 |
                            mqtt.header.flags.qos << 1 & 0x6 |
                            mqtt.header.flags.retain & 0x1

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

                    switch (($ => $.header.type)(mqtt)) {
                    case 'connect':

                        $buffer[$start++] = mqtt.variable.value & 0xff

                        break

                    case 'pingreq':


                        break

                    case 'pingresp':


                        break
                    }

                    if ((value => value < 0x7f)(mqtt.body.length)) {
                        $buffer[$start++] = mqtt.body.length & 0xff
                    } else if ((value => value < 0x3fff)(mqtt.body.length)) {
                        $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length & 0x7f
                    } else if ((value => value < 0x1fffff)(mqtt.body.length)) {
                        $buffer[$start++] = mqtt.body.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length & 0x7f
                    } else {
                        $buffer[$start++] = mqtt.body.length >>> 21 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.body.length & 0x7f
                    }

                    mqtt.body.copy($buffer, $start, 0, mqtt.body.length)
                    $start += mqtt.body.length

                    return { start: $start, serialize: null }
                }
            } ()
        }
    } (lookup),
    inc: function ($lookup) {
        return {
            mqtt: function () {
                return function (mqtt, $step = 0) {
                    let $_, $bite, $copied = 0

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                $bite = 0
                                $_ =
                                    $lookup[0].indexOf(mqtt.header.type) << 4 & 0xf0

                                switch (($ => $.header.type)(mqtt)) {
                                case 'publish':

                                    $_ |=
                                        mqtt.header.flags.dup << 3 & 0x8 |
                                        mqtt.header.flags.qos << 1 & 0x6 |
                                        mqtt.header.flags.retain & 0x1

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

                                switch (($ => $.header.type)(mqtt)) {
                                case 'connect':

                                    $step = 3
                                    continue

                                case 'pingreq':

                                    $step = 5
                                    continue

                                case 'pingresp':

                                    $step = 6
                                    continue
                                }

                            case 3:

                                $bite = 0
                                $_ = mqtt.variable.value

                            case 4:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 4
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }
                                $step = 7
                                continue

                            case 5:
                                $step = 7
                                continue

                            case 6:

                            case 7:

                                if ((value => value < 0x7f)(mqtt.body.length)) {
                                    $step = 8
                                    continue
                                } else if ((value => value < 0x3fff)(mqtt.body.length)) {
                                    $step = 10
                                    continue
                                } else if ((value => value < 0x1fffff)(mqtt.body.length)) {
                                    $step = 13
                                    continue
                                } else {
                                    $step = 17
                                    continue
                                }

                            case 8:

                                $bite = 0
                                $_ = mqtt.body.length

                            case 9:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 9
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                                $step = 22
                                continue

                            case 10:

                                $_ = mqtt.body.length

                            case 11:

                                if ($start == $end) {
                                    $step = 11
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                            case 12:

                                if ($start == $end) {
                                    $step = 12
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 0 & 0x7f

                                $step = 22
                                continue

                            case 13:

                                $_ = mqtt.body.length

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

                                $step = 22
                                continue

                            case 17:

                                $_ = mqtt.body.length

                            case 18:

                                if ($start == $end) {
                                    $step = 18
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 21 & 0x7f | 0x80

                            case 19:

                                if ($start == $end) {
                                    $step = 19
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                            case 20:

                                if ($start == $end) {
                                    $step = 20
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                            case 21:

                                if ($start == $end) {
                                    $step = 21
                                    return { start: $start, serialize: $serialize }
                                }

                                $buffer[$start++] = $_ >>> 0 & 0x7f

                            case 22: {

                                const $bytes = Math.min($end - $start, mqtt.body.length - $copied)
                                mqtt.body.copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != mqtt.body.length) {
                                    $step = 22
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

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
            mqtt: function () {
                return function ($buffer, $start) {
                    let $_, $I = [], $sip = []

                    let mqtt = {
                        header: {
                            type: 0,
                            flags: null
                        },
                        variable: null,
                        body: []
                    }

                    $_ = $buffer[$start++]

                    mqtt.header.type = $lookup[0][$_ >>> 4 & 0xf]

                    switch (($ => $.header.type)(mqtt)) {
                    case 'publish':
                        mqtt.header.flags = {
                            dup: 0,
                            qos: 0,
                            retain: 0
                        }

                        mqtt.header.flags.dup = $_ >>> 3 & 0x1

                        mqtt.header.flags.qos = $_ >>> 1 & 0x3

                        mqtt.header.flags.retain = $_ & 0x1

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

                    switch (($ => $.header.type)(mqtt)) {
                    case 'connect':
                        mqtt.variable = {
                            value: 0
                        }

                        mqtt.variable.value = $buffer[$start++]

                        break

                    case 'pingreq':
                        mqtt.variable = null

                        break

                    case 'pingresp':
                        mqtt.variable = null

                        break
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[0], mqtt)) {
                        $start -= 1

                        $I[0] = $buffer[$start++]
                    } else {
                        $sip[1] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[1], mqtt)) {
                            $start -= 2

                            $I[0] =
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            $sip[2] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[2], mqtt)) {
                                $start -= 3

                                $I[0] =
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                            } else {
                                $start -= 3

                                $I[0] = (
                                    ($buffer[$start++] & 0x7f) << 21 |
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                                ) >>> 0
                            }
                        }
                    }

                    mqtt.body = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]

                    return mqtt
                }
            } ()
        }
    } (lookup),
    inc: function ($lookup) {
        return {
            mqtt: function () {
                return function (mqtt, $step = 0, $I = [], $sip = []) {
                    let $_, $bite, $index = 0, $buffers = []

                    return function $parse ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                mqtt = {
                                    header: {
                                        type: 0,
                                        flags: null
                                    },
                                    variable: null,
                                    body: []
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

                                mqtt.header.type = $lookup[0][$_ >>> 4 & 0xf]

                                switch (($ => $.header.type)(mqtt)) {
                                case 'publish':
                                    mqtt.header.flags = {
                                        dup: 0,
                                        qos: 0,
                                        retain: 0
                                    }

                                    mqtt.header.flags.dup = $_ >>> 3 & 0x1

                                    mqtt.header.flags.qos = $_ >>> 1 & 0x3

                                    mqtt.header.flags.retain = $_ & 0x1

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

                                switch (($ => $.header.type)(mqtt)) {
                                case 'connect':

                                    mqtt.variable = {
                                        value: 0
                                    }

                                    $step = 4
                                    continue

                                case 'pingreq':

                                    $step = 6
                                    continue

                                case 'pingresp':

                                    $step = 7
                                    continue
                                }

                            case 4:

                            case 5:

                                if ($start == $end) {
                                    $step = 5
                                    return { start: $start, object: null, parse: $parse }
                                }

                                mqtt.variable.value = $buffer[$start++]
                                $step = 8
                                continue

                            case 6:

                                mqtt.variable = null
                                $step = 8
                                continue

                            case 7:

                                mqtt.variable = null

                            case 8:

                            case 9:

                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[0] = $buffer[$start++]

                            case 10:

                                if ((sip => (sip & 0x80) == 0)($sip[0], mqtt, mqtt)) {
                                    $step = 11
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff
                                    ]), 0, 1)
                                    continue
                                } else {
                                    $step = 13
                                    continue
                                }

                            case 11:

                            case 12:

                                if ($start == $end) {
                                    $step = 12
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $I[0] = $buffer[$start++]

                                $step = 31
                                continue

                            case 13:

                            case 14:

                                if ($start == $end) {
                                    $step = 14
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[1] = $buffer[$start++]

                            case 15:

                                if ((sip => (sip & 0x80) == 0)($sip[1], mqtt, mqtt)) {
                                    $step = 16
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff
                                    ]), 0, 2)
                                    continue
                                } else {
                                    $step = 19
                                    continue
                                }

                            case 16:

                                $_ = 0

                            case 17:

                                if ($start == $end) {
                                    $step = 17
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 7

                            case 18:

                                if ($start == $end) {
                                    $step = 18
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] << 0

                                $I[0] = $_

                                $step = 31
                                continue

                            case 19:

                            case 20:

                                if ($start == $end) {
                                    $step = 20
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $sip[2] = $buffer[$start++]

                            case 21:

                                if ((sip => (sip & 0x80) == 0)($sip[2], mqtt, mqtt)) {
                                    $step = 22
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff,
                                        $sip[2] & 0xff
                                    ]), 0, 3)
                                    continue
                                } else {
                                    $step = 26
                                    $parse(Buffer.from([
                                        $sip[0] & 0xff,
                                        $sip[1] & 0xff,
                                        $sip[2] & 0xff
                                    ]), 0, 3)
                                    continue
                                }

                            case 22:

                                $_ = 0

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

                                $I[0] = $_

                                $step = 31
                                continue

                            case 26:

                                $_ = 0

                            case 27:

                                if ($start == $end) {
                                    $step = 27
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 21

                            case 28:

                                if ($start == $end) {
                                    $step = 28
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 14

                            case 29:

                                if ($start == $end) {
                                    $step = 29
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] & 127 << 7

                            case 30:

                                if ($start == $end) {
                                    $step = 30
                                    return { start: $start, object: null, parse: $parse }
                                }

                                $_ += $buffer[$start++] << 0

                                $I[0] = $_




                            case 31:

                                const $length = Math.min($I[0] - $index, $end - $start)
                                $buffers.push($buffer.slice($start, $start + $length))
                                $index += $length
                                $start += $length

                                if ($index != $I[0]) {
                                    $step = 31
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.body = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                            }

                            return { start: $start, object: mqtt, parse: null }
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
                mqtt: function () {
                    return function (mqtt) {
                        return function ($buffer, $start, $end) {
                            let $_

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 0)($buffer, $start, $end)
                            }

                            $_ =
                                $lookup[0].indexOf(mqtt.header.type) << 4 & 0xf0

                            switch (($ => $.header.type)(mqtt)) {
                            case 'publish':

                                $_ |=
                                    mqtt.header.flags.dup << 3 & 0x8 |
                                    mqtt.header.flags.qos << 1 & 0x6 |
                                    mqtt.header.flags.retain & 0x1

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

                            switch (($ => $.header.type)(mqtt)) {
                            case 'connect':

                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 3)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.variable.value & 0xff

                                break

                            case 'pingreq':


                                break

                            case 'pingresp':


                                break
                            }

                            if ((value => value < 0x7f)(mqtt.body.length)) {
                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 8)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.body.length & 0xff
                            } else if ((value => value < 0x3fff)(mqtt.body.length)) {
                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 10)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length & 0x7f
                            } else if ((value => value < 0x1fffff)(mqtt.body.length)) {
                                if ($end - $start < 3) {
                                    return $incremental.mqtt(mqtt, 13)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.body.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length & 0x7f
                            } else {
                                if ($end - $start < 4) {
                                    return $incremental.mqtt(mqtt, 17)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.body.length >>> 21 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.body.length & 0x7f
                            }

                            if ($end - $start < mqtt.body.length * 1) {
                                return $incremental.mqtt(mqtt, 22)($buffer, $start, $end)
                            }

                            mqtt.body.copy($buffer, $start, 0, mqtt.body.length)
                            $start += mqtt.body.length

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
                mqtt: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $_, $I = [], $sip = []

                            let mqtt = {
                                header: {
                                    type: 0,
                                    flags: null
                                },
                                variable: null,
                                body: []
                            }

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 1, $I, $sip)($buffer, $start, $end)
                            }

                            $_ = $buffer[$start++]

                            mqtt.header.type = $lookup[0][$_ >>> 4 & 0xf]

                            switch (($ => $.header.type)(mqtt)) {
                            case 'publish':
                                mqtt.header.flags = {
                                    dup: 0,
                                    qos: 0,
                                    retain: 0
                                }

                                mqtt.header.flags.dup = $_ >>> 3 & 0x1

                                mqtt.header.flags.qos = $_ >>> 1 & 0x3

                                mqtt.header.flags.retain = $_ & 0x1

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

                            switch (($ => $.header.type)(mqtt)) {
                            case 'connect':
                                mqtt.variable = {
                                    value: 0
                                }

                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 4, $I, $sip)($buffer, $start, $end)
                                }

                                mqtt.variable.value = $buffer[$start++]

                                break

                            case 'pingreq':
                                mqtt.variable = null

                                break

                            case 'pingresp':
                                mqtt.variable = null

                                break
                            }

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 8, $I, $sip)($buffer, $start, $end)
                            }

                            $sip[0] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[0], mqtt)) {
                                if ($end - ($start - 1) < 1) {
                                    return $incremental.mqtt(mqtt, 11, $I, $sip)($buffer, $start - 1, $end)
                                }

                                $start -= 1

                                $I[0] = $buffer[$start++]
                            } else {
                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 13, $I, $sip)($buffer, $start, $end)
                                }

                                $sip[1] = $buffer[$start++]

                                if ((sip => (sip & 0x80) == 0)($sip[1], mqtt)) {
                                    if ($end - ($start - 2) < 2) {
                                        return $incremental.mqtt(mqtt, 16, $I, $sip)($buffer, $start - 2, $end)
                                    }

                                    $start -= 2

                                    $I[0] =
                                        ($buffer[$start++] & 0x7f) << 7 |
                                        $buffer[$start++]
                                } else {
                                    if ($end - $start < 1) {
                                        return $incremental.mqtt(mqtt, 19, $I, $sip)($buffer, $start, $end)
                                    }

                                    $sip[2] = $buffer[$start++]

                                    if ((sip => (sip & 0x80) == 0)($sip[2], mqtt)) {
                                        if ($end - ($start - 3) < 3) {
                                            return $incremental.mqtt(mqtt, 22, $I, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        $I[0] =
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                    } else {
                                        if ($end - ($start - 3) < 4) {
                                            return $incremental.mqtt(mqtt, 26, $I, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        $I[0] = (
                                            ($buffer[$start++] & 0x7f) << 21 |
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                        ) >>> 0
                                    }
                                }
                            }

                            if ($end - $start < 1 * $I[0]) {
                                return $incremental.mqtt(mqtt, 31, $I, $sip)($buffer, $start, $end)
                            }

                            mqtt.body = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
