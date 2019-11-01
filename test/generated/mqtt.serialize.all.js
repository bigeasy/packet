module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            {
                let flags
                switch (($ => $.header.type)(object)) {
                case "connect":
                    flags = 0
                    break
                case "connack":
                    flags = 0
                    break
                case "publish":
                    flags =
                         ($_.dup << 3 & 0x8) |
                         ($_.qos << 1 & 0x6) |
                         ($_.retain & 0x1)
                    break
                case "puback":
                    flags = 0
                    break
                case "pubrec":
                    flags = 0
                    break
                case "pubrel":
                    flags = 2
                    break
                case "pubcomp":
                    flags = 0
                    break
                case "subscribe":
                    flags = 2
                    break
                case "suback":
                    flags = 0
                    break
                case "unsubscribe":
                    flags = 2
                    break
                case "unsuback":
                    flags = 0
                    break
                case "pingreq":
                    flags = 0
                    break
                case "pingresp":
                    flags = 0
                    break
                case "disconnect":
                    flags = 0
                    break
                case "auth":
                    flags = 0
                    break
                }

                let value =
                     (other.indexOf[$_.type] << 4 & 0xf0) |
                     (flags & 0xf)

                $buffer[$start++] = value & 0xff
            }

            do {
                value = object.remainingLength

                let bits

                bits = (value => (value % 128) & (value > 128 ? 0x80 : 0x0))(value)
                value = (value => Math.floor(value / 128))(value)

                $buffer[$start++] = bits & 0xff

                if ((value => value == 0)(value)) {
                    break
                }

                bits = (value => (value % 128) & (value > 128 ? 0x80 : 0x0))(value)
                value = (value => Math.floor(value / 128))(value)

                $buffer[$start++] = bits & 0xff

                if ((value => value == 0)(value)) {
                    break
                }

                bits = (value => (value % 128) & (value > 128 ? 0x80 : 0x0))(value)
                value = (value => Math.floor(value / 128))(value)

                $buffer[$start++] = bits & 0xff

                if ((value => value == 0)(value)) {
                    break
                }

                bits = (value => (value % 128) & (value > 128 ? 0x80 : 0x0))(value)
                value = (value => Math.floor(value / 128))(value)

                $buffer[$start++] = bits & 0xff
            } while(false)

            return { start: $start, serialize: null }
        }
    }
}
