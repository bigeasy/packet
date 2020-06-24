module.exports = function ({ sizeOf }) {
    sizeOf.object = function (object) {
        let $_ = 0

        if ((value => value < 251)(object.value, object)) {
            $_ += 1
        } else if ((value => value >= 251 && value < 2 ** 16)(object.value, object)) {
            $_ += 3
        } else {
            $_ += 4
        }

        $_ += 1

        return $_
    }
}
