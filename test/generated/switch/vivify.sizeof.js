module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1

            switch (String(($ => $.type)(object))) {
            case "0":

                $start += 1

                break

            case "1":

                $start += 1 +
                    1 * object.value.length

                break

            case "2":

                $start += 1 * object.value.length + 1

                break

            case "3":

                $start += 1 +
                    1 * object.value.length

                break

            case "4":

                $start += 3

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
