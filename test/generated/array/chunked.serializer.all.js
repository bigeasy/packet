module.exports = function ({ serializers }) {
    serializers.all.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

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
                    $buffer[$start++] = (object.sentry >>> 8 & 0xff)
                    $buffer[$start++] = (object.sentry & 0xff)
                } else if (($ => true)(object)){
                    $buffer[$start++] = (object.sentry & 0xff)
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
