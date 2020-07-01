module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $_ = 0

            $_ += 1

            if (($ => $.type == 0)(object)) {
                $_ += 2
            } else if (($ => $.type == 1)(object)) {
                $_ += 3
            } else {
                $_ += 4
            }

            $_ += 1

            return $_
        }
    } ()
}
