module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {
        return function (object) {
            let $start = 0

            $start += 1

            $start += (() => 4)() * 2

            $start += 1

            return $start
        }
    } ()
}
