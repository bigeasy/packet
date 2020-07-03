module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let object = {
                word: 0
            }

            object.word =
                ($buffer[$start++]) +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x1000000

            return object
        }
    } ()
}
