module.exports = function (sizeOf) {
    const $Buffer = Buffer

    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 2 * object.array.length + 2

        return $_
    }
}
