module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        const twiddle = require('../../../test/cycle/twiddle')

        return function (object) {
            let $start = 0

            $start += 5

            return $start
        }
    } ()
}
