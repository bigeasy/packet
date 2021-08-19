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
//{ "name": "ignore" }
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
`foreach`. I miss those days, so I thought I revive them. No, don't cry. You can
name positional arguments anything you like, but I'll be using these names to
get you used to them, because they're available as named arguments as well.

You can also use named arguments via object desconstruction. When you do, you
must specify names that are in the current namespace. The namespace will contain
the object properties in the current path.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[ ({ value }) => parseInt(value, 16) ], 32, [ ({ value }) => value.toString(16) ]]
    }
})
```

But, if that takes up too much of your screen real estate, Perl-esque variables
names are also available to use as named arguments.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[ ({ $_ }) => parseInt($_, 16) ], 32, [ ({ $_ }) => $_.toString(16) ]]
    }
})
```

There are two Perl-esque variable names `$_` for the immediate property value,
and `$` for the root object. Any other system provided names such as `$i`,
`buffer`, `$start` and `$end` will begin with a `$` do distinguish them from
user specified names and to avoid namespace collisions.

**Mnemonic**: Borrowed from Perl `foreach` loop, `$_` is the immediate property
value, useful for its brevity. `$` is the root variable, the shortest special
variable because if you're starting from the root, you have a path ahead of you.

You must always define a pre-serialization and post-parsing set of functions.
One or the other set must have at least one function. If you do not one to
perform one or the other actions, specify an empty array. This is uncommon for
transformations, but you may only want to perform assertions

In the following we do not want to perform a post-parsing action, so we
leave the post-parsing array empty, but we do not neglect to add it.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[ $_ => typeof $_ == 'string' ? parseInt($_, 16) : $_ ], 32, []]
    }
})
```

Named arguments have limitations. We're using a simple regex based parser to
extract the arguments from the function source, not a complete JavaScript
parser. We are able to parse object destructuring, array destructuring, and
default argument values of numbers, single quoted strings and double quoted
strings.

Do not use regular expressions, interpolated strings or function calls, in your
default argument assignments.

In the following definition we've added an unused named variable that is default
assigned a value extracted from a literal string by a regular expression. The
right curly brace in the literal string won't confuse our simple argument
parser, but the right curly brace in the regular expression will.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[
            ({ $_, packet: { extra = /^([}])/.exec("}")[1] } }) => parseInt($_, 16)
        ], 32, [
            ({ $_ }) => $_.toString(16)
        ]]
    }
})
```

As you can see it's rather obscene in any case. Basically, if you find yourself
writing logic in your named arguments, stop and place it in a function in a
module and invoke that module function from the inline function.

We'll continue to use `$_` and `$` in positional argument examples so we can all
get used to them.

The first argument to a transformation function with positional arguments is the
transformed value, the second argument is the root object being transformed.

The following WebSockets inspired example xors a value with a `mask` property in
the packet.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        mask: 32,
        value: [[ ($_, $) => $_ ^ $.mask ], 32 [ ($_, $) => value ^ $.mask ]]
    }
})
```

This can be expressed using named arguments. Note how we can order the arguments
any way we like.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        mask: 32,
        value: [[ ({ $, $_ }) => $_ ^ $.mask ], 32 [ ({ $_, $ }) => value ^ $.mask ]]
    }
})
```

You can also name the names of the object properties in the current path. Again,
note that the order of names does not matter with named arguments.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        mask: 32,
        value: [[
            ({ packet, value }) => value ^ packet.mask
        ], 32 [
            ({ value, packet }) => value ^ packet.mask
        ]]
    }
})
```

(Not to self: Seems like it might also be useful to be able to reference the
current object in a loop, which could be `$0` for the current object, `$1` for a
parent. This would be simplier than passing in the indicies, but that would be
simple enough, just give them the already existing `$i`. Heh, no make them
suffer.)

The third argument passed to a transformation function is an array of indices
indicating the index of each array in the path to the object. **TODO** Move
fixed arrays above.

```javascript
//{ "name": "ignore" }
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

We can use named arguments as well.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 4 ], {
            mask: 32,
            value: [[
                ({ $_, $, $i }) => $_ ^ $.array[$i[0]].mask
            ], 32 [
                ({ $_, $, $i }) => $_ ^ $.array[$i[0]].mask
            ]]
        })
    }
})
```

We can also use the names of the object properties in the current path. The `$i`
array variable of is a special system property and it therefore retains its
dollar sign prepended name.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 4 ], {
            mask: 32,
            value: [[
                ({ value, packet, $i }) => value ^ packet.array[$i[0]].mask
            ], 32 [
                ({ value, packet, $i }) => value ^ packet.array[$i[0]].mask
            ]]
        })
    }
})
```

