Packets are defined using an object. The name of the packet is the object
property name, the definition is the object property value.

```javascript
define({
    ip: {
        header: [{
            version: 4,
            headerLength: 4
        }, 8 ],
        length: 16,
        identification: 16,
        foo: [{
            flags: 3,
            fragmentOffset: 13
        }, 16 ],
        timeToLive: 8,
        protocol: 8,
        checksum: 16,
        sourceAddress: 32,
        description: 32
    }
})
```

The above is the definition of an IP packet. The name of the packet is `ip`.

### Whole Integers

A 16-bit whole integer, valid values from 0 to 65535.

Outside of packed integers (see below) we assume that binary integers sizes are
multiples of 8 bits. There are machines from the days of yore with 18-bit words
and 9-bit bytes and the like, but 8-bits has been the standard since the 1970's.

**Mnemonic**: Number of bits, as opposed to bytes so that numbers remain
consistent when bit packing.

```
define({
    value: 16
})

serialize({ value: 0xabcd }) // => [ 0xab, 0xcd ]
```

If you define a whole integer as greter than 32-bits it will be parsed and
serialized as a `BigInt`. The parser will create a `BigInt`. You must provide a
`BigInt` value to the serializer, the serializer will not perform any
conversion.

```
define({
    value: 64
})
```

### Negative Integers

Integers with potential negative values are generally represented as two's
compliment integers on most machines. To parse and serialize as two's complient
you preceed the bit length of an integer field with a `-` negative symbol.

A two's compliment 16 bit integer, value values from -32768 to 32767. Two's
compliment is a binary representation of negative numbers.

**Mnemonic**: Negative symbol to indicate a negative value.

```javascript
define({
    value: -16
})
```

### Endianness

By default, all numbers are written out big-endian, where the bytes are written
from the most significant to the least significant. The same order in which
you'd specify the value as a hexadecimal literal in JavaScript.

Little-endian means that the bytes are serialized from the least significant
byte to the most significant byte. Note that this is the order of *bytes* and
not *bits*. This would be the case if you wrote an integer out directly to a
file from a C program on an Intel machine.

To parse and serialize an integer as little-endian you preceed the bit length of
an integer field with a `~` tilde.

**Mnemonic**: The tilde is curvy and we're mixing up the bits like that.

```javascript
define({
    value: ~16
})
```

If you want a little-endian negative number combine both `-` and `~`. The
following defines an object that has two 16-bit two's compliment little-endian
integers.

```javascript
define({
    message: {
        first: ~-16,
        second: -~16
    }
})
```

### Literals

### Nested Structures

You can nest structures arbitrarily. The structure itself is not serialized nor
parsed in any way. It is merely a way of grouping values extracted from the
binary stream.

