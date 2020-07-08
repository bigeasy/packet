module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        const assert = require('assert')

        return function (object) {
            let $start = 0, $accumulator = {}

            $start += 3

            return $start
        }
    } ()
}
