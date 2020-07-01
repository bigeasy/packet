module.exports = function ({ serializers }) {
    serializers.all.object = function () {


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

                $_ = $lookup.object.value.indexOf(object.value)

                $buffer[$start++] = ($_ & 0xff)

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
