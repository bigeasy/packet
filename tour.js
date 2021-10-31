module.exports = {
    first: 16,
 // ^^^^^ field name
    second: 16,
 //         ^^ size in bits, must be multiple of 8
    // smallest representation wihtout packing, 8-bit byte.
    byte: 8,
    // 32-bit integer, unsigned, network byte order aka big-endian.
    integer: 32,
    // For 64-bit integers we can use `BigInt`.
    integer: 64n,
    // 32-bit integer, little-endian for parsing C structs. The tilde sigil is
    // squiggly and we're squiggling the bits around.
    littleEndian: ~32,
    // 16-bit two's compliment signed integer.
    signed: -16,
    // 16-bit two's compliment signed integer, little-endian.
    signedLittleEndian: -~16,
    // The sign and endian sigils also work for `BigInt`.
    longSignedLittleEndian: -~64n,
    // 16-bit length encoded array of 16-bit integers.
    lengthEncoded: [ 16, [ 16 ]],
    // TODO Thinking about how to do lengths that are encoded by a packed value.
    // The repeated bit will always be an array with a single something in it,
    // so that could be the disambiguation we need to use the array around a
    // function universally. Note that `eval` is available as a keyword. Note
    // that symbols are available as well.
    extractedEncoded: [ $ => $.header.length, [ 8 ] ],
    // Zero terminated array of 16-bit integers, terminator is 16-bit.
    zeroTerminated: [[ 16 ], 0x0 ],
    // **TODO** Similarly, how do you a calcuated termination? Say you actually
    // want the terminator to be a part of the value?
    calculatedTerminated: [[ 8 ], value => value[value.length - 1] == 0xa ],
    // Zero terminated array of 16-bit integers, terminator is 8-bit.
    zeroTerminatedByByte: [[ 16 ], 0x0 ],
    // Carrage-return, newline terminated array of bytes.
    crlfTerminated: [[ 8 ], 0x0d, 0x0a ],
    // Fixed with array of bytes.
    fixed: [[ 8 ], [ 16 ]],
    // Fixed with array of bytes, zero padded. (Essentially zero terminated.)
    // **TODO** Did this get implemented? Seems like it didn't.
    fixedZeroed: [[ 8 ], [ 16 ], 0x0 ],
    // Fixed with array of bytes, ASCII space padded.
    fixedSpaced: [[ 8 ], [ 16 ], 0x20 ],
    // CR-LF fillled. Wonder if such a thing exists in the wild?
    fixedCRLF: [[ 8 ], [ 16 ], 0x0d, 0x0a ],
    // Bit-packed 16-bit integer, note that bit-fields are always big-endian.
    flags: [{
        temperature: -4,     // two's compliment signed
        height: 8,
        running: 1,
        resv: 3
    }, 16 ],
    // Flattened flags. Structures and accumulators can also be flattened.
    _flags: [{
        temperature: -4,     // two's compliment signed
        height: 8,
        running: 1,
        resv: 3
    }, 16 ],
    // We can make the entire field little-endian by explicitly specifying. I
    // don't know that the packed values are supposed to be little endian, so
    // I'm not going to worry about that for now.
    flags: [{
        temperature: -4,     // two's compliment signed
        height: 8,
        running: 1,
        resv: 3,
    }, ~16 ],
    // 4-byte IEEE floating point, a C float.
    float: 32.32,
    // 4-byte IEEE little endian floating point, a C float.
    float: 32.23,
    // 8-byte IEEE floating point, a C double.
    double: 64.64,
    // 8-byte IEEE little endian floating point, a C double.
    double: 64.46,
    // Iterals are a mess now. Users may often want to check them on parsing. We
    // can have a `'literal'` type and a `padding` type and the literal would
    // produce a parsed value whereas the padding would not. So alternative to
    // the current language would be the following.
    paddedBefore: [[ '0faded', 1 ], 16, []],
    paddedAfter: [ 16, [ 'fascade' ]],
    // But what does this produce? An array of bytes? A BigInt?
    parsedLiteral: [ 'fascade', 2 ],
    // Does this produce a number?
    parsedLiteral: [ 'fascade', 1 ],
    // Also, there are ambiguities with includes. Those might be resolved by
    // saying that includes always start with '`$`' or literal bytes start with
    // `'0x'` or both.

    // Literals.
    literal: [ 'fc' ],
    // Skip 30, fill with ASCII spaces? No different from literal.
    skip: [ '20', 30 ],
    // Otherwise. Strings incidate a padding.
    literal: [ 'fc', 16 ],
    skip: [[ '20', 30 ], 16, [ '20', 3 ]],
    // Would want to import encoding and decoding functions.
    inlines: [[ value => encode(value) ], [
        [ [ 8 ], 0x0 ]
    ], [ value => decode(value) ]],
    skipAndFixup: [
        [ '00', 16 ], [
            [[ value => encode(value) ], [
                [ [ 8 ], 0x0 ]
            ], [ value => decode(value) ]]
        ]
    ],
    // I've run out of sigils, so might have to use strings. Can't pass in an
    // object unless the object wants to be a very special sort of object.
    // Usually you checksum a run of bytes, but what if the checksum is supposed
    // to skip some bytes? Hmm... We can disambiguate between references to
    // other patterns in the definition and includes easily enough and insist
    // that a package does not have the name name as a hexidecmal integer.
    /*
    // Commenting out size `crc32` is not defined.
    checksumed: {
        body: [ crc32.create, [ crc32.update, 32, [ 8 ] ], crc32.update ],
        _footer: {
            digest: crc32.digest
        }
    },
    */
    // The major difference for a checksum is that it operates on the underlying
    // buffer and not the values.
    $checksum: 'packet/crc32',
    // Always insist on a sub-object?
    // TODO We can always parse the source to deterine if we are being passed
    // an object, so that's actually well determined. If we are being passed an
    // object, we might be able to parse the destructuring well enough to know
    // which objects we need to pass in, so we don't waste time slicing buffers.
    checksumed: [{ $checksum: 'packet/crc32' }, {
        body: [[ ({ $checksum, buffer }) => checksum.update(buffer) ], {
            value: 32
        }, [ ({ $checksum, buffer }) => checksum.update(buffer) ]],
        checksum: [[ ({ $checksum }) => checksum.digest() ], 32, [ ({ $checksum }) => checksum.digest() ]]
    }],
    example: {
        checksummed: [{ $checksum: 'packet/crc32' }, {
            body: [[ ($checksum, buffer) => checksum.update(buffer), Buffer ], {
                value: 32
            }, [ ($checksum, buffer) => checksum.update(buffer), Buffer ]],
            checksum: [[ $checksum => checksum.digest() ], 32, [ $checksum => checksum.digest() ]]
        }]
    },
    // A checksum-like helper might define what it is supposed to do in a scope.
    // Oof, but then how would you get the value when it leaves scope?
    example: {
        checksummed: [[ { $checksum: 'packet/crc32' }, 'md5' ], {
            value: 32
        }],
        checksum: [[ $checksum => checksum.digest() ], 32, [ $checksum => checksum.digest() ]]
    },
    // Maybe something like this...
    // Or maybe it exists until it is overwritten?
    // And maybe something ugly like double arrays means forward and backward?
    example: {
        // This would have special definition saying apply this function to
        // everything here as a buffer comming and going.
        body: [[ { $checksum: 'packet/crc32' }, 'md5' ], {
            first: 32,
            second: 32,
            third: 32
        }],
        // Still exisits outside scope, not overwritten, so we get the digest.
        checksum: [[[ ({ $checksum }) => checksum.digest() ]], 32 ]
    },
    example: {
        // This would be more explicit. A declaration, followed by a function
        // applied coming and going.
        body: [[
            { $checksum: 'packet/crc32' }, 'md5'
        ], [[
            // And maybe `$body` to get a specific start?
            ({ $checksum, $buffer, $start, $end }) => $checksum.update($buffer, $start, $end)
        ]], {
            first: 32,
            second: 32,
            third: 32
        }],
        // Still exisits outside scope, not overwritten, so we get the digest.
        checksum: [[[ ({ $checksum }) => checksum.digest() ]], 32 ]
    },
    // What about the wierd case of interpreting something differently if there
    // is not enough space remaining in the packet? So, there is a header in
    // MySQL and worse case I'd have to be decrementing a count from the start
    // of the packet. This could be done with a counter as designed above.

    // Actually, not a weird case. Remaining space is common. You have a length
    // of the packet in the header, followed by a variable number of fields
    // based on header flags, followed by a payload. Here mnemonic is that we
    // are counting down from the header and we reuse our `bff` counting to
    // determine if we are overrunning the desired length with an array.
    remaining: [[ $ => $header.length ], 8 ],

    // Hmm... We may be able to reuse the calculated length encased in an array
    // from the calculated array. This assumes that there is no field definition
    // anywhere with a single array item, but there is and it is that constant
    // definition and now we have an ambiguity.
    calculated: [[ $ => $.header.payloadLength ], [ 8 ]],

    // That could mean that we are repeating a field definition in an array, or
    // it could be we want to assert that this fixed length field is absolutely
    // less than.
    calculated: [[ $ => $.header.payloadLength ], [ 'fc' ]],

    // Which kind of blows up our array definition anyway, doesn't it?

    // Recall that replace all the strings, resolve all the includes so they are
    // gone when we are parsing.

    mirroredConditionalLiteral: [ $ => $.flag, [ 'fc' ] ],
    calcArrayOfIncluded: [ $ => $.flag, [ 'fc' ] ],

    ambibuityResolved: [[ $ => $.flag ], [ 'fc' ] ],

    // So we can define our limit this way.
    limited: [[ $ => $.header ], {
        one: 32,
        two: [[ 8 ], 0x0 ]
    }],

    // This would remove the `_limited` from the output.
    _limited: [[ $ => $.header ], {
        one: 32,
        two: [[ 8 ], 0x0 ]
    }],

    // Literals are a killer. No other way to specify the bytes. Should
    // introduce the '`0x`' and '`$`' and require them to assert that they ought
    // to be included and it is just a character or two to resolve ambiguities.

    // Another problem is offsets.

    // Had crazy ideas on how to do this such as...

    packet: {
        flag: 8,
        length: 16,
        variable: [
            $ => $.flag == 1,    32,
            // **TODO** This should be the default, to allow the null case, to
            // leave the value null and make the type a variant, where an empty
            // array null value is specified if desired.
            true,           null
        ],
        payload: [
            [ true, [[ ({ $, $offset: { payload, variable } })  => $.length - payload ], Buffer ]],
            [ true, [[ $ => $.payload.length ], Buffer ]],
        ]
    },

    // This occurred to me. Such brilliance. Just like require we now have a way
    // of defining `let` variables we can use in our functions and we can just
    // use the variables we have. However, with an incremental parse, `$start`
    // is the start in the current buffer, not the start since the start of
    // parse so we do have to add a new variable.

    packet: {
        flag: 8,
        length: [[], 16, [ ({ $start }) => offset = $start ] ],
        variable: [
            $ => $.flag == 1,    32,
            // **TODO** This should be the default, to allow the null case, to
            // leave the value null and make the type a variant, where an empty
            // array null value is specified if desired.
            true,           null
        ],
        payload: [
            [ true, [[ ({ $, $start }) => $.length - ($start - offset) ], Buffer ]],
            [ true, [[ $ => $.payload.length ], Buffer ]],
        ]
    },

    // Which would be this...
    packet: {
        flag: 8,
        length: [[], 16, [ ({ $offset }) => variable = $offset ] ],
        variable: [ $ => $.flag == 1, 32 ],
        payload: [
        // **TODO** Do we need to put `Buffer` in an array?
            [ true, [[ ({ $, $offset }) => $.length - ($offset - offset) ], Buffer ]],
            [ true, [[ $ => $.payload.length ], Buffer ]],
        ]
    },

    // We need to descend the tree and determine if we need the `$offset`
    // tracking and we could, in fact, track it only as necessary. That is stop
    // tracking after the last function that requests it.

    // This could all be done now with an accumulator so a dirty implementation
    // is possible.

    // And now I wonder, how do you specify that you only want to accumulate in
    // one direction. Oh, I see, we use an inline around the functions and we
    // build our accumulator that way.

    // **TODO** Do accumulators fire after conditionals?

    // **TODO** Recall that you call an inline after every block when it has
    // `$start` or `$end` for the sake of checksums.
    packet: {
        flag: 8,
        length: 16,
        variable: [{ counter: [ 0 ] }, [[], {
            id: [ $ => $.flag == 1, 32 ],
            payload: [
            // **TODO** Do we need to put `Buffer` in an array?
                [ true, [[ ({ $, counter }) => $.length - $counter[0] ], Buffer ]],
                [ true, [[ $ => $.payload.length ], Buffer ]],
            ]
        }, [ ({ $start, $end, counter }) => counter[0] += $end - $start ]]]
    },

    // We did this because we really, really did not want to have functions that
    // referenced anything other than their arguments. Why was that so
    // important? Note that we only call the parse inline, not at every step of
    // the way, but only before we reference the value, right? So our
    // accumulator was already optimized for count. We can further optimize by
    // not calling it at the end if we do not use it after the end.
    packet: {
        flag: 8,
        length: 16,
        variable: [[], {
            id: [ $ => $.flag == 1, 32 ],
            payload: [
            // **TODO** Do we need to put `Buffer` in an array?
                [ true, [[ ({ $, counter }) => $.length - counter ], Buffer ]],
                [ true, [[ $ => $.payload.length ], Buffer ]],
            ]
        }, [ ({ $start, $end }) => counter += $end - $start ]]
    }
}

console.log('compiled')
