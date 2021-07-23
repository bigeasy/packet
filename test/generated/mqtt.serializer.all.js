module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_

                $_ =
                    $lookup[0].indexOf(object.header.type) << 4 & 0xf0

                switch (($ => $.header.type)(object)) {
                case 'publish':

                    $_ |=
                        object.header.flags.dup << 3 & 0x8 |
                        object.header.flags.qos << 1 & 0x6 |
                        object.header.flags.retain & 0x1

                    break
                }

                $buffer[$start++] = $_ & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
