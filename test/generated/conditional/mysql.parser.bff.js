module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $sip = []

                    let object = {
                        value: 0,
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $sip)($buffer, $start, $end)
                    }

                    $sip[0] = $buffer[$start++]

                    if ((sip => sip < 251)($sip[0])) {
                        if ($end - ($start - 1) < 1) {
                            return $incremental.object(object, 4, $sip)($buffer, $start - 1, $end)
                        }

                        $start -= 1

                        object.value = $buffer[$start++]
                    } else if ((sip => sip == 0xfc)($sip[0])) {
                        if ($end - ($start - 1) < 3) {
                            return $incremental.object(object, 6, $sip)($buffer, $start - 1, $end)
                        }

                        object.value = (
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                        ) >>> 0
                    } else {
                        if ($end - ($start - 1) < 4) {
                            return $incremental.object(object, 10, $sip)($buffer, $start - 1, $end)
                        }

                        object.value = (
                            $buffer[$start++] << 16 |
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                        ) >>> 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 14, $sip)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
