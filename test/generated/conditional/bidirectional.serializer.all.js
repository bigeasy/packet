module.exports = function ({ serializers }) {
    serializers.all.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                $buffer[$start++] = (object.type & 0xff)

                if (($ => $.type == 0)(object)){
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                } else if (($ => $.type == 1)(object)){
                    $buffer[$start++] = (object.value >>> 16 & 0xff)
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                } else {
                    $buffer[$start++] = (object.value >>> 24 & 0xff)
                    $buffer[$start++] = (object.value >>> 16 & 0xff)
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