```javascript
define({
    message: {
        header: {
            type: 8,
            length: 16
        },
        options: {
            encrypted: 8,
            checksum: 32
        }
    }
})
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
`volume` to be 11 bits and not -11 bits in this summation of packed field
values.

```javascript
define({
    message: {
        header: [{
            type: 4,
            encrypted: 1,
            volume: -11,
            length: 16
        }, 32 ],
    }
})
```

The packed integer will be serialized as big-endian by default. You can specify
that the packed integer is serialized as little-endian by proceeding the bit
length with a `~` tilde.

```javascript
define({
    message: {
        header: [{
            type: 4,
            encrypted: 1,
            volume: -11,
            length: 16
        }, ~32 ],
    }
})
```

### Inline Transforms and Assertions

Inline transforms are specified by wrapping a field definition in an array with
a pre-serialization function before or a post-parsing function after it or both.
The pre-serialization function and post-parsing function must be encosed in an
array.

A pre-serialization transformation function takes the value from the JavaScript
object and returns the transfored that is then written to the stream. The
post-parsing transformation function takes a value extracted from the stream and
returns the transformed value that is assigned to the JavaScript object.

The following transform will convert a hexidecmal string to an integer on
serialization and back to a hexidecimal string on parse.

```javascript
define({
    packet: {
        value: [[ $_ => parseInt($_, 16) ], 32, [ $_ => $_.toString(16) ]]
    }
})
```

**Mnemonic**: A function is obviously a function, it does something to in the
midst of parsing. We used functions elsewhere in the language, so we encode them
in arrays, The array backets act as parenthesis, these are parenthetical user
actions on the stream.

Whoa, what's with the parameter names pal? `$_` violates everything I was ever
taught about naming variables. How would you even pronounce that?

Well, my first real language was Perl, and good old "dollar under" is the
default variable for an array value when you loop through an array with
`foreach`. I miss those days, so I thought I revive them. No, don't cry.

You can name positional arguments anything you like, but you can also use named
arguments via object desconstruction. When you do, you must specify names that
are in the current namespace. The namespace will contain the object properties
in the current path.

```javascript
define({
    packet: {
        value: [[ ({ value }) => parseInt(value, 16) ], 32, [ ({ value }) => value.toString(16) ]]
    }
})
```

But, if that takes up too much of your screen real estate, Perl-esque shorthand
variables names are also available to use as named parameters.

```javascript
define({
    packet: {
        value: [[ ({ $_ }) => parseInt($_, 16) ], 32, [ ({ $_ }) => $_.toString(16) ]]
    }
})
```

There are two Perl-esque variable names `$_` for the immediate property value,
and <code>$</code> for the root object. Any other system provided names such as
`$i`, `$buffer`, `$start` and `$end` will begin with a `$` do distinquish them
from user specified names and to avoid namespace collisions.

The first argument to a transformation function is the transformed value, the
second argument is the root object being transformed.

The following WebSockets inspired example xors a value with a `mask` property in
the packet.

```javascript
define({
    packet: {
        mask: 32,
        value: [[ ($_, $) => $_ ^ $.mask ], 32 [ ($_, $) => value ^ $.mask ]]
    }
})
```

(Not to self: Seems like it might also be useful to be able to reference the
current object in a loop, which could be `$0` for the current object, `$1` for a
parent. This would be simplier than passing in the indicies, but that would be
simple enough, just give them the already existing `$i`. Heh, no make them
suffer.)

The third argument passed to a transformation function is an array of indicies
indicating the index of each array in the path to the object. TK Move fixed
arrays above.

```javascript
define({
    packet: {
        array: [[ 4 ], {
            mask: 32,
            value: [[
                ($_, $, $i) => $_ ^ $.array[$i[0]].mask
            ], 32 [
                ($_, $, $i) => $_ ^ $.array[$i[0]].mask
            ]]
        })
    }
})
```

If your pre-serialization function and post-parsing function are the same you
can specify it once and use it for both serialization and parsing by surrounding
it with an additional array.

```javascript
define({
    packet: {
        mask: 32,
        value: [[[ (value, $) => value ^ $.mask ]], 32 ]
    }
})
```

Note that the above functions can also be defined using `function` syntax. Arrow
functions are generally more concise, however.

```javascript
define({
    packet: {
        mask: 32,
        value: [[[ function (value, $) {
            return value ^ $.mask
        } ]], 32 ]
    }
})
```

### Requiring Modules

The functions in our packet parser may depend on external libraries. We can

```javascript
define({
    packet: {
        [[ $value => ip.toLong($value) ], 32, [ $value => ip.fromLong($value) ]]
    }
}, {
    require: { ip: 'ip' }
})
```

We can also perform inline assertions. When performing inline assertions, we are
not transforming a value, we're simply checking it's validity and raising an
exception if we

We can use parenthetical functions to perform assertions as well. When

You can also use named arguments in your transformation functions by using
object desconstruction to specify exactly which values you want to use.


See Checksums and Counting for examples where we indicate that we want to
operate on the underlying buffer instead

Assertions can also be performed by raising an `AssertionError`.

If all your function does is perform an assertion, you can forgo returning a
value by object decomposition to create named arguments. Then, if you default
the value to `null` or `0`, the generated serializer or parser will not use the
return value for serialization or assignment.

```javascript
define({
    packet: {
        value [[ ({ value = 0 })
    }
}, {
    require: { assert: 'assert' }
})
```

If you want to perform an assertion you can do so without returning a value
Transforms expect a return value and use that value for serialization or
assignment to the parsed object. You won't want to

If you want to perform an assertion and not
return a value you can

You can specify a function to be performed both before serializtion and after
parsing by surrounding the function with an additional set of parenthesis.

```
define({
    packet: {
        value [[[ value => ~value ]]], 32 ]
    }
})
```

These are more useful for running checksums and counting bytes, but since these
operations require accumuators of some sort, we'll

You are also able to apply functions to the underlying `Buffer` during parse and
serialization. See Checksums and Running Calculations.

### Importing Modules

### Fixed Length Arrays

### Length-Encoded Arrays

A length-encoded indicates a series of values

**Mnemonic**: The negative sign indicates a negative value.

### Terminated Arrays

### String Value Maps

### Floating Point Values

IEEE754

### Conditionals

### Switch Conditionals

### References

### Checksums and Running Calcuations
