module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $i = []

                $_ =
                    ($lookup[0].indexOf(object.header.method) << 31 & 0x80000000) >>> 0 |
                    object.header.count & 0x7fffffff

                $buffer[$start++] = $_ >>> 24 & 0xff
                $buffer[$start++] = $_ >>> 16 & 0xff
                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ & 0xff

                $buffer[$start++] = Number(object.version >> 56n & 0xffn)
                $buffer[$start++] = Number(object.version >> 48n & 0xffn)
                $buffer[$start++] = Number(object.version >> 40n & 0xffn)
                $buffer[$start++] = Number(object.version >> 32n & 0xffn)
                $buffer[$start++] = Number(object.version >> 24n & 0xffn)
                $buffer[$start++] = Number(object.version >> 16n & 0xffn)
                $buffer[$start++] = Number(object.version >> 8n & 0xffn)
                $buffer[$start++] = Number(object.version & 0xffn)

                $buffer[$start++] = object.key.length >>> 24 & 0xff
                $buffer[$start++] = object.key.length >>> 16 & 0xff
                $buffer[$start++] = object.key.length >>> 8 & 0xff
                $buffer[$start++] = object.key.length & 0xff

                object.key.copy($buffer, $start, 0, object.key.length)
                $start += object.key.length

                return { start: $start, serialize: null }
            }
        } ()
    }
}
