module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = []

                $buffer[$start++] = object.array.length >>> 8 & 0xff
                $buffer[$start++] = object.array.length & 0xff
                $i[0] = 0

                for (; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]].value >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]].value & 0xff
                }

                return { start: $start, serialize: null }
            }
        } ()
    }
}
