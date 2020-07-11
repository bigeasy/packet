module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0

            $start += 8

            $start += 1 * object.sentry.length + 1

            return $start
        }
    } ()
}
