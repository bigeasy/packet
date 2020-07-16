module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += object.array.reduce((sum, buffer) => sum + buffer.length, 0) +
                1 * object.array.length

            $start += 1

            return $start
        }
    } ()
}
