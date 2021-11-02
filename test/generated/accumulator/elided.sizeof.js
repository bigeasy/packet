module.exports = {
    object: function () {
        const crypto = require('crypto')
        const assert = require('assert')

        return function (object) {
            let $start = 0, $accumulator = {}, $$ = []

            $start += 4

            $start += 1 * object.body.data.length + 1

            $start += 16

            return $start
        }
    } ()
}
