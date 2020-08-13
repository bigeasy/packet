module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            switch (($ => $.type)(object)) {
            case 0:

                $start += 1

                break

            default:

                $start += 2

                break
            }

            $start += 1 * object.array.length

            $start += 1

            return $start
        }
    } ()
}
