module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {

            return { start: $start, serialize: null }
        }
    } ()
}
