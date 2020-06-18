module.exports = function (sizeOf) {
    const $Buffer = Buffer

    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 8

        return $_
    }
}
