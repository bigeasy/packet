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

            switch (($ => $.fixed.type)(variable)) {
            case 'connect':

                $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                $start += 2

                $start += 1 * $$[0].length

                $start += 1

                $start += 1

                $start += 2

                $$[0] = ($_ => Buffer.from($_))(variable.variable.clientId)

                $start += 2

                $start += 1 * $$[0].length


                if ((({ $ }) => $.variable.topic != null)({
                    $: variable
                })) {
                    $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                    $start += 2

                    $start += 1 * $$[0].length
                } else {
                }


                if ((({ $ }) => $.variable.topic != null)({
                    $: variable
                })) {
                    $start += 2

                    $start += 1 * variable.variable.message.length
                } else {
                }


                if ((({ $ }) => $.variable.username != null)({
                    $: variable
                })) {
                    $$[0] = ($_ => Buffer.from($_))(variable.variable.username)

                    $start += 2

                    $start += 1 * $$[0].length
                } else {
                }


                if ((({ $ }) => $.variable.password != null)({
                    $: variable
                })) {
                    $start += 2

                    $start += 1 * variable.variable.password.length
                } else {
                }

                break

            case 'connack':

                $start += 2

                break

            case 'publish':

                $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                $start += 2

                $start += 1 * $$[0].length


                if ((({ $ }) => $.fixed.flags.qos > 0)({
                    $: variable
                })) {
                    $start += 2
                } else {
                }

                $start += ($ => $.variable.payload.length)(variable) * 1

                break

            case 'pingreq':


                break

            case 'pingresp':


                break
            }

            return $start
        }
    } (),
    mqtt: function () {
        return function (mqtt) {
            let $start = 0, $$ = []

            $start += 1


            if ((value => value < 0x7f)(mqtt.fixed.length)) {
                $start += 1
            } else if ((value => value < 0x3fff)(mqtt.fixed.length)) {
                $start += 2
            } else if ((value => value < 0x1fffff)(mqtt.fixed.length)) {
                $start += 3
            } else {
                $start += 4
            }

            switch (($ => $.fixed.type)(mqtt)) {
            case 'connect':

                $$[0] = ($_ => Buffer.from('MQTT'))(mqtt.variable.protocol)

                $start += 2

                $start += 1 * $$[0].length

                $start += 1

                $start += 1

                $start += 2

                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.clientId)

                $start += 2

                $start += 1 * $$[0].length


                if ((({ $ }) => $.variable.topic != null)({
                    $: mqtt
                })) {
                    $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                    $start += 2

                    $start += 1 * $$[0].length
                } else {
                }


                if ((({ $ }) => $.variable.topic != null)({
                    $: mqtt
                })) {
                    $start += 2

                    $start += 1 * mqtt.variable.message.length
                } else {
                }


                if ((({ $ }) => $.variable.username != null)({
                    $: mqtt
                })) {
                    $$[0] = ($_ => Buffer.from($_))(mqtt.variable.username)

                    $start += 2

                    $start += 1 * $$[0].length
                } else {
                }


                if ((({ $ }) => $.variable.password != null)({
                    $: mqtt
                })) {
                    $start += 2

                    $start += 1 * mqtt.variable.password.length
                } else {
                }

                break

            case 'connack':

                $start += 2

                break

            case 'publish':

                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                $start += 2

                $start += 1 * $$[0].length


                if ((({ $ }) => $.fixed.flags.qos > 0)({
                    $: mqtt
                })) {
                    $start += 2
                } else {
                }

                $start += ($ => $.variable.payload.length)(mqtt) * 1

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
                    let $_, $$ = []

                    $_ =
                        $lookup[0].indexOf(fixed.fixed.type) << 4 & 0xf0

                    switch (($ => $.fixed.type)(fixed)) {
                    case 'publish':

                        $_ |=
                            fixed.fixed.flags.dup << 3 & 0x8 |
                            fixed.fixed.flags.qos << 1 & 0x6 |
                            fixed.fixed.flags.retain & 0x1

                        break

                    case 'pubrel':

                        $$[0] = ($_ => 2)(fixed.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    case 'subscribe':

                        $$[0] = ($_ => 2)(fixed.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    case 'unsubscribe':

                        $$[0] = ($_ => 2)(fixed.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    default:

                        $$[0] = ($_ => 0)(fixed.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

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
                    let $_, $i = [], $I = [], $$ = []

                    switch (($ => $.fixed.type)(variable)) {
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

                        $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                        $_ |=
                            $$[0] << 6 & 0x40

                        $_ |=
                            variable.variable.flags.wilRetain << 5 & 0x20 |
                            variable.variable.flags.willQoS << 3 & 0x18

                        $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(variable.variable.flags.willFlag, variable)

                        $_ |=
                            $$[0] << 2 & 0x4

                        $_ |=
                            variable.variable.flags.cleanStart << 1 & 0x2 |
                            0x0 & 0x1

                        $buffer[$start++] = $_ & 0xff

                        $buffer[$start++] = variable.variable.keepAlive >>> 8 & 0xff
                        $buffer[$start++] = variable.variable.keepAlive & 0xff

                        $$[0] = ($_ => Buffer.from($_))(variable.variable.clientId)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        if ((({ $ }) => $.variable.topic != null)({
                            $: variable
                        })) {
                            $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                            $buffer[$start++] = $$[0].length >>> 8 & 0xff
                            $buffer[$start++] = $$[0].length & 0xff

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length
                        } else {
                        }

                        if ((({ $ }) => $.variable.topic != null)({
                            $: variable
                        })) {
                            $buffer[$start++] = variable.variable.message.length >>> 8 & 0xff
                            $buffer[$start++] = variable.variable.message.length & 0xff

                            variable.variable.message.copy($buffer, $start, 0, variable.variable.message.length)
                            $start += variable.variable.message.length
                        } else {
                        }

                        if ((({ $ }) => $.variable.username != null)({
                            $: variable
                        })) {
                            $$[0] = ($_ => Buffer.from($_))(variable.variable.username)

                            $buffer[$start++] = $$[0].length >>> 8 & 0xff
                            $buffer[$start++] = $$[0].length & 0xff

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length
                        } else {
                        }

                        if ((({ $ }) => $.variable.password != null)({
                            $: variable
                        })) {
                            $buffer[$start++] = variable.variable.password.length >>> 8 & 0xff
                            $buffer[$start++] = variable.variable.password.length & 0xff

                            variable.variable.password.copy($buffer, $start, 0, variable.variable.password.length)
                            $start += variable.variable.password.length
                        } else {
                        }

                        break

                    case 'connack':

                        $_ =
                            0x0 << 1 & 0xfe |
                            variable.variable.flags.sessionPresent & 0x1

                        $buffer[$start++] = $_ & 0xff

                        $buffer[$start++] = variable.variable.reasonCode & 0xff

                        break

                    case 'publish':

                        $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        if ((({ $ }) => $.fixed.flags.qos > 0)({
                            $: variable
                        })) {
                            $buffer[$start++] = variable.variable.id >>> 8 & 0xff
                            $buffer[$start++] = variable.variable.id & 0xff
                        } else {
                        }

                        $I[0] = ($ => $.variable.payload.length)(variable)

                        $_ = 0
                        variable.variable.payload.copy($buffer, $start)
                        $start += variable.variable.payload.length
                        $_ += variable.variable.payload.length

                        break

                    case 'pingreq':


                        break

                    case 'pingresp':


                        break
                    }

                    return { start: $start, serialize: null }
                }
            } (),
            mqtt: function () {
                return function (mqtt, $buffer, $start) {
                    let $_, $i = [], $I = [], $$ = []

                    $_ =
                        $lookup[0].indexOf(mqtt.fixed.type) << 4 & 0xf0

                    switch (($ => $.fixed.type)(mqtt)) {
                    case 'publish':

                        $_ |=
                            mqtt.fixed.flags.dup << 3 & 0x8 |
                            mqtt.fixed.flags.qos << 1 & 0x6 |
                            mqtt.fixed.flags.retain & 0x1

                        break

                    case 'pubrel':

                        $$[0] = ($_ => 2)(mqtt.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    case 'subscribe':

                        $$[0] = ($_ => 2)(mqtt.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    case 'unsubscribe':

                        $$[0] = ($_ => 2)(mqtt.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break

                    default:

                        $$[0] = ($_ => 0)(mqtt.fixed.flags)

                        $_ |=
                            $$[0] & 0xf

                        break
                    }

                    $buffer[$start++] = $_ & 0xff

                    if ((value => value < 0x7f)(mqtt.fixed.length)) {
                        $buffer[$start++] = mqtt.fixed.length & 0xff
                    } else if ((value => value < 0x3fff)(mqtt.fixed.length)) {
                        $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length & 0x7f
                    } else if ((value => value < 0x1fffff)(mqtt.fixed.length)) {
                        $buffer[$start++] = mqtt.fixed.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length & 0x7f
                    } else {
                        $buffer[$start++] = mqtt.fixed.length >>> 21 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length >>> 14 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = mqtt.fixed.length & 0x7f
                    }

                    switch (($ => $.fixed.type)(mqtt)) {
                    case 'connect':

                        $$[0] = ($_ => Buffer.from('MQTT'))(mqtt.variable.protocol)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        $$[0] = ($_ => 4)(mqtt.variable.version)

                        $buffer[$start++] = $$[0] & 0xff

                        $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(mqtt.variable.flags.username, mqtt)

                        $_ =
                            $$[0] << 7 & 0x80

                        $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(mqtt.variable.flags.password, mqtt)

                        $_ |=
                            $$[0] << 6 & 0x40

                        $_ |=
                            mqtt.variable.flags.wilRetain << 5 & 0x20 |
                            mqtt.variable.flags.willQoS << 3 & 0x18

                        $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(mqtt.variable.flags.willFlag, mqtt)

                        $_ |=
                            $$[0] << 2 & 0x4

                        $_ |=
                            mqtt.variable.flags.cleanStart << 1 & 0x2 |
                            0x0 & 0x1

                        $buffer[$start++] = $_ & 0xff

                        $buffer[$start++] = mqtt.variable.keepAlive >>> 8 & 0xff
                        $buffer[$start++] = mqtt.variable.keepAlive & 0xff

                        $$[0] = ($_ => Buffer.from($_))(mqtt.variable.clientId)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        if ((({ $ }) => $.variable.topic != null)({
                            $: mqtt
                        })) {
                            $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                            $buffer[$start++] = $$[0].length >>> 8 & 0xff
                            $buffer[$start++] = $$[0].length & 0xff

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length
                        } else {
                        }

                        if ((({ $ }) => $.variable.topic != null)({
                            $: mqtt
                        })) {
                            $buffer[$start++] = mqtt.variable.message.length >>> 8 & 0xff
                            $buffer[$start++] = mqtt.variable.message.length & 0xff

                            mqtt.variable.message.copy($buffer, $start, 0, mqtt.variable.message.length)
                            $start += mqtt.variable.message.length
                        } else {
                        }

                        if ((({ $ }) => $.variable.username != null)({
                            $: mqtt
                        })) {
                            $$[0] = ($_ => Buffer.from($_))(mqtt.variable.username)

                            $buffer[$start++] = $$[0].length >>> 8 & 0xff
                            $buffer[$start++] = $$[0].length & 0xff

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length
                        } else {
                        }

                        if ((({ $ }) => $.variable.password != null)({
                            $: mqtt
                        })) {
                            $buffer[$start++] = mqtt.variable.password.length >>> 8 & 0xff
                            $buffer[$start++] = mqtt.variable.password.length & 0xff

                            mqtt.variable.password.copy($buffer, $start, 0, mqtt.variable.password.length)
                            $start += mqtt.variable.password.length
                        } else {
                        }

                        break

                    case 'connack':

                        $_ =
                            0x0 << 1 & 0xfe |
                            mqtt.variable.flags.sessionPresent & 0x1

                        $buffer[$start++] = $_ & 0xff

                        $buffer[$start++] = mqtt.variable.reasonCode & 0xff

                        break

                    case 'publish':

                        $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                        $buffer[$start++] = $$[0].length >>> 8 & 0xff
                        $buffer[$start++] = $$[0].length & 0xff

                        $$[0].copy($buffer, $start, 0, $$[0].length)
                        $start += $$[0].length

                        if ((({ $ }) => $.fixed.flags.qos > 0)({
                            $: mqtt
                        })) {
                            $buffer[$start++] = mqtt.variable.id >>> 8 & 0xff
                            $buffer[$start++] = mqtt.variable.id & 0xff
                        } else {
                        }

                        $I[0] = ($ => $.variable.payload.length)(mqtt)

                        $_ = 0
                        mqtt.variable.payload.copy($buffer, $start)
                        $start += mqtt.variable.payload.length
                        $_ += mqtt.variable.payload.length

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
                return function (fixed, $step = 0, $$ = []) {
                    let $_, $bite

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                $bite = 0
                                $_ =
                                    $lookup[0].indexOf(fixed.fixed.type) << 4 & 0xf0

                                switch (($ => $.fixed.type)(fixed)) {
                                case 'publish':

                                    $_ |=
                                        fixed.fixed.flags.dup << 3 & 0x8 |
                                        fixed.fixed.flags.qos << 1 & 0x6 |
                                        fixed.fixed.flags.retain & 0x1

                                    break

                                case 'pubrel':

                                    $$[0] = ($_ => 2)(fixed.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                case 'subscribe':

                                    $$[0] = ($_ => 2)(fixed.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                case 'unsubscribe':

                                    $$[0] = ($_ => 2)(fixed.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                default:

                                    $$[0] = ($_ => 0)(fixed.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

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
                return function (variable, $step = 0, $i = [], $I = [], $$ = []) {
                    let $_, $bite, $copied = 0

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                switch (($ => $.fixed.type)(variable)) {
                                case 'connect':

                                    $step = 1
                                    continue

                                case 'connack':

                                    $step = 38
                                    continue

                                case 'publish':

                                    $step = 42
                                    continue

                                case 'pingreq':

                                    $step = 52
                                    continue

                                case 'pingresp':

                                    $step = 53
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

                                $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                                $_ |=
                                    $$[0] << 6 & 0x40

                                $_ |=
                                    variable.variable.flags.wilRetain << 5 & 0x20 |
                                    variable.variable.flags.willQoS << 3 & 0x18

                                $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(variable.variable.flags.willFlag, variable)

                                $_ |=
                                    $$[0] << 2 & 0x4

                                $_ |=
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

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.clientId)

                            case 13:

                                $bite = 1
                                $_ = $$[0].length

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

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 15
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 16:

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: variable
                                })) {
                                    $step = 17
                                    continue
                                } else {
                                    $step = 21
                                    continue
                                }

                            case 17:

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                            case 18:

                                $bite = 1
                                $_ = $$[0].length

                            case 19:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 19
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 20: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 20
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 22
                                continue

                            case 21:

                            case 22:

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: variable
                                })) {
                                    $step = 23
                                    continue
                                } else {
                                    $step = 26
                                    continue
                                }

                            case 23:

                                $bite = 1
                                $_ = variable.variable.message.length

                            case 24:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 24
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 25: {

                                const $bytes = Math.min($end - $start, variable.variable.message.length - $copied)
                                variable.variable.message.copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != variable.variable.message.length) {
                                    $step = 25
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 27
                                continue

                            case 26:

                            case 27:

                                if ((({ $ }) => $.variable.username != null)({
                                    $: variable
                                })) {
                                    $step = 28
                                    continue
                                } else {
                                    $step = 32
                                    continue
                                }

                            case 28:

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.username)

                            case 29:

                                $bite = 1
                                $_ = $$[0].length

                            case 30:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 30
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 31: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 31
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 33
                                continue

                            case 32:

                            case 33:

                                if ((({ $ }) => $.variable.password != null)({
                                    $: variable
                                })) {
                                    $step = 34
                                    continue
                                } else {
                                    $step = 37
                                    continue
                                }

                            case 34:

                                $bite = 1
                                $_ = variable.variable.password.length

                            case 35:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 35
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 36: {

                                const $bytes = Math.min($end - $start, variable.variable.password.length - $copied)
                                variable.variable.password.copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != variable.variable.password.length) {
                                    $step = 36
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 38
                                continue

                            case 37:
                                $step = 54
                                continue

                            case 38:

                                $bite = 0
                                $_ =
                                    0x0 << 1 & 0xfe |
                                    variable.variable.flags.sessionPresent & 0x1

                            case 39:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 39
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 40:

                                $bite = 0
                                $_ = variable.variable.reasonCode

                            case 41:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 41
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }
                                $step = 54
                                continue

                            case 42:

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                            case 43:

                                $bite = 1
                                $_ = $$[0].length

                            case 44:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 44
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 45: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 45
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 46:

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: variable
                                })) {
                                    $step = 47
                                    continue
                                } else {
                                    $step = 49
                                    continue
                                }

                            case 47:

                                $bite = 1
                                $_ = variable.variable.id

                            case 48:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 48
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                                $step = 50
                                continue

                            case 49:

                            case 50:

                                $_ = 0
                                $I[0] = ($ => $.variable.payload.length)(variable)

                            case 51: {

                                    const length = Math.min($end - $start, variable.variable.payload.length - $_)
                                    variable.variable.payload.copy($buffer, $start, $_, $_ + length)
                                    $start += length
                                    $_ += length

                                    if ($_ != variable.variable.payload.length) {
                                        $step = 51
                                        return { start: $start, serialize: $serialize }
                                    }

                                }
                                $step = 54
                                continue

                            case 52:
                                $step = 54
                                continue

                            case 53:

                            }

                            break
                        }

                        return { start: $start, serialize: null }
                    }
                }
            } (),
            mqtt: function () {
                return function (mqtt, $step = 0, $i = [], $I = [], $$ = []) {
                    let $_, $bite, $copied = 0

                    return function $serialize ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                $bite = 0
                                $_ =
                                    $lookup[0].indexOf(mqtt.fixed.type) << 4 & 0xf0

                                switch (($ => $.fixed.type)(mqtt)) {
                                case 'publish':

                                    $_ |=
                                        mqtt.fixed.flags.dup << 3 & 0x8 |
                                        mqtt.fixed.flags.qos << 1 & 0x6 |
                                        mqtt.fixed.flags.retain & 0x1

                                    break

                                case 'pubrel':

                                    $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                case 'subscribe':

                                    $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                case 'unsubscribe':

                                    $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

                                    break

                                default:

                                    $$[0] = ($_ => 0)(mqtt.fixed.flags)

                                    $_ |=
                                        $$[0] & 0xf

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

                                if ((value => value < 0x7f)(mqtt.fixed.length)) {
                                    $step = 3
                                    continue
                                } else if ((value => value < 0x3fff)(mqtt.fixed.length)) {
                                    $step = 5
                                    continue
                                } else if ((value => value < 0x1fffff)(mqtt.fixed.length)) {
                                    $step = 8
                                    continue
                                } else {
                                    $step = 12
                                    continue
                                }

                            case 3:

                                $bite = 0
                                $_ = mqtt.fixed.length

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

                                $_ = mqtt.fixed.length

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

                                $_ = mqtt.fixed.length

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

                                $_ = mqtt.fixed.length

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

                            case 17:

                                switch (($ => $.fixed.type)(mqtt)) {
                                case 'connect':

                                    $step = 18
                                    continue

                                case 'connack':

                                    $step = 55
                                    continue

                                case 'publish':

                                    $step = 59
                                    continue

                                case 'pingreq':

                                    $step = 69
                                    continue

                                case 'pingresp':

                                    $step = 70
                                    continue
                                }

                            case 18:

                                $$[0] = ($_ => Buffer.from('MQTT'))(mqtt.variable.protocol)

                            case 19:

                                $bite = 1
                                $_ = $$[0].length

                            case 20:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 20
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 21: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 21
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 22:

                                $$[0] = ($_ => 4)(mqtt.variable.version)

                            case 23:

                                $bite = 0
                                $_ = $$[0]

                            case 24:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 24
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 25:

                                $bite = 0
                                $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(mqtt.variable.flags.username, mqtt)

                                $_ =
                                    $$[0] << 7 & 0x80

                                $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(mqtt.variable.flags.password, mqtt)

                                $_ |=
                                    $$[0] << 6 & 0x40

                                $_ |=
                                    mqtt.variable.flags.wilRetain << 5 & 0x20 |
                                    mqtt.variable.flags.willQoS << 3 & 0x18

                                $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(mqtt.variable.flags.willFlag, mqtt)

                                $_ |=
                                    $$[0] << 2 & 0x4

                                $_ |=
                                    mqtt.variable.flags.cleanStart << 1 & 0x2 |
                                    0x0 & 0x1

                            case 26:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 26
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 27:

                                $bite = 1
                                $_ = mqtt.variable.keepAlive

                            case 28:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 28
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 29:

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.clientId)

                            case 30:

                                $bite = 1
                                $_ = $$[0].length

                            case 31:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 31
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 32: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 32
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 33:

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: mqtt
                                })) {
                                    $step = 34
                                    continue
                                } else {
                                    $step = 38
                                    continue
                                }

                            case 34:

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                            case 35:

                                $bite = 1
                                $_ = $$[0].length

                            case 36:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 36
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 37: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 37
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 39
                                continue

                            case 38:

                            case 39:

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: mqtt
                                })) {
                                    $step = 40
                                    continue
                                } else {
                                    $step = 43
                                    continue
                                }

                            case 40:

                                $bite = 1
                                $_ = mqtt.variable.message.length

                            case 41:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 41
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 42: {

                                const $bytes = Math.min($end - $start, mqtt.variable.message.length - $copied)
                                mqtt.variable.message.copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != mqtt.variable.message.length) {
                                    $step = 42
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 44
                                continue

                            case 43:

                            case 44:

                                if ((({ $ }) => $.variable.username != null)({
                                    $: mqtt
                                })) {
                                    $step = 45
                                    continue
                                } else {
                                    $step = 49
                                    continue
                                }

                            case 45:

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.username)

                            case 46:

                                $bite = 1
                                $_ = $$[0].length

                            case 47:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 47
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 48: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 48
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 50
                                continue

                            case 49:

                            case 50:

                                if ((({ $ }) => $.variable.password != null)({
                                    $: mqtt
                                })) {
                                    $step = 51
                                    continue
                                } else {
                                    $step = 54
                                    continue
                                }

                            case 51:

                                $bite = 1
                                $_ = mqtt.variable.password.length

                            case 52:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 52
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 53: {

                                const $bytes = Math.min($end - $start, mqtt.variable.password.length - $copied)
                                mqtt.variable.password.copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != mqtt.variable.password.length) {
                                    $step = 53
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                                $step = 55
                                continue

                            case 54:
                                $step = 71
                                continue

                            case 55:

                                $bite = 0
                                $_ =
                                    0x0 << 1 & 0xfe |
                                    mqtt.variable.flags.sessionPresent & 0x1

                            case 56:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 56
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 57:

                                $bite = 0
                                $_ = mqtt.variable.reasonCode

                            case 58:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 58
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }
                                $step = 71
                                continue

                            case 59:

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                            case 60:

                                $bite = 1
                                $_ = $$[0].length

                            case 61:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 61
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                            case 62: {

                                const $bytes = Math.min($end - $start, $$[0].length - $copied)
                                $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                                $copied += $bytes
                                $start += $bytes

                                if ($copied != $$[0].length) {
                                    $step = 62
                                    return { start: $start, serialize: $serialize }
                                }

                                $copied = 0

                            }

                            case 63:

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: mqtt
                                })) {
                                    $step = 64
                                    continue
                                } else {
                                    $step = 66
                                    continue
                                }

                            case 64:

                                $bite = 1
                                $_ = mqtt.variable.id

                            case 65:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 65
                                        return { start: $start, serialize: $serialize }
                                    }
                                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                    $bite--
                                }

                                $step = 67
                                continue

                            case 66:

                            case 67:

                                $_ = 0
                                $I[0] = ($ => $.variable.payload.length)(mqtt)

                            case 68: {

                                    const length = Math.min($end - $start, mqtt.variable.payload.length - $_)
                                    mqtt.variable.payload.copy($buffer, $start, $_, $_ + length)
                                    $start += length
                                    $_ += length

                                    if ($_ != mqtt.variable.payload.length) {
                                        $step = 68
                                        return { start: $start, serialize: $serialize }
                                    }

                                }
                                $step = 71
                                continue

                            case 69:
                                $step = 71
                                continue

                            case 70:

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
                            type: 0,
                            flags: null,
                            length: 0
                        }
                    }

                    $_ = $buffer[$start++]

                    fixed.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                    switch (($ => $.fixed.type)(fixed)) {
                    case 'publish':
                        fixed.fixed.flags = {
                            dup: 0,
                            qos: 0,
                            retain: 0
                        }

                        fixed.fixed.flags.dup = $_ >>> 3 & 0x1

                        fixed.fixed.flags.qos = $_ >>> 1 & 0x3

                        fixed.fixed.flags.retain = $_ & 0x1

                        break

                    case 'pubrel':
                        fixed.fixed.flags = $_ & 0xf

                        break

                    case 'subscribe':
                        fixed.fixed.flags = $_ & 0xf

                        break

                    case 'unsubscribe':
                        fixed.fixed.flags = $_ & 0xf

                        break

                    default:
                        fixed.fixed.flags = $_ & 0xf

                        break
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[0])) {
                        $start -= 1

                        fixed.fixed.length = $buffer[$start++]
                    } else {
                        $sip[1] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[1])) {
                            $start -= 2

                            fixed.fixed.length =
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            $sip[2] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[2])) {
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
                    let $_, $i = [], $I = [], $slice = null

                    let variable = {
                        variable: null
                    }

                    switch (($ => $.fixed.type)(variable)) {
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
                            clientId: [],
                            topic: null,
                            message: null,
                            username: null,
                            password: null
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        variable.variable.protocol = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        variable.variable.protocol = ($_ => $_.toString())(variable.variable.protocol)

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

                        variable.variable.clientId = ($_ => $_.toString())(variable.variable.clientId)

                        if ((({ $ }) => $.variable.flags.willFlag == 1)({
                            $: variable
                        })) {
                            variable.variable.topic = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            variable.variable.topic = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)
                        } else {
                            variable.variable.topic = null
                        }

                        if ((({ $ }) => $.variable.flags.willFlag == 1)({
                            $: variable
                        })) {
                            variable.variable.message = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            variable.variable.message = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]
                        } else {
                            variable.variable.message = null
                        }

                        if ((({ $ }) => $.variable.flags.username == 1)({
                            $: variable
                        })) {
                            variable.variable.username = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            variable.variable.username = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            variable.variable.username = ($_ => $_.toString())(variable.variable.username)
                        } else {
                            variable.variable.username = null
                        }

                        if ((({ $ }) => $.variable.flags.password == 1)({
                            $: variable
                        })) {
                            variable.variable.password = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            variable.variable.password = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]
                        } else {
                            variable.variable.password = null
                        }

                        break

                    case 'connack':
                        variable.variable = {
                            flags: {
                                sessionPresent: 0
                            },
                            reasonCode: 0
                        }

                        $_ = $buffer[$start++]

                        variable.variable.flags.sessionPresent = $_ & 0x1

                        variable.variable.reasonCode = $buffer[$start++]

                        break

                    case 'publish':
                        variable.variable = {
                            topic: [],
                            id: null,
                            payload: null
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        variable.variable.topic = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)

                        if ((({ $ }) => $.fixed.flags.qos > 0)({
                            $: variable
                        })) {
                            variable.variable.id =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                        } else {
                            variable.variable.id = null
                        }

                        $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(variable)

                        $slice = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]
                        variable.variable.payload = $slice

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
            } (),
            mqtt: function () {
                return function ($buffer, $start) {
                    let $_, $i = [], $I = [], $sip = [], $slice = null

                    let mqtt = {
                        fixed: {
                            type: 0,
                            flags: null,
                            length: 0
                        },
                        variable: null
                    }

                    $_ = $buffer[$start++]

                    mqtt.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                    switch (($ => $.fixed.type)(mqtt)) {
                    case 'publish':
                        mqtt.fixed.flags = {
                            dup: 0,
                            qos: 0,
                            retain: 0
                        }

                        mqtt.fixed.flags.dup = $_ >>> 3 & 0x1

                        mqtt.fixed.flags.qos = $_ >>> 1 & 0x3

                        mqtt.fixed.flags.retain = $_ & 0x1

                        break

                    case 'pubrel':
                        mqtt.fixed.flags = $_ & 0xf

                        break

                    case 'subscribe':
                        mqtt.fixed.flags = $_ & 0xf

                        break

                    case 'unsubscribe':
                        mqtt.fixed.flags = $_ & 0xf

                        break

                    default:
                        mqtt.fixed.flags = $_ & 0xf

                        break
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[0])) {
                        $start -= 1

                        mqtt.fixed.length = $buffer[$start++]
                    } else {
                        $sip[1] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[1])) {
                            $start -= 2

                            mqtt.fixed.length =
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            $sip[2] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[2])) {
                                $start -= 3

                                mqtt.fixed.length =
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                            } else {
                                $start -= 3

                                mqtt.fixed.length = (
                                    ($buffer[$start++] & 0x7f) << 21 |
                                    ($buffer[$start++] & 0x7f) << 14 |
                                    ($buffer[$start++] & 0x7f) << 7 |
                                    $buffer[$start++]
                                ) >>> 0
                            }
                        }
                    }

                    switch (($ => $.fixed.type)(mqtt)) {
                    case 'connect':
                        mqtt.variable = {
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
                            clientId: [],
                            topic: null,
                            message: null,
                            username: null,
                            password: null
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        mqtt.variable.protocol = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        mqtt.variable.protocol = ($_ => $_.toString())(mqtt.variable.protocol)

                        mqtt.variable.version = $buffer[$start++]

                        $_ = $buffer[$start++]

                        mqtt.variable.flags.username = $_ >>> 7 & 0x1

                        mqtt.variable.flags.username = ($_ => $_)(mqtt.variable.flags.username)

                        mqtt.variable.flags.password = $_ >>> 6 & 0x1

                        mqtt.variable.flags.wilRetain = $_ >>> 5 & 0x1

                        mqtt.variable.flags.willQoS = $_ >>> 3 & 0x3

                        mqtt.variable.flags.willFlag = $_ >>> 2 & 0x1

                        mqtt.variable.flags.cleanStart = $_ >>> 1 & 0x1

                        mqtt.variable.keepAlive =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        mqtt.variable.clientId = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        mqtt.variable.clientId = ($_ => $_.toString())(mqtt.variable.clientId)

                        if ((({ $ }) => $.variable.flags.willFlag == 1)({
                            $: mqtt
                        })) {
                            mqtt.variable.topic = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            mqtt.variable.topic = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)
                        } else {
                            mqtt.variable.topic = null
                        }

                        if ((({ $ }) => $.variable.flags.willFlag == 1)({
                            $: mqtt
                        })) {
                            mqtt.variable.message = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            mqtt.variable.message = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]
                        } else {
                            mqtt.variable.message = null
                        }

                        if ((({ $ }) => $.variable.flags.username == 1)({
                            $: mqtt
                        })) {
                            mqtt.variable.username = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            mqtt.variable.username = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            mqtt.variable.username = ($_ => $_.toString())(mqtt.variable.username)
                        } else {
                            mqtt.variable.username = null
                        }

                        if ((({ $ }) => $.variable.flags.password == 1)({
                            $: mqtt
                        })) {
                            mqtt.variable.password = []

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            mqtt.variable.password = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]
                        } else {
                            mqtt.variable.password = null
                        }

                        break

                    case 'connack':
                        mqtt.variable = {
                            flags: {
                                sessionPresent: 0
                            },
                            reasonCode: 0
                        }

                        $_ = $buffer[$start++]

                        mqtt.variable.flags.sessionPresent = $_ & 0x1

                        mqtt.variable.reasonCode = $buffer[$start++]

                        break

                    case 'publish':
                        mqtt.variable = {
                            topic: [],
                            id: null,
                            payload: null
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        mqtt.variable.topic = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]

                        mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)

                        if ((({ $ }) => $.fixed.flags.qos > 0)({
                            $: mqtt
                        })) {
                            mqtt.variable.id =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                        } else {
                            mqtt.variable.id = null
                        }

                        $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(mqtt)

                        $slice = $buffer.slice($start, $start + $I[0])
                        $start += $I[0]
                        mqtt.variable.payload = $slice

                        break

                    case 'pingreq':
                        mqtt.variable = null

                        break

                    case 'pingresp':
                        mqtt.variable = null

                        break
                    }

                    return mqtt
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
                                        type: 0,
                                        flags: null,
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

                                fixed.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                                switch (($ => $.fixed.type)(fixed)) {
                                case 'publish':
                                    fixed.fixed.flags = {
                                        dup: 0,
                                        qos: 0,
                                        retain: 0
                                    }

                                    fixed.fixed.flags.dup = $_ >>> 3 & 0x1

                                    fixed.fixed.flags.qos = $_ >>> 1 & 0x3

                                    fixed.fixed.flags.retain = $_ & 0x1

                                    break

                                case 'pubrel':
                                    fixed.fixed.flags = $_ & 0xf

                                    break

                                case 'subscribe':
                                    fixed.fixed.flags = $_ & 0xf

                                    break

                                case 'unsubscribe':
                                    fixed.fixed.flags = $_ & 0xf

                                    break

                                default:
                                    fixed.fixed.flags = $_ & 0xf

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

                                if ((sip => (sip & 0x80) == 0)($sip[0])) {
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

                                if ((sip => (sip & 0x80) == 0)($sip[1])) {
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

                                if ((sip => (sip & 0x80) == 0)($sip[2])) {
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
                return function (variable, $step = 0, $i = [], $I = []) {
                    let $_, $bite, $index = 0, $buffers = []

                    return function $parse ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                variable = {
                                    variable: null
                                }

                            case 1:

                                switch (($ => $.fixed.type)(variable)) {
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
                                        clientId: [],
                                        topic: null,
                                        message: null,
                                        username: null,
                                        password: null
                                    }

                                    $step = 2
                                    continue

                                case 'connack':

                                    variable.variable = {
                                        flags: {
                                            sessionPresent: 0
                                        },
                                        reasonCode: 0
                                    }

                                    $step = 34
                                    continue

                                case 'publish':

                                    variable.variable = {
                                        topic: [],
                                        id: null,
                                        payload: null
                                    }

                                    $step = 38
                                    continue

                                case 'pingreq':

                                    $step = 47
                                    continue

                                case 'pingresp':

                                    $step = 48
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

                                variable.variable.protocol = ($_ => $_.toString())(variable.variable.protocol)

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

                                variable.variable.clientId = ($_ => $_.toString())(variable.variable.clientId)


                            case 14:

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: variable
                                })) {
                                    variable.variable.topic = []

                                    $step = 15
                                    continue
                                } else {
                                    $step = 18
                                    continue
                                }

                            case 15:

                                $_ = 0
                                $bite = 1

                            case 16:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 16
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 17:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 17
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.topic = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)

                                $step = 19
                                continue

                            case 18:

                                variable.variable.topic = null



                            case 19:

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: variable
                                })) {
                                    variable.variable.message = []

                                    $step = 20
                                    continue
                                } else {
                                    $step = 23
                                    continue
                                }

                            case 20:

                                $_ = 0
                                $bite = 1

                            case 21:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 21
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 22:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 22
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.message = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                $step = 24
                                continue

                            case 23:

                                variable.variable.message = null



                            case 24:

                                if ((({ $ }) => $.variable.flags.username == 1)({
                                    $: variable
                                })) {
                                    variable.variable.username = []

                                    $step = 25
                                    continue
                                } else {
                                    $step = 28
                                    continue
                                }

                            case 25:

                                $_ = 0
                                $bite = 1

                            case 26:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 26
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 27:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 27
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.username = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                variable.variable.username = ($_ => $_.toString())(variable.variable.username)

                                $step = 29
                                continue

                            case 28:

                                variable.variable.username = null



                            case 29:

                                if ((({ $ }) => $.variable.flags.password == 1)({
                                    $: variable
                                })) {
                                    variable.variable.password = []

                                    $step = 30
                                    continue
                                } else {
                                    $step = 33
                                    continue
                                }

                            case 30:

                                $_ = 0
                                $bite = 1

                            case 31:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 31
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 32:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 32
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.password = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                $step = 34
                                continue

                            case 33:

                                variable.variable.password = null

                                $step = 49
                                continue

                            case 34:

                                $_ = 0
                                $bite = 0

                            case 35:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 35
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                variable.variable.flags.sessionPresent = $_ & 0x1

                            case 36:

                            case 37:

                                if ($start == $end) {
                                    $step = 37
                                    return { start: $start, object: null, parse: $parse }
                                }

                                variable.variable.reasonCode = $buffer[$start++]
                                $step = 49
                                continue

                            case 38:

                                $_ = 0
                                $bite = 1

                            case 39:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 39
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 40:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 40
                                    return { start: $start, parse: $parse }
                                }

                                variable.variable.topic = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)


                            case 41:

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: variable
                                })) {
                                    $step = 42
                                    continue
                                } else {
                                    $step = 44
                                    continue
                                }

                            case 42:

                                $_ = 0
                                $bite = 1

                            case 43:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 43
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                variable.variable.id = $_

                                $step = 45
                                continue

                            case 44:

                                variable.variable.id = null


                            case 45:

                                $_ = 0
                                $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(variable)

                            case 46: {

                                const length = Math.min($end - $start, $I[0] - $_)
                                $buffers.push($buffer.slice($start, $start + length))
                                $start += length
                                $_ += length

                                if ($_ != $I[0]) {
                                    $step = 46
                                    return { start: $start, object: null, parse: $parse }
                                }

                                variable.variable.payload = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                                $buffers = []

                            }
                                $step = 49
                                continue

                            case 47:

                                variable.variable = null
                                $step = 49
                                continue

                            case 48:

                                variable.variable = null

                            }

                            return { start: $start, object: variable, parse: null }
                            break
                        }
                    }
                }
            } (),
            mqtt: function () {
                return function (mqtt, $step = 0, $i = [], $I = [], $sip = []) {
                    let $_, $bite, $index = 0, $buffers = []

                    return function $parse ($buffer, $start, $end) {
                        for (;;) {
                            switch ($step) {
                            case 0:

                                mqtt = {
                                    fixed: {
                                        type: 0,
                                        flags: null,
                                        length: 0
                                    },
                                    variable: null
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

                                mqtt.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                                switch (($ => $.fixed.type)(mqtt)) {
                                case 'publish':
                                    mqtt.fixed.flags = {
                                        dup: 0,
                                        qos: 0,
                                        retain: 0
                                    }

                                    mqtt.fixed.flags.dup = $_ >>> 3 & 0x1

                                    mqtt.fixed.flags.qos = $_ >>> 1 & 0x3

                                    mqtt.fixed.flags.retain = $_ & 0x1

                                    break

                                case 'pubrel':
                                    mqtt.fixed.flags = $_ & 0xf

                                    break

                                case 'subscribe':
                                    mqtt.fixed.flags = $_ & 0xf

                                    break

                                case 'unsubscribe':
                                    mqtt.fixed.flags = $_ & 0xf

                                    break

                                default:
                                    mqtt.fixed.flags = $_ & 0xf

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

                                if ((sip => (sip & 0x80) == 0)($sip[0])) {
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

                                mqtt.fixed.length = $buffer[$start++]

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

                                if ((sip => (sip & 0x80) == 0)($sip[1])) {
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

                                mqtt.fixed.length = $_

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

                                if ((sip => (sip & 0x80) == 0)($sip[2])) {
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

                                mqtt.fixed.length = $_

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

                                mqtt.fixed.length = $_




                            case 26:

                                switch (($ => $.fixed.type)(mqtt)) {
                                case 'connect':

                                    mqtt.variable = {
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
                                        clientId: [],
                                        topic: null,
                                        message: null,
                                        username: null,
                                        password: null
                                    }

                                    $step = 27
                                    continue

                                case 'connack':

                                    mqtt.variable = {
                                        flags: {
                                            sessionPresent: 0
                                        },
                                        reasonCode: 0
                                    }

                                    $step = 59
                                    continue

                                case 'publish':

                                    mqtt.variable = {
                                        topic: [],
                                        id: null,
                                        payload: null
                                    }

                                    $step = 63
                                    continue

                                case 'pingreq':

                                    $step = 72
                                    continue

                                case 'pingresp':

                                    $step = 73
                                    continue
                                }

                            case 27:

                                $_ = 0
                                $bite = 1

                            case 28:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 28
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 29:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 29
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.protocol = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                mqtt.variable.protocol = ($_ => $_.toString())(mqtt.variable.protocol)

                            case 30:

                            case 31:

                                if ($start == $end) {
                                    $step = 31
                                    return { start: $start, object: null, parse: $parse }
                                }

                                mqtt.variable.version = $buffer[$start++]

                            case 32:

                                $_ = 0
                                $bite = 0

                            case 33:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 33
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                mqtt.variable.flags.username = $_ >>> 7 & 0x1

                                mqtt.variable.flags.username = ($_ => $_)(mqtt.variable.flags.username)

                                mqtt.variable.flags.password = $_ >>> 6 & 0x1

                                mqtt.variable.flags.wilRetain = $_ >>> 5 & 0x1

                                mqtt.variable.flags.willQoS = $_ >>> 3 & 0x3

                                mqtt.variable.flags.willFlag = $_ >>> 2 & 0x1

                                mqtt.variable.flags.cleanStart = $_ >>> 1 & 0x1

                            case 34:

                                $_ = 0
                                $bite = 1

                            case 35:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 35
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                mqtt.variable.keepAlive = $_

                            case 36:

                                $_ = 0
                                $bite = 1

                            case 37:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 37
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 38:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 38
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.clientId = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                mqtt.variable.clientId = ($_ => $_.toString())(mqtt.variable.clientId)


                            case 39:

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.topic = []

                                    $step = 40
                                    continue
                                } else {
                                    $step = 43
                                    continue
                                }

                            case 40:

                                $_ = 0
                                $bite = 1

                            case 41:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 41
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 42:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 42
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.topic = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)

                                $step = 44
                                continue

                            case 43:

                                mqtt.variable.topic = null



                            case 44:

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.message = []

                                    $step = 45
                                    continue
                                } else {
                                    $step = 48
                                    continue
                                }

                            case 45:

                                $_ = 0
                                $bite = 1

                            case 46:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 46
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 47:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 47
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.message = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                $step = 49
                                continue

                            case 48:

                                mqtt.variable.message = null



                            case 49:

                                if ((({ $ }) => $.variable.flags.username == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.username = []

                                    $step = 50
                                    continue
                                } else {
                                    $step = 53
                                    continue
                                }

                            case 50:

                                $_ = 0
                                $bite = 1

                            case 51:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 51
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 52:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 52
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.username = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                mqtt.variable.username = ($_ => $_.toString())(mqtt.variable.username)

                                $step = 54
                                continue

                            case 53:

                                mqtt.variable.username = null



                            case 54:

                                if ((({ $ }) => $.variable.flags.password == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.password = []

                                    $step = 55
                                    continue
                                } else {
                                    $step = 58
                                    continue
                                }

                            case 55:

                                $_ = 0
                                $bite = 1

                            case 56:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 56
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 57:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 57
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.password = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                $step = 59
                                continue

                            case 58:

                                mqtt.variable.password = null

                                $step = 74
                                continue

                            case 59:

                                $_ = 0
                                $bite = 0

                            case 60:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 60
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                mqtt.variable.flags.sessionPresent = $_ & 0x1

                            case 61:

                            case 62:

                                if ($start == $end) {
                                    $step = 62
                                    return { start: $start, object: null, parse: $parse }
                                }

                                mqtt.variable.reasonCode = $buffer[$start++]
                                $step = 74
                                continue

                            case 63:

                                $_ = 0
                                $bite = 1

                            case 64:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 64
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                $I[0] = $_

                            case 65:
                                {
                                    const $length = Math.min($I[0] - $index, $end - $start)
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $index += $length
                                    $start += $length
                                }

                                if ($index != $I[0]) {
                                    $step = 65
                                    return { start: $start, parse: $parse }
                                }

                                mqtt.variable.topic = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                                $index = 0
                                $buffers = []

                                mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)


                            case 66:

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: mqtt
                                })) {
                                    $step = 67
                                    continue
                                } else {
                                    $step = 69
                                    continue
                                }

                            case 67:

                                $_ = 0
                                $bite = 1

                            case 68:

                                while ($bite != -1) {
                                    if ($start == $end) {
                                        $step = 68
                                        return { start: $start, object: null, parse: $parse }
                                    }
                                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                                    $bite--
                                }

                                mqtt.variable.id = $_

                                $step = 70
                                continue

                            case 69:

                                mqtt.variable.id = null


                            case 70:

                                $_ = 0
                                $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(mqtt)

                            case 71: {

                                const length = Math.min($end - $start, $I[0] - $_)
                                $buffers.push($buffer.slice($start, $start + length))
                                $start += length
                                $_ += length

                                if ($_ != $I[0]) {
                                    $step = 71
                                    return { start: $start, object: null, parse: $parse }
                                }

                                mqtt.variable.payload = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                                $buffers = []

                            }
                                $step = 74
                                continue

                            case 72:

                                mqtt.variable = null
                                $step = 74
                                continue

                            case 73:

                                mqtt.variable = null

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
                fixed: function () {
                    return function (fixed) {
                        return function ($buffer, $start, $end) {
                            let $_, $$ = []

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 0, $$)($buffer, $start, $end)
                            }

                            $_ =
                                $lookup[0].indexOf(fixed.fixed.type) << 4 & 0xf0

                            switch (($ => $.fixed.type)(fixed)) {
                            case 'publish':

                                $_ |=
                                    fixed.fixed.flags.dup << 3 & 0x8 |
                                    fixed.fixed.flags.qos << 1 & 0x6 |
                                    fixed.fixed.flags.retain & 0x1

                                break

                            case 'pubrel':

                                $$[0] = ($_ => 2)(fixed.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            case 'subscribe':

                                $$[0] = ($_ => 2)(fixed.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            case 'unsubscribe':

                                $$[0] = ($_ => 2)(fixed.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            default:

                                $$[0] = ($_ => 0)(fixed.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break
                            }

                            $buffer[$start++] = $_ & 0xff

                            if ((value => value < 0x7f)(fixed.fixed.length)) {
                                if ($end - $start < 1) {
                                    return $incremental.fixed(fixed, 3, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length & 0xff
                            } else if ((value => value < 0x3fff)(fixed.fixed.length)) {
                                if ($end - $start < 2) {
                                    return $incremental.fixed(fixed, 5, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length & 0x7f
                            } else if ((value => value < 0x1fffff)(fixed.fixed.length)) {
                                if ($end - $start < 3) {
                                    return $incremental.fixed(fixed, 8, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = fixed.fixed.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = fixed.fixed.length & 0x7f
                            } else {
                                if ($end - $start < 4) {
                                    return $incremental.fixed(fixed, 12, $$)($buffer, $start, $end)
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
                            let $_, $i = [], $I = [], $$ = []

                            switch (($ => $.fixed.type)(variable)) {
                            case 'connect':

                                $$[0] = ($_ => Buffer.from('MQTT'))(variable.variable.protocol)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.variable(variable, 2, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ($end - $start < 3 + 1) {
                                    return $incremental.variable(variable, 5, $i, $I, $$)($buffer, $start, $end)
                                }

                                $$[0] = ($_ => 4)(variable.variable.version)

                                $buffer[$start++] = $$[0] & 0xff

                                $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(variable.variable.flags.username, variable)

                                $_ =
                                    $$[0] << 7 & 0x80

                                $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(variable.variable.flags.password, variable)

                                $_ |=
                                    $$[0] << 6 & 0x40

                                $_ |=
                                    variable.variable.flags.wilRetain << 5 & 0x20 |
                                    variable.variable.flags.willQoS << 3 & 0x18

                                $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(variable.variable.flags.willFlag, variable)

                                $_ |=
                                    $$[0] << 2 & 0x4

                                $_ |=
                                    variable.variable.flags.cleanStart << 1 & 0x2 |
                                    0x0 & 0x1

                                $buffer[$start++] = $_ & 0xff

                                $buffer[$start++] = variable.variable.keepAlive >>> 8 & 0xff
                                $buffer[$start++] = variable.variable.keepAlive & 0xff

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.clientId)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.variable(variable, 13, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: variable
                                })) {
                                    $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                                    if ($end - $start < 2 + $$[0].length * 1) {
                                        return $incremental.variable(variable, 18, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                    $buffer[$start++] = $$[0].length & 0xff

                                    $$[0].copy($buffer, $start, 0, $$[0].length)
                                    $start += $$[0].length
                                } else {
                                }

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: variable
                                })) {
                                    if ($end - $start < 2 + variable.variable.message.length * 1) {
                                        return $incremental.variable(variable, 23, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = variable.variable.message.length >>> 8 & 0xff
                                    $buffer[$start++] = variable.variable.message.length & 0xff

                                    variable.variable.message.copy($buffer, $start, 0, variable.variable.message.length)
                                    $start += variable.variable.message.length
                                } else {
                                }

                                if ((({ $ }) => $.variable.username != null)({
                                    $: variable
                                })) {
                                    $$[0] = ($_ => Buffer.from($_))(variable.variable.username)

                                    if ($end - $start < 2 + $$[0].length * 1) {
                                        return $incremental.variable(variable, 29, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                    $buffer[$start++] = $$[0].length & 0xff

                                    $$[0].copy($buffer, $start, 0, $$[0].length)
                                    $start += $$[0].length
                                } else {
                                }

                                if ((({ $ }) => $.variable.password != null)({
                                    $: variable
                                })) {
                                    if ($end - $start < 2 + variable.variable.password.length * 1) {
                                        return $incremental.variable(variable, 34, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = variable.variable.password.length >>> 8 & 0xff
                                    $buffer[$start++] = variable.variable.password.length & 0xff

                                    variable.variable.password.copy($buffer, $start, 0, variable.variable.password.length)
                                    $start += variable.variable.password.length
                                } else {
                                }

                                break

                            case 'connack':

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 38, $i, $I, $$)($buffer, $start, $end)
                                }

                                $_ =
                                    0x0 << 1 & 0xfe |
                                    variable.variable.flags.sessionPresent & 0x1

                                $buffer[$start++] = $_ & 0xff

                                $buffer[$start++] = variable.variable.reasonCode & 0xff

                                break

                            case 'publish':

                                $$[0] = ($_ => Buffer.from($_))(variable.variable.topic)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.variable(variable, 43, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: variable
                                })) {
                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 47, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = variable.variable.id >>> 8 & 0xff
                                    $buffer[$start++] = variable.variable.id & 0xff
                                } else {
                                }

                                $I[0] = ($ => $.variable.payload.length)(variable)

                                if ($end - $start < $I[0] * 1) {
                                    return $incremental.variable(variable, 50, $i, $I, $$)($buffer, $start, $end)
                                }

                                $_ = 0
                                variable.variable.payload.copy($buffer, $start)
                                $start += variable.variable.payload.length
                                $_ += variable.variable.payload.length

                                break

                            case 'pingreq':


                                break

                            case 'pingresp':


                                break
                            }

                            return { start: $start, serialize: null }
                        }
                    }
                } (),
                mqtt: function () {
                    return function (mqtt) {
                        return function ($buffer, $start, $end) {
                            let $_, $i = [], $I = [], $$ = []

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 0, $i, $I, $$)($buffer, $start, $end)
                            }

                            $_ =
                                $lookup[0].indexOf(mqtt.fixed.type) << 4 & 0xf0

                            switch (($ => $.fixed.type)(mqtt)) {
                            case 'publish':

                                $_ |=
                                    mqtt.fixed.flags.dup << 3 & 0x8 |
                                    mqtt.fixed.flags.qos << 1 & 0x6 |
                                    mqtt.fixed.flags.retain & 0x1

                                break

                            case 'pubrel':

                                $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            case 'subscribe':

                                $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            case 'unsubscribe':

                                $$[0] = ($_ => 2)(mqtt.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break

                            default:

                                $$[0] = ($_ => 0)(mqtt.fixed.flags)

                                $_ |=
                                    $$[0] & 0xf

                                break
                            }

                            $buffer[$start++] = $_ & 0xff

                            if ((value => value < 0x7f)(mqtt.fixed.length)) {
                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 3, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.fixed.length & 0xff
                            } else if ((value => value < 0x3fff)(mqtt.fixed.length)) {
                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 5, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length & 0x7f
                            } else if ((value => value < 0x1fffff)(mqtt.fixed.length)) {
                                if ($end - $start < 3) {
                                    return $incremental.mqtt(mqtt, 8, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.fixed.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length & 0x7f
                            } else {
                                if ($end - $start < 4) {
                                    return $incremental.mqtt(mqtt, 12, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = mqtt.fixed.length >>> 21 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = mqtt.fixed.length & 0x7f
                            }

                            switch (($ => $.fixed.type)(mqtt)) {
                            case 'connect':

                                $$[0] = ($_ => Buffer.from('MQTT'))(mqtt.variable.protocol)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.mqtt(mqtt, 19, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ($end - $start < 3 + 1) {
                                    return $incremental.mqtt(mqtt, 22, $i, $I, $$)($buffer, $start, $end)
                                }

                                $$[0] = ($_ => 4)(mqtt.variable.version)

                                $buffer[$start++] = $$[0] & 0xff

                                $$[0] = (($_, $) => $.variable.username == null ? 0 : 1)(mqtt.variable.flags.username, mqtt)

                                $_ =
                                    $$[0] << 7 & 0x80

                                $$[0] = (($_, $) => $.variable.password == null ? 0 : 1)(mqtt.variable.flags.password, mqtt)

                                $_ |=
                                    $$[0] << 6 & 0x40

                                $_ |=
                                    mqtt.variable.flags.wilRetain << 5 & 0x20 |
                                    mqtt.variable.flags.willQoS << 3 & 0x18

                                $$[0] = (($_, $) => $.variable.topic == null ? 0 : 1)(mqtt.variable.flags.willFlag, mqtt)

                                $_ |=
                                    $$[0] << 2 & 0x4

                                $_ |=
                                    mqtt.variable.flags.cleanStart << 1 & 0x2 |
                                    0x0 & 0x1

                                $buffer[$start++] = $_ & 0xff

                                $buffer[$start++] = mqtt.variable.keepAlive >>> 8 & 0xff
                                $buffer[$start++] = mqtt.variable.keepAlive & 0xff

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.clientId)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.mqtt(mqtt, 30, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: mqtt
                                })) {
                                    $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                                    if ($end - $start < 2 + $$[0].length * 1) {
                                        return $incremental.mqtt(mqtt, 35, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                    $buffer[$start++] = $$[0].length & 0xff

                                    $$[0].copy($buffer, $start, 0, $$[0].length)
                                    $start += $$[0].length
                                } else {
                                }

                                if ((({ $ }) => $.variable.topic != null)({
                                    $: mqtt
                                })) {
                                    if ($end - $start < 2 + mqtt.variable.message.length * 1) {
                                        return $incremental.mqtt(mqtt, 40, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = mqtt.variable.message.length >>> 8 & 0xff
                                    $buffer[$start++] = mqtt.variable.message.length & 0xff

                                    mqtt.variable.message.copy($buffer, $start, 0, mqtt.variable.message.length)
                                    $start += mqtt.variable.message.length
                                } else {
                                }

                                if ((({ $ }) => $.variable.username != null)({
                                    $: mqtt
                                })) {
                                    $$[0] = ($_ => Buffer.from($_))(mqtt.variable.username)

                                    if ($end - $start < 2 + $$[0].length * 1) {
                                        return $incremental.mqtt(mqtt, 46, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                    $buffer[$start++] = $$[0].length & 0xff

                                    $$[0].copy($buffer, $start, 0, $$[0].length)
                                    $start += $$[0].length
                                } else {
                                }

                                if ((({ $ }) => $.variable.password != null)({
                                    $: mqtt
                                })) {
                                    if ($end - $start < 2 + mqtt.variable.password.length * 1) {
                                        return $incremental.mqtt(mqtt, 51, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = mqtt.variable.password.length >>> 8 & 0xff
                                    $buffer[$start++] = mqtt.variable.password.length & 0xff

                                    mqtt.variable.password.copy($buffer, $start, 0, mqtt.variable.password.length)
                                    $start += mqtt.variable.password.length
                                } else {
                                }

                                break

                            case 'connack':

                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 55, $i, $I, $$)($buffer, $start, $end)
                                }

                                $_ =
                                    0x0 << 1 & 0xfe |
                                    mqtt.variable.flags.sessionPresent & 0x1

                                $buffer[$start++] = $_ & 0xff

                                $buffer[$start++] = mqtt.variable.reasonCode & 0xff

                                break

                            case 'publish':

                                $$[0] = ($_ => Buffer.from($_))(mqtt.variable.topic)

                                if ($end - $start < 2 + $$[0].length * 1) {
                                    return $incremental.mqtt(mqtt, 60, $i, $I, $$)($buffer, $start, $end)
                                }

                                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                                $buffer[$start++] = $$[0].length & 0xff

                                $$[0].copy($buffer, $start, 0, $$[0].length)
                                $start += $$[0].length

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: mqtt
                                })) {
                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 64, $i, $I, $$)($buffer, $start, $end)
                                    }

                                    $buffer[$start++] = mqtt.variable.id >>> 8 & 0xff
                                    $buffer[$start++] = mqtt.variable.id & 0xff
                                } else {
                                }

                                $I[0] = ($ => $.variable.payload.length)(mqtt)

                                if ($end - $start < $I[0] * 1) {
                                    return $incremental.mqtt(mqtt, 67, $i, $I, $$)($buffer, $start, $end)
                                }

                                $_ = 0
                                mqtt.variable.payload.copy($buffer, $start)
                                $start += mqtt.variable.payload.length
                                $_ += mqtt.variable.payload.length

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
                                    type: 0,
                                    flags: null,
                                    length: 0
                                }
                            }

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 1, $sip)($buffer, $start, $end)
                            }

                            $_ = $buffer[$start++]

                            fixed.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                            switch (($ => $.fixed.type)(fixed)) {
                            case 'publish':
                                fixed.fixed.flags = {
                                    dup: 0,
                                    qos: 0,
                                    retain: 0
                                }

                                fixed.fixed.flags.dup = $_ >>> 3 & 0x1

                                fixed.fixed.flags.qos = $_ >>> 1 & 0x3

                                fixed.fixed.flags.retain = $_ & 0x1

                                break

                            case 'pubrel':
                                fixed.fixed.flags = $_ & 0xf

                                break

                            case 'subscribe':
                                fixed.fixed.flags = $_ & 0xf

                                break

                            case 'unsubscribe':
                                fixed.fixed.flags = $_ & 0xf

                                break

                            default:
                                fixed.fixed.flags = $_ & 0xf

                                break
                            }

                            if ($end - $start < 1) {
                                return $incremental.fixed(fixed, 3, $sip)($buffer, $start, $end)
                            }

                            $sip[0] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[0])) {
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

                                if ((sip => (sip & 0x80) == 0)($sip[1])) {
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

                                    if ((sip => (sip & 0x80) == 0)($sip[2])) {
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
                            let $_, $i = [], $I = [], $slice = null

                            let variable = {
                                variable: null
                            }

                            switch (($ => $.fixed.type)(variable)) {
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
                                    clientId: [],
                                    topic: null,
                                    message: null,
                                    username: null,
                                    password: null
                                }

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 2, $i, $I)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.variable(variable, 4, $i, $I)($buffer, $start, $end)
                                }

                                variable.variable.protocol = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                variable.variable.protocol = ($_ => $_.toString())(variable.variable.protocol)

                                if ($end - $start < 4) {
                                    return $incremental.variable(variable, 5, $i, $I)($buffer, $start, $end)
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
                                    return $incremental.variable(variable, 11, $i, $I)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.variable(variable, 13, $i, $I)($buffer, $start, $end)
                                }

                                variable.variable.clientId = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                variable.variable.clientId = ($_ => $_.toString())(variable.variable.clientId)

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: variable
                                })) {
                                    variable.variable.topic = []

                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 15, $i, $I)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.variable(variable, 17, $i, $I)($buffer, $start, $end)
                                    }

                                    variable.variable.topic = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]

                                    variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)
                                } else {
                                    variable.variable.topic = null
                                }

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: variable
                                })) {
                                    variable.variable.message = []

                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 20, $i, $I)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.variable(variable, 22, $i, $I)($buffer, $start, $end)
                                    }

                                    variable.variable.message = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]
                                } else {
                                    variable.variable.message = null
                                }

                                if ((({ $ }) => $.variable.flags.username == 1)({
                                    $: variable
                                })) {
                                    variable.variable.username = []

                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 25, $i, $I)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.variable(variable, 27, $i, $I)($buffer, $start, $end)
                                    }

                                    variable.variable.username = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]

                                    variable.variable.username = ($_ => $_.toString())(variable.variable.username)
                                } else {
                                    variable.variable.username = null
                                }

                                if ((({ $ }) => $.variable.flags.password == 1)({
                                    $: variable
                                })) {
                                    variable.variable.password = []

                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 30, $i, $I)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.variable(variable, 32, $i, $I)($buffer, $start, $end)
                                    }

                                    variable.variable.password = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]
                                } else {
                                    variable.variable.password = null
                                }

                                break

                            case 'connack':
                                variable.variable = {
                                    flags: {
                                        sessionPresent: 0
                                    },
                                    reasonCode: 0
                                }

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 34, $i, $I)($buffer, $start, $end)
                                }

                                $_ = $buffer[$start++]

                                variable.variable.flags.sessionPresent = $_ & 0x1

                                variable.variable.reasonCode = $buffer[$start++]

                                break

                            case 'publish':
                                variable.variable = {
                                    topic: [],
                                    id: null,
                                    payload: null
                                }

                                if ($end - $start < 2) {
                                    return $incremental.variable(variable, 38, $i, $I)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.variable(variable, 40, $i, $I)($buffer, $start, $end)
                                }

                                variable.variable.topic = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                variable.variable.topic = ($_ => $_.toString())(variable.variable.topic)

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: variable
                                })) {
                                    if ($end - $start < 2) {
                                        return $incremental.variable(variable, 42, $i, $I)($buffer, $start, $end)
                                    }

                                    variable.variable.id =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]
                                } else {
                                    variable.variable.id = null
                                }

                                $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(variable)

                                if ($end - $start < $I[0] * 1) {
                                    return $incremental.variable(variable, 45, $i, $I)($buffer, $start, $end)
                                }

                                $slice = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]
                                variable.variable.payload = $slice

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
                },
                mqtt: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $_, $i = [], $I = [], $sip = [], $slice = null

                            let mqtt = {
                                fixed: {
                                    type: 0,
                                    flags: null,
                                    length: 0
                                },
                                variable: null
                            }

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 1, $i, $I, $sip)($buffer, $start, $end)
                            }

                            $_ = $buffer[$start++]

                            mqtt.fixed.type = $lookup[0][$_ >>> 4 & 0xf]

                            switch (($ => $.fixed.type)(mqtt)) {
                            case 'publish':
                                mqtt.fixed.flags = {
                                    dup: 0,
                                    qos: 0,
                                    retain: 0
                                }

                                mqtt.fixed.flags.dup = $_ >>> 3 & 0x1

                                mqtt.fixed.flags.qos = $_ >>> 1 & 0x3

                                mqtt.fixed.flags.retain = $_ & 0x1

                                break

                            case 'pubrel':
                                mqtt.fixed.flags = $_ & 0xf

                                break

                            case 'subscribe':
                                mqtt.fixed.flags = $_ & 0xf

                                break

                            case 'unsubscribe':
                                mqtt.fixed.flags = $_ & 0xf

                                break

                            default:
                                mqtt.fixed.flags = $_ & 0xf

                                break
                            }

                            if ($end - $start < 1) {
                                return $incremental.mqtt(mqtt, 3, $i, $I, $sip)($buffer, $start, $end)
                            }

                            $sip[0] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[0])) {
                                if ($end - ($start - 1) < 1) {
                                    return $incremental.mqtt(mqtt, 6, $i, $I, $sip)($buffer, $start - 1, $end)
                                }

                                $start -= 1

                                mqtt.fixed.length = $buffer[$start++]
                            } else {
                                if ($end - $start < 1) {
                                    return $incremental.mqtt(mqtt, 8, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $sip[1] = $buffer[$start++]

                                if ((sip => (sip & 0x80) == 0)($sip[1])) {
                                    if ($end - ($start - 2) < 2) {
                                        return $incremental.mqtt(mqtt, 11, $i, $I, $sip)($buffer, $start - 2, $end)
                                    }

                                    $start -= 2

                                    mqtt.fixed.length =
                                        ($buffer[$start++] & 0x7f) << 7 |
                                        $buffer[$start++]
                                } else {
                                    if ($end - $start < 1) {
                                        return $incremental.mqtt(mqtt, 14, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    $sip[2] = $buffer[$start++]

                                    if ((sip => (sip & 0x80) == 0)($sip[2])) {
                                        if ($end - ($start - 3) < 3) {
                                            return $incremental.mqtt(mqtt, 17, $i, $I, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        mqtt.fixed.length =
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                    } else {
                                        if ($end - ($start - 3) < 4) {
                                            return $incremental.mqtt(mqtt, 21, $i, $I, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        mqtt.fixed.length = (
                                            ($buffer[$start++] & 0x7f) << 21 |
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                        ) >>> 0
                                    }
                                }
                            }

                            switch (($ => $.fixed.type)(mqtt)) {
                            case 'connect':
                                mqtt.variable = {
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
                                    clientId: [],
                                    topic: null,
                                    message: null,
                                    username: null,
                                    password: null
                                }

                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 27, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.mqtt(mqtt, 29, $i, $I, $sip)($buffer, $start, $end)
                                }

                                mqtt.variable.protocol = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                mqtt.variable.protocol = ($_ => $_.toString())(mqtt.variable.protocol)

                                if ($end - $start < 4) {
                                    return $incremental.mqtt(mqtt, 30, $i, $I, $sip)($buffer, $start, $end)
                                }

                                mqtt.variable.version = $buffer[$start++]

                                $_ = $buffer[$start++]

                                mqtt.variable.flags.username = $_ >>> 7 & 0x1

                                mqtt.variable.flags.username = ($_ => $_)(mqtt.variable.flags.username)

                                mqtt.variable.flags.password = $_ >>> 6 & 0x1

                                mqtt.variable.flags.wilRetain = $_ >>> 5 & 0x1

                                mqtt.variable.flags.willQoS = $_ >>> 3 & 0x3

                                mqtt.variable.flags.willFlag = $_ >>> 2 & 0x1

                                mqtt.variable.flags.cleanStart = $_ >>> 1 & 0x1

                                mqtt.variable.keepAlive =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 36, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.mqtt(mqtt, 38, $i, $I, $sip)($buffer, $start, $end)
                                }

                                mqtt.variable.clientId = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                mqtt.variable.clientId = ($_ => $_.toString())(mqtt.variable.clientId)

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.topic = []

                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 40, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.mqtt(mqtt, 42, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    mqtt.variable.topic = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]

                                    mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)
                                } else {
                                    mqtt.variable.topic = null
                                }

                                if ((({ $ }) => $.variable.flags.willFlag == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.message = []

                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 45, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.mqtt(mqtt, 47, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    mqtt.variable.message = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]
                                } else {
                                    mqtt.variable.message = null
                                }

                                if ((({ $ }) => $.variable.flags.username == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.username = []

                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 50, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.mqtt(mqtt, 52, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    mqtt.variable.username = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]

                                    mqtt.variable.username = ($_ => $_.toString())(mqtt.variable.username)
                                } else {
                                    mqtt.variable.username = null
                                }

                                if ((({ $ }) => $.variable.flags.password == 1)({
                                    $: mqtt
                                })) {
                                    mqtt.variable.password = []

                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 55, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    $I[0] =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]

                                    if ($end - $start < 1 * $I[0]) {
                                        return $incremental.mqtt(mqtt, 57, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    mqtt.variable.password = $buffer.slice($start, $start + $I[0])
                                    $start += $I[0]
                                } else {
                                    mqtt.variable.password = null
                                }

                                break

                            case 'connack':
                                mqtt.variable = {
                                    flags: {
                                        sessionPresent: 0
                                    },
                                    reasonCode: 0
                                }

                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 59, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $_ = $buffer[$start++]

                                mqtt.variable.flags.sessionPresent = $_ & 0x1

                                mqtt.variable.reasonCode = $buffer[$start++]

                                break

                            case 'publish':
                                mqtt.variable = {
                                    topic: [],
                                    id: null,
                                    payload: null
                                }

                                if ($end - $start < 2) {
                                    return $incremental.mqtt(mqtt, 63, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $I[0] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                if ($end - $start < 1 * $I[0]) {
                                    return $incremental.mqtt(mqtt, 65, $i, $I, $sip)($buffer, $start, $end)
                                }

                                mqtt.variable.topic = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]

                                mqtt.variable.topic = ($_ => $_.toString())(mqtt.variable.topic)

                                if ((({ $ }) => $.fixed.flags.qos > 0)({
                                    $: mqtt
                                })) {
                                    if ($end - $start < 2) {
                                        return $incremental.mqtt(mqtt, 67, $i, $I, $sip)($buffer, $start, $end)
                                    }

                                    mqtt.variable.id =
                                        $buffer[$start++] << 8 |
                                        $buffer[$start++]
                                } else {
                                    mqtt.variable.id = null
                                }

                                $I[0] = ($ => $.fixed.length - ($.variable.topic.length + 2 + $.fixed.flags.qos > 0 ? 2 : 0))(mqtt)

                                if ($end - $start < $I[0] * 1) {
                                    return $incremental.mqtt(mqtt, 70, $i, $I, $sip)($buffer, $start, $end)
                                }

                                $slice = $buffer.slice($start, $start + $I[0])
                                $start += $I[0]
                                mqtt.variable.payload = $slice

                                break

                            case 'pingreq':
                                mqtt.variable = null

                                break

                            case 'pingresp':
                                mqtt.variable = null

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
