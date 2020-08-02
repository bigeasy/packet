module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $sip = 0

            let object = {
                value: 0,
                sentry: 0
            }

            $sip = (
                $buffer[$start++]
            ) >>> 0

            if ((sip => sip < 251)($sip)) {
                $start -= 1

                object.value = (
                    $buffer[$start++]
                ) >>> 0
            } else if ((sip => sip == 0xfc)($sip)) {
                object.value = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            } else {
                object.value = (
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            }

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
