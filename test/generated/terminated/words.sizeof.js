module.exports = function (sizeOf) {
    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 2 * object.array.length + 2

        $_ += 1

        return $_
    }
}
