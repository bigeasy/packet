module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0, $i = []

            $start += 1

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $start += 2 * object.array[$i[0]].length + 2
            }
            $start += 2

            $start += 1

            return $start
        }
    } ()
}
