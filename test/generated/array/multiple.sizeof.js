module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += 2

            $start += 1 * object.first.length

            $start += 2

            $start += 1 * object.second.length

            $start += 1

            return $start
        }
    } ()
}
