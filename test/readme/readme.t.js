// [![Actions Status](https://github.com/bigeasy/packet/workflows/Node%20CI/badge.svg)](https://github.com/bigeasy/packet/actions)
// [![codecov](https://codecov.io/gh/bigeasy/packet/branch/master/graph/badge.svg)](https://codecov.io/gh/bigeasy/packet)
// [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
//
// Incremental binary parsers and serializers for Node.js.
//
// | What          | Where                                         |
// | --- | --- |
// | Discussion    | https://github.com/bigeasy/packet/issues/1    |
// | Documentation | https://bigeasy.github.io/packet              |
// | Source        | https://github.com/bigeasy/packet             |
// | Issues        | https://github.com/bigeasy/packet/issues      |
// | CI            | https://travis-ci.org/bigeasy/packet          |
// | Coverage:     | https://codecov.io/gh/bigeasy/packet          |
// | License:      | MIT                                           |
//
// Packet creates **pre-compiled**, **pure-JavaScript**, **binary parsers** and
// **serializers** that are **incremental** through a packet definition pattern
// language that is **declarative** and very **expressive**.
//
// Packet simplifies the construction an maintenance of libraries that convert
// binary to JavaScript and back. The name Packet may make you think that it is
// designed solely for binary network protocols, but it is also great for reading
// and writing binary file formats.
//
// **Incremental** &mdash; Node packet creates incremental parsers and serializers
// that are almost as fast as the parser you'd write by hand, but a easier to
// define and maintain.
//
// **Declarative** &mdash; Packet defines a binary structure using a syntax-bashed
// JavaScript definition langauge. A single definition is used to define both
// parsers and serializers. If you have a protocol specification, or even just a C
// header file with structures that define your binary data, you can probably
// translate that directly into a Packet definition.
//
// **Expressive** &mdash; The pattern language can express
//
//   * signed and unsigned integers,
//   * endianess of singed and unsigned integers,
//   * floats and doubles,
//   * fixed length arrays of characters or numbers,
//   * length encoded strings of characters or numbers,
//   * zero terminated strings of characters or numbers,
//   * said strings terminated any fixed length terminator you specify,
//   * padding of said strings with any padding value you specify,
//   * signed and unsigned integers extracted from bit packed integers,
//   * string to integer value mappings,
//   * if/then/else conditionals,
//   * switch conditions,
//   * character encodings,
//   * custom transformations,
//   * assertions,
//   * and pipelines of custom transformations and assertions.
//
// Packet installs from NPM.

// ## Living `README.md`
//
// This `README.md` is also a unit test using the
// [Proof](https://github.com/bigeasy/proof) unit test framework. We'll use the
// Proof `okay` function to assert out statements in the readme. A Proof unit test
// generally looks like this.

