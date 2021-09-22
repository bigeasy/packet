module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1 * object.value.length + 1

            $start += 1

            return $start
        }
    } ()
}
