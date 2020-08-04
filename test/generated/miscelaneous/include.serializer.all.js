module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = []

                $buffer[$start++] = object.nudge & 0xff

                $buffer[$start++] = object.value.length & 0xff

                for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                    $buffer[$start++] = object.value[$i[0]] & 0xff
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
