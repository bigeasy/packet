module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        let $i = []

        const object = {
            array: []
        }

        $i[0] = 0
        for (;;) {
            if (
                $buffer[$start] == 0xd &&
                $buffer[$start + 1] == 0xa
            ) {
                $start += 2
                break
            }

            object.array[$i[0]] = ($buffer[$start++])
            $i[0]++

            if ($i[0] == 16) {
                break
            }
        }


        $start += (16 - $i[0]) * 1 - 2

        return object
    }
}
