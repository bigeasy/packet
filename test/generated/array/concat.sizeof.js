module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0

            $start += 1

            $start += 1 +
                1 * object.array.length


            if (($ => $.type == 0)(object)){
                $start += 1
            } else if (($ => true)(object)){
                $start += 2
            }

            return $start
        }
    } ()
}
