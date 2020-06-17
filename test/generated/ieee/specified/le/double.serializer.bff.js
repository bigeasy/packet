module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            const assert = require('assert')

            let $i = []

            if ($end - $start < 8) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $i[0] = (function (value) {
                const buffer = Buffer.alloc(8)
                buffer.writeDoubleLE(value)
                return buffer
            })(object.value)

            assert.equal($i[0].length, 8)

            for ($i[1] = 0; $i[1] < $i[0].length; $i[1]++) {
                $buffer[$start++] = $i[0][$i[1]] & 0xff
            }


            return { start: $start, serialize: null }
        }
    }
}
