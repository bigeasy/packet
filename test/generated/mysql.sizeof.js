module.exports = function (sizeOf) {
    sizeOf.object = function (object) {
        let $_ = 0

        if ((value => value < 251)(object.value, object)) {
            $_ += 1
        } else if ((value => value >= 251)(object.value, object)) {
            $_ += 1

            $_ += 2
        }

        return $_
    }
}
