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

A 16-bit whole integer, valid values from 0 to 65535.

**Mnemonic**: Number of bits, as opposed to bytes so that numbers remain
consistent when bit packing.

```
define({
    value: 16
})

serialize({ value: 0xabcd }) // => [ 0xab, 0xcd ]
```

A two's compliment 16 bit integer, value values from -32768 to 32767. Two's
compliment is a binary representation of negative numbers.

**Mnemonic**: Negative symbol to indicate a negative value.

```javascript
define({
    value: -16
})
```

## Endianness

By default, all numbers are written out big-endian, where the bytes are written
from the most significant to the least significant. The same order in which
you'd specify the value as a hexadecimal literal in JavaScript.

Little-endian means that the bytes are serialized from the least significant
byte to the most significant byte. Note that this is the order of *bytes* and
not *bits*. This would be the case if you wrote an integer out directly to a
file from a C program on an Intel machine.

**Mnemonic**: The tilde is curvy and we're mixing up the bits like that.

```javascript
define({
    value: ~16
})
```

If you want a little-endian negative number you **must** put the tilde before
the negative symbol.

```javascript
define({
    value: ~-16
})
```

## Packed Integers

## Nested Structures

## Length-Encoded Arrays

A length-encoded indicates a series of values

**Mnemonic**: The negative sign indicates a negative value.
