module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.word >>> 24 & 0xff)
            $buffer[$start++] = (object.word >>> 16 & 0xff)
            $buffer[$start++] = (object.word >>> 8 & 0xff)
            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
