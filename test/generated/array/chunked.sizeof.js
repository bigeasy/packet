module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0

            $start += object.array.reduce((sum, buffer) => sum + buffer.length, 0) +
                1 * object.array.length


            if (($ => false)(object)){
                $start += 2
            } else if (($ => true)(object)){
                $start += 1
            }

            return $start
        }
    } ()
}
