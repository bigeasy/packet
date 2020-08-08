module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