require('proof')(115, okay => {
    // Be sure to run the unit test with the `--allow-natives-syntax` switch. The
    // `--allow-natives-syntax` switch allows us to test that when we parse we are
    // creating objects that have JavaScript "fast properties."
    //
    // ## Concerns and Decisions
    //
    // Notes to self as I'm writing the documentation. I'm returning to document this
    // after a long hiatus. Here are questions that I'm pretty sure have answers that
    // I've forgotten.
    //
    //  * Did we support packed `BigInt` integers?
    //
    // ## Parsers and Serializers
    //
    // **TODO** Here you need your incremental and whole parser interface with a simple
    // example. Would be an over view. In the next section we get into the weeds.
    //
    // ## Packet Definition Language
    //
    // To test our examples below we are going to use the following function.

    const fs = require('fs')
    const path = require('path')

    const packetize = require('../../packetize')
    const SyncParser = require('../../sync/parser')
    const SyncSerializer = require('../../sync/serializer')

    // Generate a packet parser and serializer mechnaics module.

    // Please ignore all the synchronous file operations. They are for testing
    // only. You will not generate packet parsers at runtime. You will use the
    // `packetizer` executable to generate your packet parser and serializer
    // mechanics modules and ship them.

    //
    function compile (name, definition, options) {
        const source = packetize(definition, options)
        const file = path.resolve(__dirname, '..', 'readme', name + '.js')
        fs.writeFileSync(file, source)
        return file
    }

    // Load mechanics and run a synchronous serialize and parse.

    // This looks more like production code, except for the part where you call
    // our for-the-sake-of-testing runtime compile.

    //
    function test (name, definition, object, expected, options = {}) {
        const moduleName = compile(name, definition, options)

        const mechanics = require(moduleName)

        const serializer = new SyncSerializer(mechanics)
        const buffer = serializer.serialize('object', object)

        okay(buffer.toJSON().data, expected, `${name} correctly serialized`)

        const parser = new SyncParser(mechanics)
        const actual = parser.parse('object', buffer)

        okay(actual, object, `${name} correctly parsed`)
    }

    // ### Whole Integers
    //
    // Integers are specified as multiples of 8 bits. You can define an integer to be
    // either a JavaScript `"number"` or a JavaScript `BigInt`.
    //
    // We use a count of bits as opposed to a count of bytes so that numbers remain
    // consistent when bit packing.
    //
    // In the following definition `value` is a 16-bit `"number"` with valid integer
    // values from 0 to 65,535. Serializes objects with `"number"` fields must provide
    // a `"number"` type value and the number must be in range. No type or range
    // checking is performed.
    //
    // **Mnemonic**: A count of bits to serialize or parse.

    const definition = {
        object: {
            value: 16
        }
    }

    const object = {
        value: 0xabcd
    }

    test('whole-integer', definition, object, [ 0xab, 0xcd ])

    // Integers smaller than 32-bits _should_ be defined using a `"number"` to specify
    // the count of bits. Integers larger than 32-bits _must_ be defined as `BigInt`.
    //
    // In the following definition `value` is a 64-bit `BigInt` with a valid integer
    // values from 0 to 18,446,744,073,709,551,616. Serializes objects with `BigInt`
    // fields must provide a `BigInt` type value and the number must be in range. No
    // type or range checking is performed.
    //
    // **Mnemonic**: The `n` suffix is the same suffix used to indicate a `BigInt`
    // literal in JavaScript.

    {
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
    }

    // ### Negative Integers
    //
    // Integers with negative values are generally represented as two's compliment
    // integers on most machines. To parse and serialize as two's compliment you
    // precede the bit length of an integer field with a `-` negative symbol.
    //
    // In the following definition `value` is a two's compliment 16-bit integer with
    // valid values from -32768 to 32767. Two's compliment is a binary representation
    // of negative numbers.
    //
    // **Mnemonic**: Negative symbol to indicate a negative value.

    {
        const definition = {
            object: {
                value: -16
            }
        }

        const object = {
            value: -1
        }

        test('negative-integer', definition, object, [ 0xff, 0xff ])
    }

    // As with whole integers, you _must_ define an integer larger than 32-bits as a
    // `BitInt`.
    //
    // In the following definition `value` is a two's compliment 16-bit integer with
    // valid values from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807.

    {
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
    }

    // ### Endianness
    //
    // By default, all numbers are written out big-endian, where the bytes are written
    // from the most significant to the least significant. The same order in which
    // you'd specify the value as a hexadecimal literal in JavaScript.
    //
    // Little-endian means that the bytes are serialized from the least significant
    // byte to the most significant byte. Note that this is the order of _bytes_ and
    // not _bits_. This would be the case if you wrote an integer out directly to a
    // file from a C program on an Intel machine.
    //
    // To parse and serialize an integer as little-endian you precede the bit length of
    // an integer field with a `~` tilde.
    //
    // In the following definition `value` is a 16-bit `number` field with valid
    // integer values from 0 to 65,535. A value of `0xabcd` would be serialized in
    // little-endian order as `[ 0xcd, 0xab ]`.
    //
    // **Mnemonic**: The tilde is curvy and we're mixing things up, turning them
    // around, vice-versa like.

    {
        const definition = {
            object: {
                value: ~16
            }
        }

        const object = {
            value: 0xabcd
        }

        test('little-endian', definition, object, [ 0xcd, 0xab ])
    }

    // If you want a little-endian negative number combine both `-` and `~`. You can
    // combine the `-` and `~` as `-~` and `~-`.
    //
    // In the following definition both `first` and `second` are 16-bit `number` fields
    // with valid integer values from -32768 to 32767. A value of `-0x2` would be
    // converted to the twos compliment representation 0xfffe and serialized in
    // little-endian as `[ 0xfe, 0xff ]`.

    {
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
    }

    // Just as with the default big-endian integer fields, little-endian integer fields
    // greater than 32-bits must be specified as `BigInt` fields using a `'bigint'`
    // literal.

    {
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
    }

    // Similarly, for little-endian signed number fields greater than 32-bits you
    // combine the `-` and `~` with a `BigInt` literal. You can combine the `-` and `~`
    // as `-~` and `~-`.

    {
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
    }

    // ### Nested Structures
    //
    // You can nest structures arbitrarily. The nesting of structures does not effect
    // the serialization or parsing, it will still be a series bytes in the stream, but
    // it may help the structure your programs group values in a meaningful way.

    {
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
    }

    // ### Packed Integers
    //
    // Packed integers are expressed as nested structures grouped in an `Array`
    // followed by an integer definition of the packed integer size. The byte lengths
    // in the packed integer must sum to the size of the packed integer.
    //
    // Packed integer fields are always big-endian and cannot be made little endian.
    // Packed integer fields can be made two's compliment by preceding the field bit
    // length with a `-` negative symbol just like whole integers.
    //
    // A packed 32-bit integer with a single two's compliment (potentially negative)
    // value named `volume`.
    //
    // The bit length values of the packed values sum to 32. Note that we consider
    // `volume` to be 10 bits and not -10 bits in this summation of packed field
    // values. The `-` is used to indicate a two's compliment integer field.

    {
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
    }

    // The packed integer will be serialized as big-endian by default. You can specify
    // that the packed integer is serialized as little-endian by proceeding the bit
    // length with a `~` tilde.

    {
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
    }

    // ### Literals
    //
    // Literals are bytes written on serialization that are constant and not based on a
    // value in the serialized structure.
    //
    // You define a constant with an array that contains a `String` that describes the
    // constant value in hexadecimal digits. There should be two hexadecimal digits for
    // every byte. The length of the field is determined by the number of bytes
    // necessary to hold the value.
    //
    // **Mnemonic**: A string literal reminds us this is literal and stands out because
    // it is not numeric. Hexadecimal helps distinguish these constant values from
    // field sizes and other aspects of the definition language expressed with numbers.

    {
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
    }

    // Generated parsers skip the constant bytes and do not validate the parsed value.
    // If you want to perform validation you can define the field as an integer field
    // and inspect the parsed field value. This means you will also have to
    // consistently set the serialized field value on your own.
    //
    // A literal is ignored on serialization if it exists. It is not set in the
    // generated structure on parsing. In our example the `contsant` property of the
    // object is not generated on parse.
    //
    // **TODO** How about an explicit example that doesn't require as much exposition
    // as our `test` definition.
    //
    // Not much point in naming a literal, is there? The literal it will not be read
    // from the serialized object nor will the named literal property be set in a
    // parsed parsed object. What if you have multiple literals? Now you have to have
    // `constant1` and `constant2`. It starts to look ugly as follows.

    {
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
    }

    // You can forgo naming a literal by defining it as padding before or after a
    // field.
    //
    // To prepend a literal to a field definition in an array where the literal
    // definition is the first element and field definition is the second. The literal
    // will be written before writing the field value and skipped when parsing the
    // field value.

    {
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
    }

    // You can specify an unnamed literal that follows a field. Enclose the field
    // definition in an array with the field definition as the first element and the
    // literal definition as the second element.

    {
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
    }

    // You can specify an unnamed literal both before and after a field. Enclose the
    // field definition in an array and define preceding literal as the first element
    // and following literal as the last element.
    //
    // The example above can be defined using literals around the `key` property alone.

    {
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
    }

    // You can define a literal that repeats its value. The constant value is defined
    // using an array that contains a `String` with the literal value as the first
    // element and the number of times to repeat the value as the second element.
    //
    // **Mnemonic**: The repeat count follows the hexadecimal definition, its relation
    // to the definition is expressed by its containment in an array.

    {
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
    }

    // You can express repeated literals as unnamed literals by prepending or appending
    // them to a field definition.

    {
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
    }

    // Note that a literal definition without a repeat count is the same as a literal
    // definition with a repeat count of `1`.

    {
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
    }

    // Little endian serialization of literals seems like an unlikely use case. One
    // would imagine at a specification would specify the bytes in network byte order.
    // Often times filler bytes are a repeat of a single byte so endianness doesn't
    // matter.
    //
    // If you want little-endian serialization of a literal value you could simply
    // reverse the bits yourself.
    //
    // Here we write `0xbeaf` little-endian by explicitly flipping `0xbe` and `0xaf`.

    {
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
    }

    // Simple enough, however...
    //
    // If specify a repeat count prepended by a `~` the pattern will be written
    // little-endian.
    //
    // **Mnemonic**: Use use a tilde `~` because it's squiggly and we're swirling the
    // bytes around vice-versa. Same mnemonic for little-endian integer fields.

    {
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
    }

    // You can repeat the little-endian serialization more than once.

    {
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
    }

    // Unnamed little-endian literals can be appended or prepended. Any unnamed literal
    // definition can be appended, prepended or both.
    //
    // ### Length-Encoded Arrays
    //
    // A common pattern in serialization formats is a series of repeated values
    // preceded by a count of those values.
    //
    // **Mnemonic**: We enclose the definition in an array. The first element is an
    // integer field definition for the length. It's scalar appearance indicates that
    // it does not repeat. The repeated value is enclosed in an array indicating that
    // it will be the value that repeats. The ordering of the scalar followed by the
    // array mirrors the binary representation of a length/count followed by repeated
    // values.

    {
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
    }

    // The repeated value can be of any type including structures.

    {
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
    }

    // You can even nest length-encoded arrays inside length-encoded arrays.

    {
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
    }

    // Because pure binary data is a special case, instead of an array of `8` bit
    // bites, you can specify a length encoded binary data as a `Buffer`.

    {
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
    }

    // ### Inline Transforms and Assertions
    //
    // Inline transforms are specified by wrapping a field definition in an array with
    // a pre-serialization function before or a post-parsing function after it or both.
    // The pre-serialization function and post-parsing function must be enclosed in an
    // array.
    //
    // A pre-serialization transformation function takes the value from the JavaScript
    // object and returns the transformed that is then written to the stream. The
    // post-parsing transformation function takes a value extracted from the stream and
    // returns the transformed value that is assigned to the JavaScript object.
    //
    // The following transform will convert a hexadecimal string to an integer on
    // serialization and back to a hexadecimal string on parse.
    //
    // **Mnemonic**: A function is obviously a function, it does something to in the
    // midst of parsing. We used functions elsewhere in the language, so we enclose
    // them in arrays, The array brackets act as parenthesis, these are parenthetical
    // user actions on the stream.

    {
        const definition = {
            object: {
                value: [[ $_ => parseInt($_, 16) ], 32, [ $_ => $_.toString(16) ]]
            }
        }

        const object = {
            value: '89abcdef'
        }

        test('transform-basic', definition, object, [
            0x89, 0xab, 0xcd, 0xef
        ])
    }

    // Whoa, what's with the parameter names pal? `$_` violates everything I was ever
    // taught about naming variables. How would you even pronounce that?
    //
    // Well, my first real language was Perl, where this variable is called "dollar
    // under." It is the default variable for an array value when you loop through an
    // array with `foreach`. I miss those days, so I thought I revive them. You can
    // name positional arguments anything you like, but I'll be using these names to
    // get you used to them, because they're available as named arguments as well.
    //
    // You can also use named arguments via object deconstruction. When you do, you
    // must specify names that are in the current namespace. The namespace will contain
    // the object properties in the current path.

    {
        const definition = {
            object: {
                value: [[ ({ value }) => parseInt(value, 16) ], 32, [ ({ value }) => value.toString(16) ]]
            }
        }

        const object = {
            value: '89abcdef'
        }

        test('transform-by-name', definition, object, [
            0x89, 0xab, 0xcd, 0xef
        ])
    }

    // You can also refer to the current variable using the Perl-esque "dollar under"
    // variable. Perl-esque variables can make your code more concise. If used
    // consistently it will still be human readable.

    {
        const definition = {
            object: {
                value: [[ ({ $_ }) => parseInt($_, 16) ], 32, [ ({ $_ }) => $_.toString(16) ]]
            }
        }

        const object = {
            value: '89abcdef'
        }

        test('transform-dollar-under', definition, object, [
            0x89, 0xab, 0xcd, 0xef
        ])
    }

    // There are two Perl-esque variable names `$_` for the immediate property value,
    // and `$` for the root object. Any other system provided names such as `$i`,
    // `$buffer`, `$start` and `$end` will begin with a `$` do distinguish them from
    // user specified names and to avoid namespace collisions.
    //
    // **Mnemonic**: Borrowed from Perl `foreach` loop, `$_` is the immediate property
    // value, useful for its brevity. `$` is the root variable, the shortest special
    // variable because if you're starting from the root, you have a path ahead of you.
    //
    // A transform or assertion is always defined with an array with three elements. If
    // you only want to define a pre-serialization action, the last element will be an
    // empty array. If you only want to define a post-parsing action, the first element
    // will be an empty array.
    //
    // In the following example we do not want to perform a post-parsing action, so we
    // leave the post-parsing array empty, but we do not neglect to add it.

    {
        const definition = {
            object: {
                value: [[ $_ => typeof $_ == 'string' ? parseInt($_, 16) : $_ ], 32, []]
            }
        }

        const moduleName = compile('transform-pre-only', definition)
        const mechanics = require(moduleName)

        {
            const buffer = new SyncSerializer(mechanics).serialize('object', { value: '89abcdef' })
            const object = new SyncParser(mechanics).parse('object', buffer)
            okay(object, { value: 0x89abcdef }, 'transform-pre-only-convert')
        }

        {
            const buffer = new SyncSerializer(mechanics).serialize('object', { value: 0x89abcdef })
            const object = new SyncParser(mechanics).parse('object', buffer)
            okay(object, { value: 0x89abcdef }, 'transform-pre-only-no-convert')
        }
    }

    // Named arguments have limitations. We're using a simple regex based parser to
    // extract the arguments from the function source, not a complete JavaScript
    // parser. We are able to parse object destructuring, array destructuring, and
    // default argument values of numbers, single quoted strings and double quoted
    // strings.
    //
    // Do not use regular expressions, interpolated strings or function calls, in your
    // default argument assignments. You can use any valid JavaScript in your function
    // bodies.
    //
    // In the following definition we've added an unused named variable that is default
    // assigned a value extracted from a literal string by a regular expression. The
    // right curly brace in the literal string won't confuse our simple argument
    // parser, but the right curly brace in the regular expression will.

    {
        const definition = {
            object: {
                value: [[
                    ({ $_, packet: { extra = /^([}])/.exec("}")[1] } }) => parseInt($_, 16)
                ], 32, [
                    ({ $_ }) => $_.toString(16)
                ]]
            }
        }

        const _definition = {
            object: {
                value: [[ $_ => typeof $_ == 'string' ? parseInt($_, 16) : $_ ], 32, []]
            }
        }

        try {
            packetize(definition)
        } catch (error) {
            okay(error instanceof SyntaxError, 'unable to parse regex')
        }
    }

    // As you can see it's an unlikely use case. Basically, if you find yourself
    // writing logic in your named arguments, stop and place it in a function in a
    // module and invoke that module function from the inline function.
    //
    // We'll continue to use `$_` and `$` in positional argument examples so we can all
    // get used to them.
    //
    // The first argument to a transformation function with positional arguments is the
    // transformed value, the second argument is the root object being transformed.
    //
    // The following WebSockets inspired example xors a value with a `mask` property in
    // the packet.

    {
        const definition = {
            object: {
                mask: 16,
                value: [[ ($_, $) => $_ ^ $.mask ], 16, [ ($_, $) => $_ ^ $.mask ]]
            }
        }

        const object = {
            mask: 0xaaaa,
            value: 0xabcd
        }

        test('transform-mask-positional', definition, object, [
            0xaa, 0xaa, 0x1, 0x67
        ])
    }

    // This can be expressed using named arguments. Note how we can order the arguments
    // any way we like.

    {
        const definition = {
            object: {
                mask: 16,
                value: [[ ({ $, $_ }) => $_ ^ $.mask ], 16, [ ({ $_, $ }) => $_ ^ $.mask ]]
            }
        }

        const object = {
            mask: 0xaaaa,
            value: 0xabcd
        }

        test('transform-mask-named', definition, object, [
            0xaa, 0xaa, 0x1, 0x67
        ])
    }

    // You can also name the names of the object properties in the current path. Again,
    // note that the order of names does not matter with named arguments.

    {
        const definition = {
            object: {
                mask: 16,
                value: [[
                    ({ object, value }) => value ^ object.mask
                ], 16, [
                    ({ value, object }) => value ^ object.mask
                ]]
            }
        }

        const object = {
            mask: 0xaaaa,
            value: 0xabcd
        }

        test('transform-mask-long-named', definition, object, [
            0xaa, 0xaa, 0x1, 0x67
        ])
    }

    // (Not to self: Seems like it might also be useful to be able to reference the
    // current object in a loop, which could be `$0` for the current object, `$1` for a
    // parent. This would be simpler than passing in the indices, but that would be
    // simple enough, just give them the already existing `$i`. Heh, no make them
    // suffer.)
    //
    // The third argument passed to a transformation function is an array of indices
    // indicating the index of each array in the path to the object. **TODO** Move
    // fixed arrays above.

    {
        const definition = {
            object: {
                array: [ 16, [{
                    mask: 16,
                    value: [[
                        ($_, $, $i) => $_ ^ $.array[$i[0]].mask
                    ], 16, [
                        ($_, $, $i) => $_ ^ $.array[$i[0]].mask
                    ]]
                }]]
            }
        }

        const object = {
            array: [{
                mask: 0xaaaa, value: 0xabcd
            }, {
                mask: 0xffff, value: 0x1234
            }]
        }

        test('transform-mask-array-positional', definition, object, [
            0x0, 0x2,                   // length encoded count of elements
            0xaa, 0xaa, 0x1, 0x67,      // first element
            0xff, 0xff, 0xed, 0xcb      // second element
        ])
    }

    // We can use named arguments as well.

    {
        const definition = {
            object: {
                array: [ 16, [{
                    mask: 16,
                    value: [[
                        ({ $_, $, $i }) => $_ ^ $.array[$i[0]].mask
                    ], 16, [
                        ({ $_, $, $i }) => $_ ^ $.array[$i[0]].mask
                    ]]
                }]]
            }
        }

        const object = {
            array: [{
                mask: 0xaaaa, value: 0xabcd
            }, {
                mask: 0xffff, value: 0x1234
            }]
        }

        test('transform-mask-array-named', definition, object, [
            0x0, 0x2,                   // length encoded count of elements
            0xaa, 0xaa, 0x1, 0x67,      // first element
            0xff, 0xff, 0xed, 0xcb      // second element
        ])
    }

    // We can also use the names of the object properties in the current path. The `$i`
    // array variable of is a special system property and it therefore retains its
    // dollar sign prepended name.

    {
        const definition = {
            object: {
                array: [ 16, [{
                    mask: 16,
                    value: [[
                        ({ value, object, $i }) => value ^ object.array[$i[0]].mask
                    ], 16, [
                        ({ value, object, $i }) => value ^ object.array[$i[0]].mask
                    ]]
                }]]
            }
        }

        const object = {
            array: [{
                mask: 0xaaaa, value: 0xabcd
            }, {
                mask: 0xffff, value: 0x1234
            }]
        }

        test('transform-mask-array-full-named', definition, object, [
            0x0, 0x2,                   // length encoded count of elements
            0xaa, 0xaa, 0x1, 0x67,      // first element
            0xff, 0xff, 0xed, 0xcb      // second element
        ])
    }

    // If your pre-serialization function and post-parsing function are the same you
    // can specify it once and use it for both serialization and parsing by surrounding
    // it with an additional array.

    {
        const definition = {
            object: {
                mask: 16,
                value: [[[ ($_, $) => $_ ^ $.mask ]], 16 ]
            }
        }

        const object = {
            mask: 0xaaaa, value: 0xabcd
        }

        test('transform-mask-same', definition, object, [
            0xaa, 0xaa, 0x1, 0x67
        ])
    }

    // Note that the above functions can also be defined using `function` syntax. Arrow
    // functions are generally more concise, however.

    {
        const definition = {
            object: {
                mask: 16,
                value: [[[ function ({ value, object }) {
                    return value ^ object.mask
                } ]], 16 ]
            }
        }

        const object = {
            mask: 0xaaaa, value: 0xabcd
        }

        test('transform-mask-function-syntax', definition, object, [
            0xaa, 0xaa, 0x1, 0x67
        ])
    }

    // ### Fixed Length Arrays
    //
    // Fixed length arrays are arrays of a fixed length. They are specified by an array
    // containing the numeric length of the array.
    //
    // **Mnemonic**: Like a length encoded definition the element definition is placed
    // inside an array because it is the array element. Like a length encoded
    // definition the length of the array precedes the element definition. It is the
    // length of the array enclosed in an array like C array declaration.

    {
        const definition = {
            object: {
                fixed: [[ 2 ], [ 16 ]]
            }
        }

        const object = {
            fixed: [ 0xabcd, 0xdcba ]
        }

        test('fixed', definition, object, [
            0xab, 0xcd, 0xdc, 0xba
        ])
    }

    // Calculated length arrays are fixed length arrays where the fixed length is
    // specified by function. The length is, therefore, not fixed at all. It is
    // calculated.
    //
    // In the following example we have a length encoding that is in a header and there
    // is a field between the length encoding and the array so we can't use a
    // length-encoded array definition. We use a calculated length that references the
    // header's length field.
    //
    // **Mnemonic** Same as fixed length arrays replacing the fixed length with a
    // function indicating that the function will calculate the length.

    {
        const definition = {
            object: {
                header: {
                    length: 16,
                    type: 8
                },
                array: [[ $ => $.header.length ], [ 16 ]]
            }
        }

        const object = {
            header: {
                length: 2,
                type: 1
            },
            array: [ 0xabcd, 0xdcba ]
        }

        test('fixed-calculated', definition, object, [
            0x0, 0x2,               // header.length
            0x1,                    // header.type
            0xab, 0xcd, 0xdc, 0xba
        ])
    }

    // ### Requiring Modules
    //
    // The functions in our packet parser may depend on external libraries. We can

    {
        const definition = {
            object: {
                value: [[ value => ip.toLong(value) ], 32, [ value => ip.fromLong(value) ]]
            }
        }

        const source = packetize(definition, { require: { ip: 'ip' } })

        const moduleName = path.resolve(__dirname, 'require.js')
        fs.writeFileSync(moduleName, source)

        const mechanics = require(moduleName)

        const object = { value: '127.0.0.1' }

        const buffer = new SyncSerializer(mechanics).serialize('object', object)

        okay(buffer.toJSON().data, [
            127, 0, 0, 1
        ], 'require serialized')

        const parsed = new SyncParser(mechanics).parse('object', buffer)
        okay(parsed, object, 'require parsed')
    }

    // ### Assertions
    //
    // **TODO** Needs examples of failed assertions.
    //
    // We can also perform inline assertions. You specify an assertion the same way you
    // specify a transformation. You wrap your definition in an array.
    // A pre-serialization assertion is a function within an array in the element
    // before the definition. A post-parsing assertions is a function within an array
    // in the element after the definition.
    //
    // When performing inline assertions, we are not transforming a value, we're simply
    // checking it's validity and raising an exception if a value is invalid. You could
    // use a transformation to do this, but you would end up returning the value as is.
    //
    // With an assertion function the return value is ignored. It is not used as the
    // serialization or assignment value.
    //
    // To declare an assertion function you assign a default value of `0` or `null` to
    // the immediate property argument.
    //
    // In the following definition we use a `0` default value for the immediate
    // property argument which indicates that the value and should not be used for
    // serialization for the pre-serialization function nor assignment for the
    // post-parsing function.

    {
        const definition = {
            object: {
                value: [[
                    ($_ = 0) => assert($_ < 1000, 'excedes max value')
                ], 16, [
                    ($_ = 0) => assert($_ < 1000, 'excedes max value')
                ]]
            }
        }
        const object = {
            value: 1
        }
        test('assertion', definition, object, [
            0x0, 0x1
        ], { require: { assert: 'assert' } })
    }

    // (I assume I'll implement this in this way:) The execption will propagate to the
    // API caller so that you can catch it in your code and cancel the serialization or
    // parse. (However, if I do wrap the assertion in a try/catch and rethrow it
    // somehow, then the following example is moot.
    //
    // If you where to use a transform, you would have to return the value and your
    // definition would be more verbose.

    {
        const definition = {
            object: {
                value: [[
                    $_ => {
                        assert($_ < 1000, 'excedes max value')
                        return $_
                    }
                ], 16, [
                    $_ => {
                        assert($_ < 1000, 'execdes max value')
                        return $_
                    }
                ]]
            }
        }
        const object = {
            value: 1
        }
        test('assertion-not-assertion', definition, object, [
            0x0, 0x1
        ], { require: { assert: 'assert' } })
    }

    // You can use the name function for both pre-serialization and post-parsing by
    // surrounding the function in an additional array.

    {
        const definition = {
            object: {
                value: [[[ ($_ = 0) => assert($_ < 1000, 'excedes max value') ]], 16 ]
            }
        }
        const object = {
            value: 1
        }
        test('assertion-mirrored', definition, object, [
            0x0, 0x1
        ], { require: { assert: 'assert' } })
    }

    // You can use named arguments to declare an assertion function.

    {
        const definition = {
            object: {
                value: [[[ ({ $_ = 0 }) => assert($_ < 1000, 'excedes max value') ]], 16 ]
            }
        }
        const object = {
            value: 1
        }
        test('assertion-named', definition, object, [
            0x0, 0x1
        ], { require: { assert: 'assert' } })
    }

    // ### Assertion and Transformation Arguments
    //
    // You can pass arguments to assertions and transforms. Any value in the array that
    // follows the function that is not itself a `function` is considered an argument
    // to the function. The arguments are passed in the order in which they are
    // specified preceding the immediate property value.
    //
    // In the following definition the function is followed by a `number` argument
    // which is passed as the first parameter to the function in serializer or parser.

    {
        const definition = {
            object: {
                value: [[[ (max, $_ = 0) => assert($_ < max, `value excedes ${max}`), 1024 ]], 16 ]
            }
        }
        const object = {
            value: 1
        }
        test('assertion-parameter', definition, object, [
            0x0, 0x1
        ], { require: { assert: 'assert' } })
    }

    // This is useful when defining a function that you use more than once in your
    // definition.

    {
        const max = (max, $_ = 0) => assert($_ < max, `value excedes ${max}`)

        const definition = {
            object: {
                length: [[[ max, 1024 ]], 16 ],
                type: [[[ max, 12 ]], 8 ]
            }
        }
        const object = {
            length: 256,
            type: 3
        }
        test('assertion-parameter-reuse', definition, object, [
            0x1, 0x0, 0x3
        ], { require: { assert: 'assert' } })
    }

    // When using named arguments, the argument values are assigned to the named
    // parameters preceding the first variable that is defined in the current scope.
    // That is, the first occurrence of a variable name that is either the name of a
    // property in the current path or a system name beginning with `$` dollar sign.
    //
    // In the following definition the first argument to the `max` function will be
    // assigned to the `max` named argument. The positional argument mapping stops at
    // the `$path` parameter since it is a system parameter beginning with `$` dollar
    // sign. The `'oops'` parameter of the `max` function call for the `type` property
    // will be ignored.

    {
        const max = ({ max, $path, $_ = 0 }) => assert($_ < max, `${$path.pop()} excedes ${max}`)

        const definition = {
            object: {
                length: [[[ max, 1024 ]], 16 ],
                type: [[[ max, 12, 'oops' ]], 8 ]
            }
        }
        const object = {
            length: 256,
            type: 3
        }
        test('assertion-parameter-named-reuse', definition, object, [
            0x1, 0x0, 0x3
        ], { require: { assert: 'assert' } })
    }

    // ### Terminated Arrays
    //
    // In the following example, we terminate the array when we encounter a `0` value.
    // The `0` is not included in the array result.

    {
        const definition = {
            object: {
                array: [[ 8 ], 0x0 ]
            }
        }
        const object = {
            array: [ 0xab, 0xcd ]
        }
        test('terminated', definition, object, [
            0xab, 0xcd, 0x0
        ])
    }

    // #### Multi-byte Terminators
    //
    // You can specify multi-byte terminators by specifying the multi-byte terminator
    // byte by byte in the end of the definition array.
    //
    // In the following example, we terminate the array when we encounter a `0xa` value
    // followed by a `0xd` value, carriage return followed by line feed.
    //
    // The `0` is not included in the array result.

    {
        const definition = {
            object: {
                array: [[ 8 ], 0xd, 0xa ]
            }
        }
        const object = {
            array: [ 0xab, 0xcd ]
        }
        test('terminated-multibyte', definition, object, [
            0xab, 0xcd, 0xd, 0xa
        ])
    }

    // ### String Value Maps
    //
    // **TODO**: Need first draft.

    {
        const definition = {
            object: {
                header: [{ type: [ 8, [ 'off', 'on' ] ] }, 8 ]
            }
        }
        const object = {
            header: {
                type: 'on'
            }
        }
        test('string-value-map', definition, object, [
            0x1
        ])
    }

    // ### Floating Point Values
    //
    // Packet supports serializing and parsing IEEE754 floating point numbers. This is
    // the respsentation common to C.
    //
    // A floating point number is is specified by specifying the value as a floating
    // the point number as `number` with the bit size repeated in the decimal digits of
    // the number.
    //
    // **TODO** Values of `1.1` and `-1.5` are not serializing and restoring correctly.
    // I can't remember if this is expected.

    {
        const definition = {
            object: {
                doubled: 64.64,
                float: 32.32
            }
        }
        const object = {
            doubled: 1.2,
            float: -1.5
        }
        test('float', definition, object, [
            0x3f, 0xf3, 0x33, 0x33,
            0x33, 0x33, 0x33, 0x33,
            0xbf, 0xc0, 0x0, 0x0
        ])
    }

    // There are only two sizes of floating point number available, 64-bit and 32-bit.
    // These are based on the IEEE 754 standard. As of 2008, the standard defines a
    // [128-bit quad precision floating
    // point](https://en.wikipedia.org/wiki/Quadruple-precision_floating-point_format)
    // but the JavaScript `number` is itself a 64-bit IEEE 754 double-precision float,
    // so we'd have to introduce one of the big decimal libraries from NPM to support
    // it, so it's probably best you sort out a solution for your application using
    // inline functions, maybe serializing to a byte array or `BigInt`. If you
    // encounter at 128-bit number in the wild, I'd be curious. Please let me know.
    //
    // ### Conditionals
    //
    // **TODO**: Need first draft.
    //
    // Basic conditionals are expressed as an array of boolean functions paired with
    // field definitions. The functions and definitions repeat creating an if/else if
    // conditional. The array can end with a feild definition that acts as the `else`
    // condition.
    //
    // If the function has positional arguments, the function is called with the root
    // object, followed by an array of indices into any arrays the current path,
    // followed by an array of names of the properties in the current path.
    //
    // In the following definition the bit size of value is 8 bits of the `type`
    // property is `1`, 16 bits if the type property is `2`, 24 bits if the `type`
    // property `3` and `32` bits for any other value of `type`.

    {
        const definition = {
            object: {
                type: 8,
                value: [
                    $ => $.type == 1, 8,
                    $ => $.type == 2, 16,
                    $ => $.type == 3, 24,
                    true, 32
                ]
            }
        }
        const object = {
            type: 2,
            value: 1
        }
        test('conditional', definition, object, [
            0x2,
            0x0, 0x1
        ])
    }

    // You can use conditionals in bit-packed integers as well.

    {
        const definition = {
            object: {
                header: [{
                    type: 4,
                    value: [
                        $ => $.header.type == 1, 28,
                        $ => $.header.type == 2, [{ first: 4, second: 24 }, 28 ],
                        $ => $.header.type == 3, [{ first: 14, second: 14 }, 28 ],
                        true, [[ 24, 'ffffff' ], 4 ]
                    ]
                }, 32 ]
            }
        }
        const object = {
            header: {
                type: 2,
                value: { first: 0xf, second: 0x1 }
            }
        }
        test('conditional-packed', definition, object, [
            0x2f, 0x0, 0x0, 0x1
        ])
    }

    // ### Switch Conditionals
    //
    // **TODO**: Need first draft. Also, example is wrong.

    {
        const definition = {
            object: {
                type: 8,
                value: [
                    ($) => $.type, [
                        { $_: 1 },          8,
                        { $_: [ 2, 3 ] },   16,
                        { $_: [] },         32
                    ]
                ]
            }
        }
        const object = {
            type: 2,
            value: 1
        }
        test('switch', definition, object, [
            0x2, 0x0, 0x1
        ])
    }

    // ### References to Paritals
    //
    // **TODO**: First draft done.
    //
    // If you have a complicated type that requires a complicated definition that is
    // tedious to repeat, you can reference that definition by name.
    //
    // References can be used as types and can also be used as length encoding lengths
    // if they resolve to an integer type. If you create a type that is only used by
    // reference that you do not want available as a packet, prepend and underbar and
    // it will not be returned as a packet type.
    //
    // **Mnemonic**: A string name to name the referenced type.
    //
    // In the following a definition an encoded integer is defined as a partial that
    // will not be presented as a packet due to the `_` prefix to the name. It is
    // referneced by the `series` property as a type and used for the length encoding
    // of the `data` property.

    {
        const definition = {
            $encodedInteger: [
                [
                    value => value <= 0x7f, 8,
                    value => value <= 0x3fff, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                    value => value <= 0x1fffff, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                    true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
                ],
                [ 8,
                    sip => (sip & 0x80) == 0, 8,
                    true, [ 8,
                        sip => (sip & 0x80) == 0, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                        true, [ 8,
                            sip => (sip & 0x80) == 0, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                            true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
                        ]
                    ]
                ]
            ],
            object: {
                value: '$encodedInteger',
                // array: [ '$encodedInteger', [ 8 ] ] ~ I haven't done this, requires using conditionals in length encoded arrays or calculated arrays.
            }
        }
        const object = {
            value: 1,
    //        array: [ 1 ]
        }
        test('partial', definition, object, [
            0x1 // , 0x1, 0x1
        ])
    }

    // ### Checksums and Running Calcuations
    //
    // Some protocols perform checksums on the body of message. Others require tracking
    // the remaining bytes in a message based on a length property in a header and
    // making decisions about the contents of the message based on the bytes remaining.
    //
    // To perform runnign calculations like buffers and remaining bytes we can use
    // accumlators, lexically scoped object variables that can be used to store the
    // state of a running calculation.
    //
    // The following defintion creates an MD5 checksum of the body of a packet and
    // stores the result in a checksum property that follows the body of the message.

    {
        const definition = {
            object: [{ hash: () => crypto.createHash('md5') }, {
                body: [[[
                    ({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end))
                ]], {
                    number: 32,
                    data: [[ 8 ], 0x0 ]
                }],
                checksum: [[
                    ({ $_, hash }) => $_ = hash.digest()
                ], [[ 16 ], [ Buffer ]], [
                    ({ checksum = 0, hash }) => {
                        assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                    }
                ]]
            }]
        }
        const object = {
            body: {
                number: 1,
                data: [ 0x41, 0x42, 0x43 ]
            },
            checksum: Buffer.from([ 0xc9, 0xd0, 0x87, 0xbd, 0x2f, 0x8f, 0x4a, 0x33, 0xd4, 0xeb, 0x2d, 0xe4, 0x47, 0xc0, 0x40, 0x28 ])
        }
        test('checksum', definition, object, [
            0x0, 0x0, 0x0, 0x1,
            0x41, 0x42, 0x43, 0x0,
            0xc9, 0xd0, 0x87, 0xbd,
            0x2f, 0x8f, 0x4a, 0x33,
            0xd4, 0xeb, 0x2d, 0xe4,
            0x47, 0xc0, 0x40, 0x28
        ], { require: { assert: 'assert', crypto: 'crypto' } })
    }

    // Here we also introduce the concept of buffer inlines. These are inlines that
    // operate not on the serialized or parsed value, but instead on the underlying
    // buffer. In the above example the `hash.update()` inline is not called once for
    // each property in the `body`, it is called for each buffer chunk that contians the
    // binary data for the `body`.
    //
    // Unlike odinary inline functions, a buffer inline is not called prior to
    // serialization. Buffer inlines are called as late as possible to process as much
    // of the buffer continguously as possible. In the previous example, the
    // `hash.update()` inline is applied to the binary data that defines the entire
    // `body` which it encapsulates.
    //
    // We use nested structures to group.
    //
    // **TODO**: Simplier calculation example to start. Calculation is important
    // because it will allow us to talk about the difference between `sizeof`,
    // `offsetof`.
    //
    // **TODO**: Come back and implement this by finding a way to extract sizeof and
    // offset of. Punting because I don't really know what inspired this example or
    // what it is supposed to illustrate.

    {
        const definition = {
            packet: [{ counter: () => [] }, {
                header: {
                    type: 8,
                    length: [[
                        ({ $, counter }) => {
                            return counter[0] = $sizeof.packet($) - $offsetof.packet($, 'body')
                        }
                    ], 16, [
                        ({ $_, counter }) => {
                            return counter[0] = $_
                        }
                    ]]
                },
                body: [[[
                    ({ $_ = 0, $start, $end, counter }) => counter[0] -= $end - $start
                ]], {
                    value: 32,
                    string: [[ 8 ], 0x0 ],
                    variable: [
                        ({ counter }) => counter[0] == 4, 32,
                        ({ counter }) => counter[0] == 2, 16,
                        8
                    ]
                }],
            }]
        }
    }

    // ### Parameters
    //
    // **TODO**: Need first draft, or reread this and see if it is a real first draft.
    //
    // Accumulators described in the preceding section also define parameters. Any
    // accumulator declared on the top most field will create parameters to the
    // generated serializes and parsers.

    {
        const definition = {
            object: [{ counter: [ 0 ] }, [[[
                ({ $start, $end, counter }) => counter[0] += $end - $start
            ]], {
                number: 8,
                string: [ [ 8 ], 0x0 ]
            }]]
        }
        // **TODO**: API call to get counter.
    }

    // The parameters are available as both arguments that can be passed to inline
    // functions as well as generally available in the program scope. Be careful not to
    // careful not to hide any module declarations you've declared.

    {
        const definition = {
            object: [{ encoding: 'utf8' }, {
                string: [[
                    value => Buffer.from(value, encoding)
                ], [ [ Buffer ], 0x0 ], [
                    value => value.toString(encoding)
                ]]
            }]
        }
        const moduleName = compile('parameters', definition, {})
        // *TODO*: API call to encode string ascii or something.
    }
})

// You can run this unit test yourself to see the output from the various
// code sections of the readme.

// When can also use modules local to the current project using relative paths, but
// we face a problem; we're not going to ship language definition with our
// completed project, we're going to ship the generated software. Therefore,
// relative must be relative to the generated file. Your relative paths much be
// relative to the output directory... (eh, whatever. Maybe I can fix that up for
// you.)

{
    ; ({
        packet: {
            value: [[ $value => ip.toLong($value) ], 32, [ $value => ip.fromLong($value) ]]
        }
    }, {
        require: { ip: '../ip' }
    })
}

{
    const description = {
        packet: {
            type: [ 8, { 0: 'off', 1: 'on', null: 'unknown' } ]
        }
    }
}
