module.exports = {
    object: function () {
        return function (object) {
            let $start = 0, $$ = []

            $$[0] = ((value) => Buffer.from(String(value)))(object.value)

            $start += 1 * $$[0].length + 1

            $start += 1

            return $start
        }
    } ()
}
