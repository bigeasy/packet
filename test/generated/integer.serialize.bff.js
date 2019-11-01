module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 2) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0, [])
                }
            }

            $_ = object.integer

            $buffer[$start++] = $_ >>> 8 & 0xff
            $buffer[$start++] = $_ & 0xff

            return { start: $start, serialize: null }
        }
    }
}
