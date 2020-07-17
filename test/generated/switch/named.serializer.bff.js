module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.type & 0xff)

                switch (String((({ $ }) => $.type)({
                    $: object
                }))) {
                case "0":

                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 3)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value & 0xff)

                    break

                case "1":

                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 5)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)

                    break

                default:

                    if ($end - $start < 3) {
                        return serializers.inc.object(object, 7)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value >>> 16 & 0xff)
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)

                    break
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 9)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
