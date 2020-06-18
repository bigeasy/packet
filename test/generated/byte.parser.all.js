module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        const object = {
            word: 0
        }

        object.word = ($buffer[$start++])

        return object
    }
}
