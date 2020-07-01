module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $_ = 0

            $_ += 1

            return $_
        }
    } ()
}
