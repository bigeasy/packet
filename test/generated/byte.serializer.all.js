module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < NaN) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0, [])
                }
            }

            $_ = object.word

            $buffer[$start++] = $_ & 0xff

            return { start: $start, serialize: null }
        }
    }
}
