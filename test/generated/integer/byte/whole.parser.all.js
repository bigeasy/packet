module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                word: 0
            }

            object.word = ($buffer[$start++])

            return object
        }
    } ()
}
