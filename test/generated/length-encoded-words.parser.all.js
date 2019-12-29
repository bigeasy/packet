module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        let $i = [], $I = []

        const object = {
            array: new Array
        }

        $I[0] =
            $buffer[$start++] * 0x100 +
            $buffer[$start++]

        for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
            object.array[$i[0]] =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]
        }

        return object
    }
}
