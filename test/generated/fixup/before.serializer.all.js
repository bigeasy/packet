module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            $i[0] = (value => value)(object.value)

            $buffer[$start++] = ($i[0] >>> 8 & 0xff)
            $buffer[$start++] = ($i[0] & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
