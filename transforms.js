// The default transforms built into Packet.
var transforms =
// Convert the value to and from the given encoding.
{ str: function (encoding, parsing, field, value) {
    var i, I, ascii = /^ascii$/i.test(encoding)
        if (parsing) {
            value = new Buffer(value)
            // Broken and waiting on [297](http://github.com/ry/node/issues/issue/297).
            // If the top bit is set, it is not ASCII, so we zero the value.
            if (ascii) {
                for (i = 0, I = value.length; i < I; i++) {
                    if (value[i] & 0x80) value[i] = 0
                }
                encoding = 'utf8'
            }
            var length = value.length
            return value.toString(encoding, 0, length)
        } else {
            var buffer = new Buffer(value, encoding)
            if (ascii) {
                for (var i = 0, I = buffer.length; i < I; i++) {
                    if (value.charAt(i) == '\u0000') buffer[i] = 0
                }
            }
            return buffer
        }
    }
// Convert to and from ASCII.
, ascii: function (parsing, field, value) {
        return transforms.str('ascii', parsing, field, value)
    }
// Convert to and from UTF-8.
, utf8: function (parsing, field, value) {
        return transforms.str('utf8', parsing, field, value)
    }
// Add padding to a value before you write it to stream.
, pad: function (character, length, parsing, field, value) {
        if (! parsing) {
            while (value.length < length) value = character + value
        }
        return value
    }
// Convert a text value from alphanumeric to integer.
, atoi: function (base, parsing, field, value) {
        return parsing ? parseInt(value, base) : value.toString(base)
    }
// Convert a text value from alphanumeric to float.
, atof: function (parsing, field, value) {
        return parsing ? parseFloat(value) : value.toString()
    }
}
