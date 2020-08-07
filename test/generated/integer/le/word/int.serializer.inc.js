module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ = object.value

                    case 1:

                        while ($bite != 4) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite++
                        }


                        $step = 2

                    case 2:

                        break

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
