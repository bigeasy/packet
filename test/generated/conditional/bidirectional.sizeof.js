module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1


            if (($ => $.type == 0)(object)) {
                $start += 2
            } else if (($ => $.type == 1)(object)) {
                $start += 3
            } else {
                $start += 4
            }

            $start += 1

            return $start
        }
    } ()
}
