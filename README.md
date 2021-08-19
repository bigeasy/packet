[![Actions Status](https://github.com/bigeasy/packet/workflows/Node%20CI/badge.svg)](https://github.com/bigeasy/packet/actions)
[![codecov](https://codecov.io/gh/bigeasy/packet/branch/master/graph/badge.svg)](https://codecov.io/gh/bigeasy/packet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Incremental binary parsers and serializers for Node.js.

| What          | Where                                         |
| --- | --- |
| Discussion    | https://github.com/bigeasy/packet/issues/1    |
| Documentation | https://bigeasy.github.io/packet              |
| Source        | https://github.com/bigeasy/packet             |
| Issues        | https://github.com/bigeasy/packet/issues      |
| CI            | https://travis-ci.org/bigeasy/packet          |
| Coverage:     | https://codecov.io/gh/bigeasy/packet          |
| License:      | MIT                                           |

Packet creates **pre-compiled**, **pure-JavaScript**, **binary parsers** and
**serializers** that are **incremental** through a packet definition pattern
language that is **declarative** and very **expressive**.

Packet simplifies the construction an maintenance of libraries that convert
binary to JavaScript and back. The name Packet may make you think that it is
designed solely for binary network protocols, but it is also great for reading
and writing binary file formats.

**Incremental** &mdash; Node packet creates incremental parsers and serializers
that are almost as fast as the parser you'd write by hand, but a lot easier to
define and maintain.

**Declarative** &mdash; Packet defines a binary structure using a pattern
language inspired by Perl's `pack`. The binary patterns are used to define both
parsers and serializers. If you have a protocol specification, or even just a C
header file with structures that define your binary data, you can probably
translate that directly into Packet patterns.

For parsers, you associate the patterns to callbacks invoked with captured
values when the pattern is extracted from the stream. For serializers you simply
give the values to write along with the pattern to follow when writing them.

**Expressive** &mdash; The pattern language can express

  * signed and unsigned integers,
  * endianess of singed and unsigned integers,
  * floats and doubles,
  * fixed length arrays of characters or numbers,
  * length encoded strings of characters or numbers,
  * zero terminated strings of characters or numbers,
  * said strings terminated any fixed length terminator you specify,
  * padding of said strings with any padding value you specify,
  * signed and unsigned integers extracted from bit packed integers,
  * conditions based on bit patterns,
  * character encodings,
  * custom transformations,
  * and pipelines of character encodings and custom transformations.

## Installing

Packet installs from NPM.

```text
npm install packet
```

Memento is a database that supports atomic, isolated transactions, written to a
write-ahead log and synced for durability in the event of system crash, and
merged into b-trees for fast retrieval. It reads from an in memory page cache
and evicts pages from the cache when they reach a user specified memory limit.

Memento is written in pure JavaScript.

Memento provides a contemporary `async`/`await` interface.

This `README.md` is also a unit test using the
[Proof](https://github.com/bigeasy/proof) unit test framework. We'll use the
Proof `okay` function to assert out statements in the readme. A Proof unit test
generally looks like this.

```javascript
require('proof')(4, async okay => {
    okay('always okay')
    okay(true, 'okay if true')
    okay(1, 1, 'okay if equal')
    okay({ value: 1 }, { value: 1 }, 'okay if deep strict equal')
})
```

You can run this unit test yourself to see the output from the various
code sections of the readme.

```text
git clone git@github.com:bigeasy/packet.git
cd packet
npm install --no-package-lock --no-save
node --allow-natives-syntax test/readme/readme.t.js
```

The `--allow-natives-syntax` switch allows us to test that we are creating
pcakets that have JavaScript "fast properties."

## Packet Definition Language

To test our examples below we are going to use the following function.

```javascript
const fs = require('fs')
const path = require('path')

const packetize = require('packet/packetize')
const SyncParser = require('packet/sync/parser')
const SyncSerializer = require('packet/sync/serializer')

// Generate a packet parser and serializer mechnaics module.

// Please ignore all the synchronous file operations. They are for testing
// only. You will not generate packet parsers at runtime. You will use the
// `packetizer` executable to generate your packet parser and serializer
// mechanics modules and ship them.

//
function compile (name, definition) {
    const source = packetize(definition)
    const file = path.resolve(__dirname, '..', 'readme', name + '.js')
    fs.writeFileSync(file, source)
    return file
}

// Load mechanics and run a synchronous serialize and parse.

// This looks more like production code, except for the part where you call
// our for-the-sake-of-testing runtime compile.

//
function test (name, definition, object, expected) {
    const moduleName = compile(name, definition)

    const mechanics = require(moduleName)

    const serializer = new SyncSerializer(mechanics)
    const buffer = serializer.serialize('object', object)

    okay(buffer.toJSON().data, expected, `${name} correctly serialized`)

    const parser = new SyncParser(mechanics)
    const actual = parser.parse('object', buffer)

    okay(actual, object, `${name} correctly parsed`)
}
```

### Whole Integers

Integers are specified as multiples of 8 bits. You can define an integer to be
either a JavaScript `"number"` or a JavaScript `BigInt`.

We use a count of bits as opposed to a count of bytes so that numbers remain
consistent when bit packing.

In the following defintion `value` is a 16-bit `"number"` with valid integer
values from 0 to 65,535. Serializes objects with `"number"` fields must provide
a `"number"` type value and the number must be in range. No type or range
checking is performed.

**Mnemonic**: A count of bits to serialize or parse.

```javascript
const definition = {
    object: {
        value: 16
    }
}

const object = {
    value: 0xabcd
}

test('whole-integer', definition, object, [ 0xab, 0xcd ])
```

Integers smaller than 32-bits _should_ be defined using a `"number"` to specify
the count of bits. Integers larger than 32-bits _must_ be defined as `BigInt`.

In the following definition `value` is a 64-bit `BigInt` with a valid integer
values from 0 to 18,446,744,073,709,551,616. Serializes objects with `BigInt`
fields must provide a `BigInt` type value and the number must be in range. No
type or range checking is performed.

**Mnemonic**: The `n` suffix is the same suffix used to indicate a `BigInt`
literal in JavaScript.

```javascript
const definition = {
    object: {
        value: 64n
    }
}

const object = {
    value: 0xfedcba9876543210n
}

test('whole-integer-64', definition, object, [
    0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10
])
```

### Negative Integers

Integers with negative values are generally represented as two's compliment
integers on most machines. To parse and serialize as two's complient you preceed
the bit length of an integer field with a `-` negative symbol.

In the following definition `value` is a two's compliment 16-bit integer with
valid values from -32768 to 32767. Two's compliment is a binary representation
of negative numbers.

**Mnemonic**: Negative symbol to indicate a negative value.

```javascript
const definition = {
    object: {
        value: -16
    }
}

const object = {
    value: -1
}

test('negative-integer', definition, object, [ 0xff, 0xff ])
```

As with whole integers, you _must_ define an integer larger than 32-bits as a
`BitInt`.

In the following definition `value` is a two's compliment 16-bit integer with
valid values from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807.

```javascript
const definition = {
    object: {
        value: -64n
    }
}

const object = {
    value: -1n
}

test('negative-integer-64', definition, object, [
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
])
```

### Endianness

By default, all numbers are written out big-endian, where the bytes are written
from the most significant to the least significant. The same order in which
you'd specify the value as a hexadecimal literal in JavaScript.

Little-endian means that the bytes are serialized from the least significant
byte to the most significant byte. Note that this is the order of _bytes_ and
not _bits_. This would be the case if you wrote an integer out directly to a
file from a C program on an Intel machine.

To parse and serialize an integer as little-endian you preceed the bit length of
an integer field with a `~` tilde.

In the following definition `value` is a 16-bit `number` field with valid
integer values from 0 to 65,535. A value of `0xabcd` would be serialized in
little-endian order as `[ 0xcd, 0xab ]`.

**Mnemonic**: The tilde is curvy and we're mixing things up, turning them
around, vice-versa like.

```javascript
const definition = {
    object: {
        value: ~16
    }
}

const object = {
    value: 0xabcd
}

test('little-endian', definition, object, [ 0xcd, 0xab ])
```

If you want a little-endian negative number combine both `-` and `~`. You can
combine the `-` and `~` as `-~` and `~-`.

In the following definition both `first` and `second` are 16-bit `number` fields
with valid integer values from -32768 to 32767. A value of `-0x2` would be
converted to the twos compliment representation 0xfffe and serialized in
little-endian as `[ 0xfe, 0xff ]`.

```javascript
const definition = {
    object: {
        first: ~-16,
        second: -~16
    }
}

const object = {
    first: -2,
    second: -2
}

test('little-endian-twos-compliment', definition, object, [
    0xfe, 0xff, 0xfe, 0xff
])
```

Just as with the default big-endian integer fields, little-endian integer fields
greater than 32-bits must be specified as `BigInt` fields using a `'bigint'`
literal.

```javascript
const definition = {
    object: {
        value: ~64n,
    }
}

const object = {
    value: 0xfedcba9876543210n
}

test('little-endian-64', definition, object, [
    0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe
])
```

Similarly, for little-endian signed number fields greater than 32-bits you
combine the `-` and `~` with a `BigInt` literal. You can combine the `-` and `~`
as `-~` and `~-`.

```javascript
const definition = {
    object: {
        first: ~-64n,
        second: -~64n
    }
}

const object = {
    first: -2n,
    second: -2n
}

test('little-endian-twos-compliment-64', definition, object, [
    0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, // first
    0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff  // second
])
```

### Nested Structures

You can nest structures arbitrarily. The nesting of structures does not effect
the serialization or parsing, it will still be a series bytes in the stream, but
it may help the structure your programs group values in a meaniful way.

```javascript
const definition = {
    object: {
        header: {
            type: 8,
            length: 16
        },
        options: {
            encrypted: 8,
            checksum: 32
        }
    }
}

const object = {
    header: {
        type: 1,
        length: 64
    },
    options: {
        encrypted: 0,
        checksum: 0xaaaaaaaa
    }
}

test('nested-structures', definition, object, [
    0x01,                   // header.type
    0x00, 0x40,             // header.length
    0x00,                   // options.encrypted
    0xaa, 0xaa, 0xaa, 0xaa  // options.checksum
])
```

### Packed Integers

Packed integers are expressed as nested structures grouped in an `Array`
followed by an integer definition of the packed integer size. The byte lengths
in the packed integer must sum to the size of the packed integer.

Packed integer fields are always big-endian and cannot be made little endian.
Packed integer fields can be made two's compliment by preceeding the field bit
length with a `-` negative symbol just like whole integers.

A packed 32-bit integer with a single two's compliment (potentially negative)
value named `volume`.

The bit length values of the packed values sum to 32. Note that we consider
`volume` to be 10 bits and not -10 bits in this summation of packed field
values. The `-` is used to indicate a two's compliment integer field.

```javascript
const definition = {
    object: {
        header: [{
            type: 7,
            encrypted: 1,
            volume: -10,
            length: 14
        }, 32 ]
    }
}

const object = {
    header: {
        type: 3,
        encrypted: 1,
        volume: -1,
        length: 1024
    }
}

test('packed-integer', definition, object, [
    0x7,    // type and encrypted packed into ne byte
    0xff,   // eight bytes of volume
    0xc4,   // two types of volume and top of length
    0x0     // rest of length
])
```

The packed integer will be serialized as big-endian by default. You can specify
that the packed integer is serialized as little-endian by proceeding the bit
length with a `~` tilde.

```javascript
const definition = {
    object: {
        header: [{
            type: 7,
            encrypted: 1,
            volume: -10,
            length: 14
        }, ~32 ]
    }
}

const object = {
    header: {
        type: 3,
        encrypted: 1,
        volume: -1,
        length: 1024
    }
}

test('packed-integer-little-endian', definition, object, [
    0x0,    // rest of length
    0xc4,   // two types of volume and top of length
    0xff,   // eight bytes of volume
    0x7     // type and encrypted packed into ne byte
])
```

### Literals

Literals are bytes written on serialization that are constant and not based on a
value in the serialized structure.

You define a constant with an array that contains a `String` that describes the
constant value in hexadecimal digits. There should be two hexadecimal digits for
every byte. The length of the field is determined by the number of bytes
necessary to hold the value.

**Mnemonic**: A string literal reminds us this is literal and stands out because
it is not numeric. Hexadecimal helps distinguish these constant values from
field sizes and other aspects of the definition language expressed with numbers.

```javascript
const definition = {
    object: {
        constant: [ 'fc' ],
        value: 16
    }
}

const object = {
    value: 0xabcd
}

test('constant', definition, object, [
    0xfc, 0xab, 0xcd
])
```

Generated parsers skip the constant bytes and do not validate the parsed value.
If you want to perform validation you can define the field as an integer field
and inspect the parsed field value. This means you will also have to
consistently set the serialized field value on your own.

A literal is ignored on serialization if it exists. It is not set in the
generated structure on parsing. In our example the `contsant` property of the
object is not generated on parse.

**TODO** How about an explicit example that doesn't require as much exposition
as our `test` definition.

Not much point in naming a literal, is there? The literal it will not be read
from the serialized object nor will the named literal property be set in a
parsed parsed object. What if you have multiple literals? Now you have to have
`constant1` and `constant2`. It starts to look ugly as follows.

```javascript
const definition = {
    object: {
        constant1: [ 'fc' ],
        key: 16,
        constant2: [ 'ab' ],
        value: 16
    }
}

const object = {
    key: 1,
    value: 0xabcd
}

test('constants', definition, object, [
    0xfc, 0x0, 01,
    0xab, 0xab, 0xcd
])
```

You can forgo naming a literal by defining it as padding before or after a
field.

To prepend a literal to a field definition in an array where the literal
definition is the first element and field definition is the second. The literal
will be written before writing the field value and skipped when parsing the
field value.

```javascript
const definition = {
    object: {
        key: [[ 'fc' ], 16 ],
        value: [[ 'ab' ], 16 ]
    }
}

const object = {
    key: 1,
    value: 0xabcd
}

test('unnamed-literals', definition, object, [
    0xfc, 0x0, 01,
    0xab, 0xab, 0xcd
])
```

You can specify an unnamed literal that follows a field. Enclose the field
definition in an array with the field definition as the first element and the
literal definition as the second element.

```javascript
const definition = {
    object: {
        value: [ 16, [ 'ea' ] ],
    }
}

const object = {
    value: 0xabcd
}

test('unnamed-literal-after', definition, object, [
    0xab, 0xcd, 0xea
])
```

You can specify an unnamed literal both before and after a field. Enclose the
field definition in an array and define preceding literal as the first element
and following literal as the last element.

The example above can be defined using literals around the `key` property alone.

```javascript
const definition = {
    object: {
        key: [[ 'fc' ], 16, [ 'ab' ] ],
        value: 16
    }
}

const object = {
    key: 1,
    value: 0xabcd
}

test('unnamed-literals-before-and-after', definition, object, [
    0xfc, 0x0, 01,
    0xab, 0xab, 0xcd
])
```

You can define a literal that repeats its value. The constant value is defined
using an array that contains a `String` with the literal value as the first
element and the number of times to repeat the value as the second element.

**Mnemonic**: The repeat count follows the hexadecimal definition, its relation
to the definition is expressed by its containment in an array.

```javascript
const definition = {
    object: {
        constant: [ 'beaf', 3 ],
        value: 16
    }
}

const object = { value: 0xabcd }

test('literal-repeat', definition, object, [
    0xbe, 0xaf, 0xbe, 0xaf, 0xbe, 0xaf,
    0xab, 0xcd
])
```

You can express repeated literals as unnamed literals by prepending or appending
them to a field definition.

```javascript
const definition = {
    object: {
        value: [[ 'beaf', 3 ], 16 ]
    }
}

const object = { value: 0xabcd }

test('unamed-literal-repeat', definition, object, [
    0xbe, 0xaf, 0xbe, 0xaf, 0xbe, 0xaf,
    0xab, 0xcd
])
```

Note that a literal definition without a repeat count is the same as a literal
definition with a repeate count of `1`.

```javascript
const definition = {
    object: {
        explicit: [[ 'beaf', 1 ], 16 ],
        implicit: [[ 'beaf' ], 16 ]
    }
}

const object = { explicit: 0xabcd, implicit: 0xabcd }

test('unamed-literal-repeat-once', definition, object, [
    0xbe, 0xaf, 0xab, 0xcd,
    0xbe, 0xaf, 0xab, 0xcd
])
```

Little endian serialization of literals seems like an unlikely use case. One
would imagine at a specification would specify the bytes in network byte order.
Often times filler bytes are a repeat of a single byte so endianness doesn't
matter.

If you want little-endian serialization of a literal value you could simply
reverse the bits yourself.

Here we write `0xbeaf` little-endian by explicitly flipping `0xbe` and `0xaf`.

```javascript
const definition = {
    object: {
        value: [[ 'afbe' ], 16 ]
    }
}

const object = { value: 0xabcd }

test('unamed-literal-little-endian-explicit', definition, object, [
    0xaf, 0xbe,
    0xab, 0xcd
])
```

Simple enough, however...

If specify a repeat count prepended by a `~` the pattern will be written
little-endian.

**Mnemonic**: Use use a tilde `~` because it's squiggly and we're swirling the
bytes around vice-versa. Same mnemonic for little-endian integer fields.

```javascript
const definition = {
    object: {
        value: [[ 'beaf', ~1 ], 16 ]
    }
}

const object = { value: 0xabcd }

test('unamed-literal-little-endian', definition, object, [
    0xaf, 0xbe,
    0xab, 0xcd
])
```

You can repeat the little-endian serialization more than once.

```javascript
const definition = {
    object: {
        value: [[ 'beaf', ~3 ], 16 ]
    }
}

const object = { value: 0xabcd }

test('unamed-literal-little-endian-repeat', definition, object, [
    0xaf, 0xbe, 0xaf, 0xbe, 0xaf, 0xbe,
    0xab, 0xcd
])
```

Unnamed little-endian literals can be appended or prepended. Any unnamed literal
definition can be appended, prepended or both.

### Length-Encoded Arrays

A common pattern in serialization formats is a series of repeated values
preceeded by a count of those values.

**Mnemonic**: We enclose the defintion in an array. The first element is an
integer field defintion for the length. It's scalar appearance indicates that it
does not repeat. The repeated value is enclosed in an array indicating that it
will be the value that repeats. The ordering of the scalar followed by the array
mirrors the binary representation of a length/count followed by repeated values.

```javascript
const definition = {
    object: {
        array: [ 16, [ 8 ] ]
    }
}

const object = {
    array: [ 0xaa, 0xbb, 0xcc, 0xdd ]
}

test('length-encoded', definition, object, [
    0x0, 0x4, 0xaa, 0xbb, 0xcc, 0xdd
])
```

The repeated value can be of any type including structures.

```javascript
const definition = {
    object: {
        array: [ 16, [{ key: 16, value: 16 }] ]
    }
}

const object = {
    array: [{ key: 0xaa, value: 0xbb }, { key: 0xcc, value: 0xdd }]
}

test('length-encoded-structures', definition, object, [
    0x0, 0x2,               // length encoding
    0x0, 0xaa, 0x0, 0xbb,   // first structure
    0x0, 0xcc, 0x0, 0xdd    // second structure
])
```

You can even nest length-encoded arrays inside length-encoded arrays.

```javascript
const definition = {
    object: {
        array: [ 16, [[ 16, [ 8 ]]] ]
    }
}

const object = {
    array: [[ 0xaa, 0xbb ], [ 0xcc, 0xdd ]]
}

test('length-encoded-nested', definition, object, [
    0x0, 0x2,               // length encoding
    0x0, 0x2, 0xaa, 0xbb,   // first array length encoding and values
    0x0, 0x2, 0xcc, 0xdd    // second array length encoding and values
])
```

Because pure binary data is a special case, instead of an array of `8` bit
bites, you can specify a length encoded binary data as a `Buffer`.

```javascript
const definition = {
    object: {
        array: [ 16, [ Buffer ] ]
    }
}

const object = {
    array: Buffer.from([ 0xaa, 0xbb, 0xcc, 0xdd ])
}

test('length-encoded-buffer', definition, object, [
    0x0, 0x4, 0xaa, 0xbb, 0xcc, 0xdd
])
```

### Fixed Length Arrays

**TODO**: Need first draft.

Fixed length arrays are arrays of a fixed length. They are specified by an array
containing the numeric length of the array.

```javascript
const definition = {
    packet: {
        fixed: [[ 32 ], [ 8 ]]
    }
}
```

Calculated length arrays are arrays where the length is determined by a function
which can read a value from...

```javascript
const definition = 1 || {
    packet: {
        header: {
            length: 16,
            type: 16
        },
        fixed: [[ $.header.length ], [ 8 ]]
    }
}
```

## Concerns and Decisions

I'm returning to document this after a long haitus. Here are questions that I'm
pretty sure have answers that I've forgotten.

 * Did we support packed `BigInt` integers?
