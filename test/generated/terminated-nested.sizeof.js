module.exports = function (sizeOf) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    sizeOf.object = function (object) {
        let $_ = 0, $i = []

        for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
            $_ += 2 * object.array[$i[0]].length + 2
        }
        $_ += 2

        return $_
    }
}
