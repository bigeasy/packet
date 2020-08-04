module.exports = {
    object: function () {
        const twiddle = require('../../cycle/twiddle')

        return function (object) {
            let $start = 0

            $start += 5

            return $start
        }
    } ()
}
