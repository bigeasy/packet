module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                word: 0
            }

            if ($end - $start < 1) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.word = ($buffer[$start++])

            return { start: $start, object: object, parse: null }
        }
    }
}
