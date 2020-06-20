module.exports = function (sizeOf) {
    sizeOf.object = function (object) {
        let $_ = 0

        $_ += 1

        switch (String(($ => $.type)(object))) {
        case "0":

            $_ += 1

            break

        case "1":

            $_ += 2

            break

        default:

            $_ += 3

            break
        }

        $_ += 1

        return $_
    }
}
