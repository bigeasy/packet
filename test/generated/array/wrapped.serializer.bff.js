module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $$ = []

                if ($end - $start < 4 + object.array.length * 1) {
                    return serializers.inc.object(object, 0, $i, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.nudge & 0xff)

                $buffer.write('cd', $start, $start + 1, 'hex')
                $start += 1

                $$[0] = (value => value)(object.array.length)

                $buffer[$start++] = ($$[0] & 0xff)

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
