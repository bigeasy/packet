module.exports = function ({ serializers }) {
    serializers.all.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                $buffer[$start++] = (object.word & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
