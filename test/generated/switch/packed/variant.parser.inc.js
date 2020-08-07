module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            header: {
                                type: 0,
                                value: null
                            },
                            sentry: 0
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

                        object.header.type = $_ >>> 6 & 0x3

                        switch (($ => $.header.type)(object)) {
                        case 0:
                            object.header.value = $_ & 0x3f

                            break

                        case 1:
                            object.header.value = $_ & 0x3

                            break

                        default:
                            object.header.value = {
                                two: 0,
                                four: 0
                            }

                            object.header.value.two = $_ >>> 4 & 0x3

                            object.header.value.four = $_ & 0xf

                            break
                        }

                    case 3:

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }
                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