If your pre-serialization function and post-parsing function are the same you
can specify it once and use it for both serialization and parsing by surrounding
it with an additional array.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        mask: 32,
        value: [[[ ($_, $) => $_ ^ $.mask ]], 32 ]
    }
})
```

Note that the above functions can also be defined using `function` syntax. Arrow
functions are generally more concise, however.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        mask: 32,
        value: [[[ function ({ value, packet }) {
            return value ^ packet.mask
        } ]], 32 ]
    }
})
```

### Requiring Modules

The functions in our packet parser may depend on external libraries. We can

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[ $value => ip.toLong($value) ], 32, [ $value => ip.fromLong($value) ]]
    }
}, {
    require: { ip: 'ip' }
})
```

When can also use modules local to the current project using relative paths, but
we face a problem; we're not going to ship language definition with our
completed project, we're going to ship the generated software. Therefore,
relative must be relative to the generated file. Your relative paths much be
relative to the output directory... (eh, whatever. Maybe I can fix that up for
you.)

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[ $value => ip.toLong($value) ], 32, [ $value => ip.fromLong($value) ]]
    }
}, {
    require: { ip: '../ip' }
})
```

### Assertions

We can also perform inline assertions. You specify an assertion the same way you
specify a transformation. You wrap your definition in an array.
A pre-serialization assertion is a function within an array in the element
before the definition. A post-parsing assertions is a function within an array
in the element after the definition.

When performing inline assertions, we are not transforming a value, we're simply
checking it's validity and raising an exception if a value is invalid. You could
use a transformation to do this, but you would end up returning the value as is.

With an assertion function the return value is ignored. It is not used as the
serialization or assignment value.

To declare an assertion function you assign a default value of `0` or `null` to
the immediate property argument.

In the following definition we use a `0` default value for the immediate
property argument which indicates that the value and should not be used for
serialization for the pre-serialization function nor assignment for the
post-parsing function.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[
            ($_ = 0) => assert($_ < 1000, 'excedes max value')
        ], 16, [[
            ($_ = 0) => assert($_ < 1000, 'excedes max value')
        ]]
    }
}, {
    require: { assert: require('assert') }
})
```

(I assume I'll implement this in this way:) The execption will propagate to the
API caller so that you can catch it in your code and cancel the serialization or
parse. (However, if I do wrap the assertion in a try/catch and rethrow it
somehow, then the following example is moot.

If you where to use a transform, you would have to return the value and your
definition would be more verbose.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[
            $_ => {
                assert($_ < 1000, 'excedes max value')
                return $_
            }
        ], 16, [[
            $_ => {
                assert($_ < 1000, 'execdes max value')
                return $_
            }
        ]]
    }
}, {
    require: { assert: require('assert') }
})
```

You can use the name function for both pre-serialization and post-parsing by
surrounding the function in an additional array.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[[ ($_ = 0) => assert($_ < 1000, 'excedes max value') ]], 16 ]
    }
}, {
    require: { assert: require('assert') }
})
```

You can use named arguments to declare an assertion function.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[[ ({ $_ = 0 }) => assert($_ < 1000, 'excedes max value') ]], 16 ]
    }
}, {
    require: { assert: require('assert') }
})
```

### Assertion and Transformation Arguments

You can pass arguments to assertions and transforms. Any value in the array that
follows the function that is not itself a `function` is considered an argument
to the function. The arguments are passed in the order in which they are
specified preceding the immediate property value.

In the following definition the function is followed by a `number` argument
which is passed as the first parameter to the function in serializer or parser.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        value: [[[ (max, $_ = 0) => assert($_ < max, `value excedes ${max}`), 1024 ]], 16 ]
    }
}, {
    require: { assert: require('assert') }
})
```

This is useful when defining a function that you use more than once in your
definition.

```javascript
//{ "name": "ignore" }
const max = (max, $_ = 0) => assert($_ < max, `value excedes ${max}`)

define({
    packet: {
        length: [[[ max, 1024 ]], 16 ],
        type: [[[ max, 12 ]], 8 ]
    }
}, {
    require: { assert: require('assert') }
})
```

When using named arguments, the argument values are assigned to the named
parameters preceding the first variable that is defined in the current scope.
That is, the first occurrence of a variable name that is either the name of a
property in the current path or a system name beginning with `$` dollar sign.

In the following definition the first argument to the `max` function will be
assigned to the `max` named argument. The positional argument mapping stops at
the `$path` parameter since it is a system parameter beginning with `$` dollar
sign. The `'oops'` parameter of the `max` function call for the `type` property
will be ignored.

```javascript
//{ "name": "ignore" }
const max = ({ max, $path, $_ = 0 }) => assert($_ < max, `${$path.pop()} excedes ${max}`)

