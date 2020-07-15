module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object, $step = 0) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        value: []
                    }

                    $step = 1

                case 1:

                    object.value = []

                    $step = 2

                case 2:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
