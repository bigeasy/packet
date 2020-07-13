module.exports = function ({ serializers }) {
    serializers.all.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                $buffer[$start++] = (object.type & 0xff)

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

                if (($ => $.type == 0)(object)){
                    $buffer[$start++] = (object.sentry & 0xff)
                } else {
                    $buffer[$start++] = (object.sentry >>> 8 & 0xff)
                    $buffer[$start++] = (object.sentry & 0xff)
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
