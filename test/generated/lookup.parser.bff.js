module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.bff.object = function () {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function parse ($buffer, $start, $end) {
            let $_

            const object = {
                value: 0
            }

            if ($end - $start < 1) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $_ = ($buffer[$start++])

            object.value = $lookup.object.value[$_]

            return { start: $start, object: object, parse: null }
        }
    }
}
