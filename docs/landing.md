
## Binary Pattern Fields

The binary pattern language is used to specify the fields binary structures in
data streams, using a comma separated field pattern.

### Big-Endian Byte Ordering

To define a big-endian byte ordering for a field, prefix the bit size with `b`.

```yaml
mnemonic: The letter `b` stands for big-endian.
examples:
  -
    pattern: world: b16
    object:
      word: 256
    description: Big-endian 32 bit number.
  -
    pattern: byte: b8
    object:
      byte: 1
    description: Endianess of a single byte is irrelevant.
  -
    pattern: word: l16, byte: b8
    object:
      word: 1
      byte: 1
    parsed: 0x01, 0x00, 0x01
```
  

**Mnemonic**: The letter `b` stands for big-endian.

```javascript
"b16"             // Big-endian 32 bit number.
"b8"              // Endianess of a single byte is irrelevant.
"l16, b8"         // Big-endian 16 bit integer followed by a byte.
```

### Little-Endian Byte Ordering

To define a little-endian byte ordering for a field, prefix the bit size with `l`.

**Mnemonic**: The letter `l` stands for little-endian.

```javascript
"l32"             // Little-endian 32 bit integer.
"l8"              // Endianess of a single byte is irrelevant.
"l16, b8"         // Little endian 16 bit integer followed by a byte.
```

### Skipping Bytes

You can skip over bytes your pattern with `x`.

**Mnemonic**: The letter `x` means to cross-out, which is kind of like skipping.

```javascript
"b8, x16, l16"    // A byte, two skipped bytes, and a little-endian 16 bit
                  // integer.
```

### Signed Versus Unsigned Integers

All numbers are assumed to be unsigned, unless prefixed by a negative symbol.

**Mnemonic**: The `-` symbol indicates the possibility of negative numbers.

```javascript
"-b32"            // Big-endian 32 bit signed integer.
"-l32"            // Little-endian 32 bit signed integer.
"b32"             // Big-endian 32 bit unsigned integer.
```

### IEEE 754 Floating Point Numbers

The number type for JavaScript is the  64 bit IEEE 754 floating point. Packet
can read write 64 bit and 32 bit IEEE 754 floating point numbers.

To indicated that the type is a floating point number, use the `f` type suffix.
This is indicated with a `f` suffix.

**Mnemonic**: The letter `f` stands for
*floating-point*.

```javascript
"b64f"            // Big-endian 64 bit IEEE 754 double floating point number.
"l32f"            // Little-endian 32 bit IEEE 754 single floating point number.
```

The floating-point numbers can be stored in little-endian or big-endian byte order.

### Arrays of Raw Bytes

A value will be converted to a big-endian array of bytes if followed by an `a`
suffix.

**Mnemonic**: The letter `a` stands for *array*.

```javascript
"l128a"           // Unsigned little-endian 128 bit integer as big-endian array
                  // of bytes.
```

Note that big-endian means that the most significant byte is at index `0` of the
array.

This can be surprising if you're expecting the significance of the bytes will
increase with the index of the array, but then that's what little-endian is all
about. (Big-endian orders like Arabic numerals, while little-endian orders like
offsets into memory.)

If you'd prefer a little-endian array, simply call `reverse` on the array passed
to you.

### Arrays of Common Types

It is often the case that a binary format contains an array of values. The most
common case are arrays of bytes representing ASCII or UTF-8 strings.

Arrays are specified with an subscript and a count.

**Mnemonic**: The square brackets are used as array subscripts in JavaScript,
and used to declare array length in other C dialect languages.

```javascript
"b32[4]"          // An array of four big-endian 32 bit numbers.
"b8[16]"          // An array of 16 bytes.
```

The array notation produces an array of the type before the subscript.

### Zero Terminated Arrays

Zero terminated series are specified with a `z` qualifier.

You can specify both termination and width together. Why would you need this?
This occurs in underlying C structures when there is a fixed width character
array in a structure, but the structure still contains a zero terminated string.

**Upcoming**: Chose your own terminator.

**Mnemonic**: The letter `z` stands for zero.

```javascript
"l16z"            // Little-endian 16 bit numbers terminated by a zero value.
"b8z"             // Byte string terminated by zero.
"b8[12]z"         // Byte string terminated by zero in a field 12 bytes long.
```

### Array Padding

You can specify a padding value immediately after the array brackets using curly
braces. This should be the numeric value, or character code for padding. If you
want to zero pad, use `0`. If you want to pad with ASCII spaces use `32`.

**Mnemonic**: Curly braces are used to define array literals in C.

```javascript
"b16[12]{0}"      // Array of 12 big-endian 16 bit integers, zero padded.
"b8[12]{32}z"     // Byte string terminated by zero in a field 12 bytes long
                  // ascii space padded.
```
### Length Encoded Arrays

