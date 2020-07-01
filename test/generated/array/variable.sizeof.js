module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $_ = 0, $i = []

            $_ += 2

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $_ += 2 +
                    2 * object.array[$i[0]].first.length
            }

            $_ += 1

            return $_
        }
    } ()
}
