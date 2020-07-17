module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $sip = 0

                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $sip)($buffer, $start, $end)
                }

                $sip = ($buffer[$start++])

                if ((sip => sip < 251)($sip)) {
                    if ($end - ($start - 1) < 1) {
                        return parsers.inc.object(object, 4, $sip)($buffer, $start - 1, $end)
                    }

                    $start -= 1

                    object.value = ($buffer[$start++])
                } else if ((sip => sip == 0xfc)($sip)) {
                    if ($end - ($start - 1) < 3) {
                        return parsers.inc.object(object, 6, $sip)($buffer, $start - 1, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } else {
                    if ($end - ($start - 1) < 4) {
                        return parsers.inc.object(object, 10, $sip)($buffer, $start - 1, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x10000 +
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 14, $sip)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
