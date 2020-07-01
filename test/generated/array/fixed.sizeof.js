module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $_ = 0

            $_ += 2 +
                4 * object.array.length

            $_ += 1

            return $_
        }
    } ()
}
