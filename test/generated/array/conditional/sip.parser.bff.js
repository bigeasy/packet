module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = [], $sip = []

                    let object = {
                        nudge: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $i, $I, $sip)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 3, $i, $I, $sip)($buffer, $start, $end)
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[0])) {
                        if ($end - ($start - 1) < 1) {
                            return $incremental.object(object, 6, $i, $I, $sip)($buffer, $start - 1, $end)
                        }

                        $start -= 1

                        $I[0] = $buffer[$start++]
                    } else {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 8, $i, $I, $sip)($buffer, $start, $end)
                        }

                        $sip[1] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[1])) {
                            if ($end - ($start - 2) < 2) {
                                return $incremental.object(object, 11, $i, $I, $sip)($buffer, $start - 2, $end)
                            }

                            $start -= 2

                            $I[0] =
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            if ($end - ($start - 2) < 3) {
                                return $incremental.object(object, 14, $i, $I, $sip)($buffer, $start - 2, $end)
                            }

                            $start -= 2

                            $I[0] =
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        }
                    }
                    $i[0] = 0

                    if ($end - $start < 1 + 1 * $I[0]) {
                        return $incremental.object(object, 18, $i, $I, $sip)($buffer, $start, $end)
                    }

                    for (; $i[0] < $I[0]; $i[0]++) {
                        object.array[$i[0]] = $buffer[$start++]
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
