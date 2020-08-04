module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    type: 0,
                    value: 0,
                    sentry: 0
                }

                object.type = $buffer[$start++]

                switch (($ => $.type)(object)) {
                case 0:
                    object.value = $buffer[$start++]

                    break

                case 1:
                    object.value = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    break

                default:
                    object.value = (
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    break
                }

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
