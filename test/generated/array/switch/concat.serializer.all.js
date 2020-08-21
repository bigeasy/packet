module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.type & 0xff

                switch (($ => $.type)(object)) {
                case 0:

                    $buffer[$start++] = object.array.length & 0xff

                    break

                default:

                    $buffer[$start++] = object.array.length >>> 8 & 0xff
                    $buffer[$start++] = object.array.length & 0xff

                    break
                }

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
