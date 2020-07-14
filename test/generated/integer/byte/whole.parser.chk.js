module.exports = function ({ parsers }) {
    parsers.chk.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    word: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.word = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
