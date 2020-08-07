module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $step = 1

                    case 1:

                        break

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
