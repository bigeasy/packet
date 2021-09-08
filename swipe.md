
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
                ({ $start, $end, counter }) => counter[0] -= $end - $start
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
