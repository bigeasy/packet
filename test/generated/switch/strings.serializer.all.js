module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.type & 0xff

                switch (String(($ => $.type)(object))) {
                case "0":

                    $buffer[$start++] = object.value & 0xff

                    break

                case "1":

                    $buffer[$start++] = object.value >>> 8 & 0xff
                    $buffer[$start++] = object.value & 0xff

                    break

                default:

                    $buffer[$start++] = object.value >>> 16 & 0xff
                    $buffer[$start++] = object.value >>> 8 & 0xff
                    $buffer[$start++] = object.value & 0xff

                    break
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
