module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        let $i = []

        const object = {
            array: []
        }

        $i[0] = 0
        for (;;) {
            object.array[$i[0]] =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
            $i[0]++

            if ($i[0] == 4) {
                break
            }
        }


        return object
    }
}
