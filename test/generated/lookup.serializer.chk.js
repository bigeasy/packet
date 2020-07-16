module.exports = function ({ serializers }) {
    serializers.chk.object = function () {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function (object) {
            return function ($buffer, $start, $end) {
                let $_

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $_ = $lookup.object.value.indexOf(object.value)

                $buffer[$start++] = ($_ & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
