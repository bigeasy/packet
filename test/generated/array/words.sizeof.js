module.exports = function (sizeOf) {
    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 2 +
            2 * object.array.length

        $_ += 1

        return $_
    }
}
