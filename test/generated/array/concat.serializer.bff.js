module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1 + object.array.length * 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.array.length & 0xff)

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                if (($ => false)(object)){
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 4, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.sentry >>> 8 & 0xff)
                    $buffer[$start++] = (object.sentry & 0xff)
                } else if (($ => true)(object)){
                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.sentry & 0xff)
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
