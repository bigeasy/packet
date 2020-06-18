module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.value >>> 24 & 0xff)
            $buffer[$start++] = (object.value >>> 16 & 0xff)
            $buffer[$start++] = (object.value >>> 8 & 0xff)
            $buffer[$start++] = (object.value & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
