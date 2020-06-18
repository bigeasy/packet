module.exports = function (sizeOf) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 1

        if (((_, $) => $.type == 0)(object.value, object)) {
            $_ += 2
        } else if (((_, $) => $.type == 1)(object.value, object)) {
            $_ += 3
        } else {
            $_ += 4
        }

        return $_
    }
}
