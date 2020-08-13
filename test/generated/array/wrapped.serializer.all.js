module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = [], $$ = []

                $buffer[$start++] = object.nudge & 0xff

                $buffer.write('cd', $start, $start + 1, 'hex')
                $start += 1

                $$[0] = (value => value)(object.array.length)

                $buffer[$start++] = $$[0] & 0xff
                $i[0] = 0

                for (; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]] & 0xff
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
