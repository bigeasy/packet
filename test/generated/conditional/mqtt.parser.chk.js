module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $sip = []

                let object = {
                    nudge: 0,
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $sip)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3, $sip)($buffer, $start, $end)
                }

                $sip[0] = $buffer[$start++]

                if ((sip => (sip & 0x80) == 0)($sip[0], object)) {
                    if ($end - ($start - 1) < 1) {
                        return parsers.inc.object(object, 6, $sip)($buffer, $start - 1, $end)
                    }

                    $start -= 1

                    object.value = $buffer[$start++]
                } else {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 8, $sip)($buffer, $start, $end)
                    }

                    $sip[1] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[1], object)) {
                        if ($end - ($start - 2) < 2) {
                            return parsers.inc.object(object, 11, $sip)($buffer, $start - 2, $end)
                        }

                        $start -= 2

                        object.value = (
                            ($buffer[$start++] & 0x7f) << 7 |
                            $buffer[$start++]
                        ) >>> 0
                    } else {
                        if ($end - $start < 1) {
                            return parsers.inc.object(object, 14, $sip)($buffer, $start, $end)
                        }

                        $sip[2] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[2], object)) {
                            if ($end - ($start - 3) < 3) {
                                return parsers.inc.object(object, 17, $sip)($buffer, $start - 3, $end)
                            }

                            $start -= 3

                            object.value = (
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                            ) >>> 0
                        } else {
                            if ($end - ($start - 3) < 4) {
                                return parsers.inc.object(object, 21, $sip)($buffer, $start - 3, $end)
                            }

                            $start -= 3

                            object.value = (
                                ($buffer[$start++] & 0x7f) << 21 |
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                            ) >>> 0
                        }
                    }
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 26, $sip)($buffer, $start, $end)
                }

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
