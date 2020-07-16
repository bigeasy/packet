module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0

            $start += 1


            if (($ => $.type == 0)(object)) {
                $start += 1
            } else if (($ => $.type == 1)(object)) {
                $start += 1 +
                    1 * object.value.length
            } else if (($ => $.type == 2)(object)) {
                $start += 1 * object.value.length + 1
            } else if (($ => $.type == 3)(object)) {
                $start += 1 +
                    1 * object.value.length
            } else if (($ => $.type == 4)(object)) {
                $start += 3
            } else {
                $start += 3
            }

            $start += 1

            return $start
        }
    } ()
}
