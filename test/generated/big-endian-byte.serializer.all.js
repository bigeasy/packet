module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            $_ = object.word

            $buffer[$start++] = $_ & 0xff

            return { start: $start, serialize: null }
        }
    }
}
