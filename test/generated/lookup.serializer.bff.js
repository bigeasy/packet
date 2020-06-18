module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.bff.object = function (object) {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 1) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $_ = $lookup.object.value.indexOf(object.value)

            $buffer[$start++] = ($_ & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
