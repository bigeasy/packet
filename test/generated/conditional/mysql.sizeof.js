module.exports = {
    object: function () {
        return function (object) {
            let $start = 0


            if ((value => value < 251)(object.value)) {
                $start += 1
            } else if ((value => value >= 251 && value < 2 ** 16)(object.value)) {
                $start += 3
            } else {
                $start += 4
            }

            $start += 1

            return $start
        }
    } ()
}
