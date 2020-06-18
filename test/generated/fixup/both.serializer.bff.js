module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            if ($end - $start < 2) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $i[0] = (value => -value)(object.value)

            $buffer[$start++] = ($i[0] >>> 8 & 0xff)
            $buffer[$start++] = ($i[0] & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
