module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        const assert = require('assert')

        return function (object) {
            let $_ = 0

            $_ += 3

            return $_
        }
    } ()
}
