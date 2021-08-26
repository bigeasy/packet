module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += 4 * object.array.length

            return $start
        }
    } ()
}
