module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $sip = []

                let object = {
                    value: 0,
                    sentry: 0
                }

                $sip[0] = $buffer[$start++]

                if ((sip => sip < 251)($sip[0])) {
                    $start -= 1

                    object.value = $buffer[$start++]
                } else if ((sip => sip == 0xfc)($sip[0])) {
                    object.value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                } else {
                    object.value =
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                }

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
