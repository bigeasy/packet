module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1


            if ((value => value <= 0x7f)(object.value)) {
                $start += 1
            } else if ((value => value <= 0x3fff)(object.value)) {
                $start += 2
            } else if ((value => value <= 0x1fffff)(object.value)) {
                $start += 3
            } else {
                $start += 4
            }

            $start += 1

            return $start
        }
    } ()
}
