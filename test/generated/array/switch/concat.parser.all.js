module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = []

                let object = {
                    type: 0,
                    array: [],
                    sentry: 0
                }

                object.type = $buffer[$start++]

                switch (($ => $.type)(object)) {
                case 0:
                    $I[0] = $buffer[$start++]

                    break

                default:
                    $I[0] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    break
                }

                object.array = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
