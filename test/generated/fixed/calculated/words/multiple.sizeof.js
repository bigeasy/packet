module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += (() => 16)() * 1

            $start += 1

            return $start
        }
    } ()
}
