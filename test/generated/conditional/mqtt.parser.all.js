module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $sip = []

                let object = {
                    nudge: 0,
                    value: 0,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $sip[0] = $buffer[$start++]

                if ((sip => (sip & 0x80) == 0)($sip[0])) {
                    $start -= 1

                    object.value = $buffer[$start++]
                } else {
                    $sip[1] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[1])) {
                        $start -= 2

                        object.value =
                            ($buffer[$start++] & 0x7f) << 7 |
                            $buffer[$start++]
                    } else {
                        $sip[2] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[2])) {
                            $start -= 3

                            object.value =
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
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

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
