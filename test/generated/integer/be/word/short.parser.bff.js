module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        value: 0
                    }

                    if ($end - $start < 2) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
