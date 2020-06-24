module.exports = function ({ sizeOf }) {
    sizeOf.object = function (object) {
        let $_ = 0, $i = []

        $_ += 2

        for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
            $_ += 2 +
                2 * object.array[$i[0]].length
        }

        $_ += 1

        return $_
    }
}