define({
    packet: {
        length: [[[ max, 1024 ]], 16 ],
        type: [[[ max, 12, 'oops' ]], 8 ]
    }
}, {
    require: { assert: require('assert') }
})
```

In the following definition the first argument to the `max` function will be
assigned to the `max` named argument. The positional argument mapping stops at
the `packet` parameter since it is the name of a property &mdash; actually the
name of the root object &mdash; in the current path.

```javascript
//{ "name": "ignore" }
function max ({ max, packet, $path, $_ = 0 }) {
    assert($_ < max, `${$path.pop()} excedes ${max} in packet ${packet.series}`)
}

define({
    packet: {
        series: [ 32 ],
        length: [[[ max, 1024 ]], 16 ],
        type: [[[ max, 12, 'oops' ]], 8 ]
    }
}, {
    require: { assert: require('assert') }
})
```

Note that you cannot use closures to define functions because we're using the
function source in the seiralizer and parser generation so the encoded value is
lost. You'll end up with global variables with undefined values.

You can reduce the verbosity of your code by creating functions that declare
functions for transforms or assertions that you perform on more than one . The
function declaration function will return a function that will be included in
the serializer or parser. If you give it a meaningful name

```javascript
//{ "name": "ignore" }
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

```javascript
//{ "name": "ignore" }
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

### Terminated Arrays

In the following example, we terminate the array when we encounter a `0` value.
The `0` is not included in the array result.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 8 ], 0x0 ]
    }
})
```

#### Multi-byte Terminators

You can specify multi-byte terminators by specifying the multi-byte terminator
byte by byte in the end of the definition array.

In the following example, we terminate the array when we encounter a `0xa` value
followed by a `0xd` value, carriage return followed by line feed.

The `0` is not included in the array result.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 8 ], 0xd, 0xa ]
    }
})
```

#### Calculated Terminators

In the following example, we terminate when the result ends with a new line.
This will create a result with the newline terminator included.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 8 ], $_ => $_[$_.length - 1] == 0xa) ]
    }
})
```

A terminator can be multi-byte. Each byte in the multi-byte terminator is
specified as an individual element in the array.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        array: [[ 8 ], 0xa ]
    }
})
```

### String Value Maps

**TODO**: Need first draft.

```javascript
//{ "name": "ignore" }
define ({
    packet: {
        type: [ 8, [ 'off', 'on' ] ]
    }
})
```

```javascript
//{ "name": "ignore" }
define ({
    packet: {
        type: [ 8, { 0: 'off', 1: 'on', null: unknown } ]
    }
})
```

### Floating Point Values

Packet supports serializing and parsing IEEE754 floating point numbers. This is
the respsentation common to C.

A floating point number is is specified by specifying the value as a floating
the point number as `number` with the bit size repeated in the decimal digits of
the number.

```javascript
//{ "name": "ignore" }
define({
    double: 64.64,
    float: 32.32
})
```

There are only two sizes of floating point number available, 64-bit and 32-bit.
These are based on the IEEE 754 standard. As of 2008, the standard defines a
[128-bit quad precision floating
point](https://en.wikipedia.org/wiki/Quadruple-precision_floating-point_format)
but the JavaScript `number` is itself a 64-bit IEEE 754 double-precision float,
so we'd have to introduce one of the big decimal libraries from NPM to support
it, so it's probably best you sort out a solution for your application using
inline functions, maybe serializing to a byte array or `BigInt`. If you
encounter at 128-bit number in the wild, I'd be curious. Please let me know.

### Conditionals

**TODO**: Need first draft.

Basic conditionals are expressed as an array of boolean functions paired with
field definitions. The functions and definitions repeat creating an if/else if
conditional. The array can end with a feild definition that acts as the `else`
condition.

If the function has positional arguments, the function is called with the root
object, followed by an array of indices into any arrays the current path,
followed by an array of names of the properties in the current path.

In the following definition the bit size of value is 8 bits of the `type`
property is `1`, 16 bits if the type property is `2`, 24 bits if the `type`
property `3` and `32` bits for any other value of `type`.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        type: 8,
        value: [
            $ => $.type == 1, 8,
            $ => $.type == 2, 16,
            $ => $.type == 3, 24,
            32
        ]
    }
})
```

You can use conditionals in bit-packed integers as well.

```javascript
//{ "name": "ignore" }
define({
    packet: {
        header: {
            type: 4,
            value: [
                $ => $.type == 1, 28,
                $ => $.type == 2, [{ first: 4, second: 24 }, 28 ],
                $ => $.type == 3, [{ first: 14, second: 14 }, 28 ]
                [[ 24, 'ffffff' ], 4 ]
            ]
        }
    }
})
```

### Switch Conditionals

**TODO**: Need first draft. Also, example is wrong.

