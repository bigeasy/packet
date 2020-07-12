module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1 + object.array.reduce((sum, buffer) => sum + buffer.length, 0)) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                {
                    const length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                    $buffer[$start++] = (length & 0xff)
                }

                {
                    for (let i = 0, I = object.array.length; i < I; i++) {
                        object.array[i].copy($buffer, $start, 0, object.array[i].length)
                        $start += object.array[i].length
                    }
                }

                if (($ => false)(object)){
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 5, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.sentry >>> 8 & 0xff)
                    $buffer[$start++] = (object.sentry & 0xff)
                } else if (($ => true)(object)){
                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 7, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.sentry & 0xff)
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
