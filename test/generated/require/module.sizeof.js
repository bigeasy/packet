module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        const twiddle = require('../../../test/cycle/twiddle')

        return function (object) {
            let $_ = 0

            $_ += 5

            return $_
        }
    } ()
}
