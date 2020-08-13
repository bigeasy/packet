module.exports = {
    object: function () {
        return function (object) {
            let $start = 0, $length

            $start += 1

            $length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)


            if ((value => value < 128)($length)) {
                $start += 1
            } else {
                $start += 2
            }

            $start += $length

            $start += 1

            return $start
        }
    } ()
}
