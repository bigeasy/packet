module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1


            if (((_, $) => $.type == 0)(object.value, object)) {
                $start += 2
            } else if (((_, $) => $.type == 1)(object.value, object)) {
                $start += 3
            } else {
                $start += 4
            }

            $start += 1

            return $start
        }
    } ()
}
