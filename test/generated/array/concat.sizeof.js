module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += 1 +
                1 * object.array.length

            $start += 1

            return $start
        }
    } ()
}
