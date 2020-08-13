module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = [], $I = []

                $buffer[$start++] = object.type & 0xff

                $I[0] = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                switch (($ => $.type)(object)) {
                case 0:

                    $buffer[$start++] = $I[0] & 0xff

                    break

                default:

                    $buffer[$start++] = $I[0] >>> 8 & 0xff
                    $buffer[$start++] = $I[0] & 0xff

                    break
                }

                {
                    for (let i = 0, I = object.array.length; i < I; i++) {
                        object.array[i].copy($buffer, $start, 0, object.array[i].length)
                        $start += object.array[i].length
                    }
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
