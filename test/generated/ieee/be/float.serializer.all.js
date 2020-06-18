module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            const assert = require('assert')

            let $i = []

            $i[0] = (function (value) {
                const buffer = $alloc(4)
                buffer.writeFloatBE(value)
                return buffer
            })(object.value)

            assert.equal($i[0].length, 4)

            for ($i[1] = 0; $i[1] < $i[0].length; $i[1]++) {
                $buffer[$start++] = ($i[0][$i[1]] & 0xff)
            }


            return { start: $start, serialize: null }
        }
    }
}
