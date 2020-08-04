module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += 2 +
                4 * object.array.length

            $start += 1

            return $start
        }
    } ()
}
