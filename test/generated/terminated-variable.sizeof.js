module.exports = function (sizeOf) {
    sizeOf.object = function (object) {
        let $_ = 0, $i = []

        for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
            $_ += 2
        }

        return $_
    }
}
