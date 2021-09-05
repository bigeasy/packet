## Orphaned

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

#### Calculated Terminators

In the following example, we terminate when the result ends with a new line.
This will create a result with the newline terminator included.

```javascript
//{ "name": "ignore" }
define({
    packet: {
1] == 0xa) ]         array: [[ 8 ], $_ => $_[$_.length
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
