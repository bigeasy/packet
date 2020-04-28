module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        let $i = [], $I = []

        const object = {
            array: []
        }

        $i[0] = 0
        for (;;) {
            if (
                $buffer[$start] == 0x0 &&
                $buffer[$start + 1] == 0x0
            ) {
                $start += 2
                break
            }
            object.array[$i[0]] =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]
            $i[0]++
        }

        return object
    }
}
