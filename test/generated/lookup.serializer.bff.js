module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


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

                if ($end - $start < 2) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $_ = $lookup.object.value.indexOf(object.value)

                $buffer[$start++] = ($_ & 0xff)

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
