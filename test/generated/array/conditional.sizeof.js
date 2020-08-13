module.exports = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1


            if ((value => value < 128)(object.array.length)) {
                $start += 1
            } else {
                $start += 2
            }

            $start += 1 * object.array.length

            $start += 1

            return $start
        }
    } ()
}
