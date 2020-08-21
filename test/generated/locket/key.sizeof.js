module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 4

            $start += 8

            $start += 4

            $start += 1 * object.key.length

            return $start
        }
    } ()
}
