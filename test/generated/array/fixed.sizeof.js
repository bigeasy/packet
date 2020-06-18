module.exports = function (sizeOf) {
    const $Buffer = Buffer

    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 2

        $_ += 4 * object.array.length

        return $_
    }
}
