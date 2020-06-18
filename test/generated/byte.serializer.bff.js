module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 1) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
