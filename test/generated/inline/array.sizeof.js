module.exports = {
    object: function () {
        return function (object) {
            let $start = 0, $$ = []

            $start += 1

            $$[0] = (function ($_) {
                return $_.slice().reverse()
            })(object.value)

            $start += 1

            $start += 1 * $$[0].length

            $start += 1

            return $start
        }
    } ()
}
