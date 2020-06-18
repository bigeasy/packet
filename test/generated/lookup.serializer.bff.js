module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

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
