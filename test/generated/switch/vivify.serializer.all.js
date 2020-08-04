module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $i = []

                $buffer[$start++] = object.type & 0xff

                switch (String(($ => $.type)(object))) {
                case "0":

                    $buffer[$start++] = object.value.value & 0xff

                    break

                case "1":

                    $buffer[$start++] = object.value.length & 0xff

                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = object.value[$i[0]] & 0xff
                    }

                    break

                case "2":

                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = object.value[$i[0]] & 0xff
                    }

                    $buffer[$start++] = 0x0

                    break

                case "3":

                    $buffer[$start++] = object.value.length & 0xff

                    object.value.copy($buffer, $start, 0, object.value.length)
                    $start += object.value.length

                    break

                case "4":

                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = object.value[$i[0]] & 0xff
                    }

                    break

                default:

                    $_ = 0
                    object.value.copy($buffer, $start)
                    $start += object.value.length
                    $_ += object.value.length

                    break
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