Length encoded arrays are specified by joining a count type and a value type
with a forward slash character `/`.

**Mnemonic**: Inspired by Perl's `pack`, which uses the slash to separate count
and type.

```javascript
"b8/b8"           // Length encoded byte array with a byte length.
"l16/b8"          // Length encoded byte array with 16 bit little-endian length.
```

### Bit Packed Integers

Integers are often divided into smaller integers through a process called bit
packing. Bit packing is specified by following an integer specification with
a curly brace enclosed series series of integers patterns whose total size in
bits equals the size of the packed integer.

Packed integers are always big-endian and can be either singed or unsigned.

**Mnemonic** Curly braces are used to define structures in C and bit packing is
kind of like a structure.

```javascript
"b16{b3,x6,-b7}"  // A 16 bit big-endian integer divided into a 3-bit integer,
                  // 6 skipped bits, and a signed 7-bit integer.
```

You can also name the packed fields.

```javascript
"b16{b3 => type, x6, -b7 => count}"
```

### Alternate Patterns

A common pattern in binary formats is using the value of a byte, or the high
order bits of a byte to specify the type of data to follow. [Length Encoded
Arrays](#length-encoded-arrays) are one example of this practice, where a
an integer count indicates the length of a following string or array.

With an alternate pattern, **Packet** will extract an integer from the byte
stream, then choose a pattern based on the value of that integer. The pattern is
applied at the index where the integer used to choose the pattern was extracted.
That is, the bytes used to choose the pattern are included when the pattern is
applied. It is a peek and switch.

Alternate patterns are grouped by parenthesis `(` and `)` and delimited by pipes
`|`. Each alternative maps a match to a pattern separated by a colon `:`.

**Mnemonic** &mdash; Parenthesis and pipes are used to indicate alternation in
regular expressions, while colons are used to delineate switch options in C.

```javascript
// MySQL length coded binary; if the byte is less than 252, use the byte value,
// otherwise the byte value indicates the length of the following word.
"b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)"
```

Conditions are either a value to match exactly or a range of values. **Packet**
tests each condition is tested in order. **Packet** uses the alternation of the
first condition to match the extracted integer is used. An alternate without a
condition will always match. This is used to specify a default pattern.

```javascript
// Simpiler, but will also match 255 which is invalid, which is fine if you test
// the value in your callback.
"b8(252: x8, b16 | 253: x8, b24 | 254: x8, b64 | b8)"
```

The values can be expressed in binary, decimal or hexadecimal.

### Bitwise Alternate Patterns

You can also indicate a branch based on set bits by prefixing the value with an
ampersand. **Packet** will use the value as a bit mask. If the result of a
logical *and* with the bit mask equals the bit mask, then **Packet** use use
that alternative.

**Mnemonic** The `&` performs a logical and in C and is used to check to see if
bits in a bit mask are set.

```javascript
"b8(&0x80: b16{x1,b15} | b8)"   // A 15-bit word if the first bit is set,
                                // otherwise a byte.
```

Bitwise conditions cannot be used in to choose a pattern for serialization. Upon
serialization, the field value is a JavaScript number, not an stream of bytes.
The bit flag simply does not exist.

Instead, we need to perform a range check to determine which pattern. To delimit
alternate tests for reading and writing, we use a slash in the condition.

```javascript
// A 15-bit word if the first bit is set, otherwise a byte.
"b8(&0x80/0x80-0xffff: b16{x1{1},b15} | b8)"
```

### Multi-Field Alternate Patterns

Alternate patterns can define either a single field or multiple field.
Alternate patterns can contain bit-packed patterns, but they cannot contain
still more alternate patterns.

```javascript
// Two alternate patterns with a different number of fields.
"b8(&0x80/1: b16{b1, b15}, b16|b32{b1, b31})"
```

In the above example, the serialization test would be applied to the field value
in the position of the `b1` field for either alternate.

### Named Alternate Patterns

Names can be applied either to the entire alternation if the alternation
produces a single field, or else to individual members of the alternate
patterns.

```
// A single field mapped to a name.
"b8(&0x80/0x80-0xffff: b16{x1{1},b15} | b8) => number"
```

When serializing named multi-field patterns, for each alternate, **Packet** will
use the first value of the property in the alternate for the serialization
condition. **Packet** reads the property from the object we're serializing. If
the value is not null, it is tested against the serialization condition. If it
is null, the test is skipped. We use the first alternate whose object property
is not null and whose serialization condition matches the object property.

```javascript
// Multi-field alternates mapped to names.
"b8(&0x80/1: b16{b1 => control, b15 => type}, x16|b32{b1 => control, b31 => sequence})"
```

### Transforms

Often there are transformations that you need to perform on an field to get
it to its final state. You may need to convert a byte array to string of a
particular character encoding, for example. This is done with a transformation
functions which are specified with a transformation pipeline.

If the transformation is a fixed transformation, you can perform the
transformation by defining a pipeline. A pipeline defines one or more
transformations that are invoked on the value after parsing and before
serialization. The transformations can accept scalar JavaScript parameters.

```javascript
function str(encoding, name, field, parsing, value) {
    if (parsing) {
        var buffer = new Buffer(array.length)
        for (var i = 0; i < value.length; i++) {
            buffer[i] = value[i];
        }
        var length = value.length
        if (field.terminator) {
            length += field.terminator.length;
        }
        return buffer.toString(encoding, 0, length);
    } else {
        if (field.terminator) {
            value += field.terminator;
        }
        return new Buffer(value, encoding);
    }
}
```

Now you can use the transform in your pattern.

```javascript
"b8z|str('ascii')"      // An ascii string terminated by zero.
"b8z|str('ascii'), b16" // An ascii string terminated by zero followed by a
                        // big-endian 16 bit integer.
```

The `str` transform is defined by default. The transform names are purposely
terse to fit with the brevity of the pattern language.

## Error Messages

Error messages for pattern parsing.

 * **invalid pattern at N** &mdash; The characters starting at the specified
   index is unexpected the pattern is invalid. The invalid character may not be
   at the specified index, but shortly there after, such as unmatched braces.
 * **bit field overflow at N** &mdash; The sum of the bit size of bit field
   elements is greater than the size of the containing element. The sum of the
   bit size of bit field elements must equal the size of the containing element.
 * **bit field underflow at N** &mdash; The sum of the bit size of bit field
   elements is less than the size of the containing element. The sum of the bit
   size of bit field elements must equal the size of the containing element.
 * **bit size must be non-zero at N** &mdash; Encountered element with a bit size of
   zero. Element size must be a non-zero value.
 * **bits must be divisible by 8 at N** &mdash; Encountered element with a bit
   size that is not divisible by 8. If an element is not a bit field element, it
   must align to an 8-bit boundary.
 * **floats can only be 32 or 64 bits at N** &mdash; Encountered a float element
   with an unsupported bit size. Only 32 and 64 bit floats are supported.
 * **"array length must be non-zero at N** &mdash; Encountered an array length
   of zero. Arrays must have a non-zero length.

## Change Log

Changes for each release.

### Version 0.0.6

Wed Jul  3 21:52:20 UTC 2013

 * Implement `Serializer.offsetsOf`. #87. #85. #86. #63.
 * Objects primary, positional arguments secondary. #84.
 * Reset namedness of `Parser`. #83.
 * Serialize and parsed a named length encoded array. #82.
 * Increase test coverage.  #77. #69. #68. #67. #66.
 * Test text to float conversion. #66.
 * Remove `n` syntax from README. @jryans. #64.
 * Remove detection of `n` synonym for `b`.
 * Remove asterisk to indicate wildcard condition. #33.
 * `Parser.parse` returns bytes read. #60.
 * Report coverage to Coveralls. #61.
 * Rename `pattern` to `field`. #57.
 * Massive tidy after change in enclosed objects.

### Version 0.0.5

Fri Mar  1 03:05:15 UTC 2013

 * Chunked serialization bug fixes. #59. #58. #55.
 * Move supporting libraries to root directory. #44.
 * Spell check `README.md` and remove dead features. #32. #55.
 * Implement `sizeOf` property for serializer. #37.
 * Fix minimum number value. #54.

### Version 0.0.4

Mon Nov  6 04:50:16 UTC 2012.

 * Create parsers and serializers from prototypes. #53.
 * Parse patterns with Win32 CRLF. #51. (Greg Ose <greg@nullmethod.com>)
 * Copy cached pattern for alternation rewriting. #50.
 * Flatten alternation prior to serialization. #34.
 * Add `.js` suffix to tests. #49.
 * Convert to closure style. #40, #47, #39, #38, #27.
 * Remove pausing from `Parser`. #46.
 * Implement `reset` for serializer. #43.
 * Single letter field names. #45.
 * Remove streams from API. #41.

### Version 0.0.3

Fri Aug 17 00:40:37 UTC 2012.

 * Fix Packet in NPM. #12.
 * Serialize alternate structures. #31.
 * Test serialization of words. #20.
 * Serializer not exported by `index.js`.
 * Named patterns reset buffer offset. #29.
 * Allow spaces before alternation condition. #28.
 * Create a markdown `README.md`. #18.
 * Build on Node 0.8 at Travis CI. #23.
 * Fix too greedy match of bit packing pattern. #19.
 * Skip leading whitespace in pattern. #15.