```javascript
//{ "name": "ignore" }
define ({
    packet: {
        type: [ 8, [ 'off', 'on' ] ],
        value: [ $ = $.type, { off: 8, on: 16 } ]
    }
})
```

### References to Paritals

**TODO**: First draft done.

If you have a complicated type that requires a complicated definition that is
tedious to repeat, you can reference that definition by name.

References can be used as types and can also be used as length encoding lengths
if they resolve to an integer type. If you create a type that is only used by
reference that you do not want available as a packet, prepend and underbar and
it will not be returned as a packet type.

**Mnemonic**: A string name to name the referenced type.

In the following a definition an encoded integer is defined as a partial that
will not be presented as a packet due to the `_` prefix to the name. It is
referneced by the `series` property as a type and used for the length encoding
of the `data` property.

```javascript
//{ "name": "ignore" }
define ({
    packet: {
        _encodedInteger: [
            [
                value => value <= 0x7f, 8,
                value => value <= 0x3fff, [ 16, 0x80, 7, 0x0, 7 ],
                value => value <= 0x1fffff, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
            ],
            [ 8,
                sip => (sip & 0x80) == 0, 8,
                true, [ 8,
                    sip => (sip & 0x80) == 0, [ 16, 0x80, 7, 0x0, 7 ],
                    true, [ 8,
                        sip => (sip & 0x80) == 0, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                        true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
                    ]
                ]
            ]
        ],
        packet: {
            type: 8,
            series: '_encodedInteger',
            data: [ '_encodedInteger', [ Buffer ] ]
        }
    }
})
```

### Checksums and Running Calcuations

Some protocols perform checksums on the body of message. Others require tracking
the remaining bytes in a message based on a length property in a header and
making decisions about the contents of the message based on the bytes remaining.

To perform runnign calculations like buffers and remaining bytes we can use
accumlators, lexically scoped object variables that can be used to store the
state of a running calculation.

The following defintion creates an MD5 checksum of the body of a packet and
stores the result in a checksum property that follows the body of the message.

```javascript
//{ "name": "ignore" }
define({
    packet: [{ hash: () => crypto.createHash('md5') }, {
        body: [[[
            ({ $buffer, $start, $end, hash }) => hash.update($buffer, $start, $end)
        ]], {
            value: 32,
            string: [[ 8 ], 0x0 ]
        }],
        checksum: [[
            ({ hash }) => hash.digest()
        ], [[ 40 ], [ Buffer ]], [
            ({ value = 0, hash }) => {
                assert.deepEqual(hash.digest(binary).toJSON(), value.toJSON())
            }
        ]]
    }]
}, {
    require: {
        assert: 'assert',
        crypto: 'crypto'
    }
})
```

Here we also introduce the concept of buffer inlines. These are inlines that
operate not on the serialized or parsed value, but instead on the underlying
buffer. In the above example the `hash.update()` inline is not called once for
each property in the `body`, it is called for each buffer chunk that contians the
binary data for the `body`.

Unlike odinary inline functions, a buffer inline is not called prior to
serialization. Buffer inlines are called as late as possible to process as much
of the buffer continguously as possible. In the previous example, the
`hash.update()` inline is applied to the binary data that defines the entire
`body` which it encapsulates.

We use nested structures to group.

**TODO**: Simplier calculation example to start. Calculation is important
because it will allow us to talk about the difference between `sizeof`,
`offsetof`.

```javascript
//{ "name": "ignore" }
define({
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
            ({ $start, $end, counter }) => counter[0] -= $end - $start
        ]], {
            value: 32,
            string: [[ 8 ], 0x0 ]
            variable: [
                ({ counter }) => counter[0] == 4, 32
                ({ counter }) => counter[0] == 2, 16
                8
            ]
        }],
    }]
})
```

### Parameters

**TODO**: Need first draft, or reread this and see if it is a real first draft.

Accumulators described in the preceding section also define parameters. Any
accumulator declared on the top most field will create parameters to the
generated serializes and parsers.

```javascript
//{ "name": "ignore" }
define({
    packet: [{ counter: [ 0 ] }, [[[
        ({ $start, $end, counter => }) => counter[0] += $end - $start
    ]], {
        number: 8,
        string: [ [ 8 ], 0x0 ]
    }]]
})
// **TODO**: API call to get counter.
```

The parameters are available as both arguments that can be passed to inline
functions as well as generally available in the program scope. Be careful not to
careful not to hide any module declarations you've declared.

```javascript
//{ "name": "ignore" }
define({
    packet: [{ encoding: 'utf8' }, {
        string: [[
            value => Buffer.from(value, encoding)
        ], [ [ Buffer ], 0x0 ], [
            value => value.toString(encoding)
        ]]
    }]
})
// *TODO*: API call to encode string ascii or something.
```
