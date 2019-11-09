module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        const object = {
            word: 0
        }

        object.word = $buffer[$start++]

        return object
    }
}
