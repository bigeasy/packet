module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $_ = 0

            $_ += 1

            if (((_, $) => $.type == 0)(object.value, object)) {
                $_ += 2
            } else if (((_, $) => $.type == 1)(object.value, object)) {
                $_ += 3
            } else {
                $_ += 4
            }

            $_ += 1

            return $_
        }
    } ()
}
