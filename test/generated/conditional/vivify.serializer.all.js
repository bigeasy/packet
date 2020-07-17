module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                $buffer[$start++] = (object.type & 0xff)

                if (($ => $.type == 0)(object)) {
                    $buffer[$start++] = (object.value.value & 0xff)
                } else if (($ => $.type == 1)(object)) {
                    $buffer[$start++] = (object.value.length & 0xff)

                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = (object.value[$i[0]] & 0xff)
                    }
                } else if (($ => $.type == 2)(object)) {
                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = (object.value[$i[0]] & 0xff)
                    }

                    $buffer[$start++] = 0x0
                } else if (($ => $.type == 3)(object)) {
                    $buffer[$start++] = (object.value.length & 0xff)

                    object.value.copy($buffer, $start, 0, object.value.length)
                    $start += object.value.length
                } else if (($ => $.type == 4)(object)) {
                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = (object.value[$i[0]] & 0xff)
                    }
                } else {
                    $_ = 0
                    object.value.copy($buffer, $start)
                    $start += object.value.length
                    $_ += object.value.length
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
