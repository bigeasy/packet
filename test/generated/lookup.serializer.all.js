module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.all.object = function (object) {
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

            $_ = $lookup.object.value.indexOf(object.value)

            $buffer[$start++] = ($_ & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
