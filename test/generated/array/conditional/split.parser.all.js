module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = [], $sip = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $sip[0] = $buffer[$start++]

                if ((sip => (sip & 0x80) == 0)($sip[0])) {
                    $start -= 1

                    $I[0] = $buffer[$start++]
                } else {
                    $start -= 1

                    $I[0] =
                        ($buffer[$start++] & 0x7f) << 7 |
                        $buffer[$start++]
                }
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = $buffer[$start++]
                }

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
