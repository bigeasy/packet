module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = [], $$ = []

            $buffer[$start++] = object.nudge & 0xff

            $$[0] = (function ($_) {
                return $_.slice().reverse()
            })(object.value)

            $buffer[$start++] = $$[0].length & 0xff

            for ($i[0] = 0; $i[0] < $$[0].length; $i[0]++) {
                $buffer[$start++] = $$[0][$i[0]] & 0xff
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
