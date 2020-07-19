module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
