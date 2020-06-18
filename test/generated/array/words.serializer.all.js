module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.value.first & 0xff)

            $buffer[$start++] = (object.value.second & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
