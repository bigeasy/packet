module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 2

            $start += 2 * object.array.length

            return $start
        }
    } ()
}
