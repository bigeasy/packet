module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0

            $start += 5

            return $start
        }
    } ()
}