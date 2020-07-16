module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $sip = 0

            let object = {
                value: 0,
                sentry: 0
            }

            $sip = ($buffer[$start++])

            if ((sip => sip < 251)($sip)) {
                $start -= 1

                object.value = ($buffer[$start++])
            } else if ((sip => sip == 0xfc)($sip)) {
                object.value =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            } else {
                object.value =
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            }

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
