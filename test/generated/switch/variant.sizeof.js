module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1

            switch (($ => $.type)(object)) {
            case 0:

                $start += 1

                break

            case 1:

                $start += 2

                break

            default:

                $start += 3

                break
            }

            $start += 1

            return $start
        }
    } ()
}
