## Offsets

We implement `offsetOf` as a function available to the parser definition. The
`offsetOf` function takes an array path and finds the offset of the field at the
path. The array includes paths into the object and indexes into any arrayed
elements.

For offsets into arrays performance can degrate if you are trying to find the
offset of the start of the array. You might be interested in a sub-packet in a
long series of packets so you'd be repeatedly recacluating the start of the
sub-packet at an ever increasing index, less the offset of some field inside
that index. We don't want to build caching into this so it would be nice to
specify the specific offset function to use so the user could grab a sub-packet
parser out of a parse built through composition.

They can still fall back to using an accumulator to implement gathering
breadcrubs of their parse along the way.

## Limits

When we reach the limit we raise an exception. The exception has an `end`
property and an object path into the constructed object where the limit was
reached and the object so far.

This definition is unambiguous. Accumulators start with an object defining the
accumulator names.

A conditional used to determine the length of length encoded array has an array
as the second element.

We encapsulate the fields that are supposed to be limited in an object so they
are clearly encapsulated. To prevent the creation of a nested object the user
can use underscore elision.

```
const definition = {
    object: {
        length: 32,
        _limit: [[ $ => $.header.length ], {
            value: 32,
            string: [ [ Buffer ], 0x0 ]
        }]
    }
}
```

Alternatives.

Instead of raising an exception we could return a limit value be we still have
the problem of what to tell the user. We can change to a return value and lots
of strange conditions if we discover a protocol that presses on when a zero
termianted array overruns a packet limit, but it doesn't make sense to set a
limit and then attempt to continue to communicate with a client that is
attempting to overrun it.
