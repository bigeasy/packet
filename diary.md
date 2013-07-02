# Packet Diary

Getting started late on the diary. I keep one for new projects, but this has
been around for a while, so there is none.

`sizeOf` should be a function, not a property.

## Pre-compilation

Your unwind loop gets fast. Inside the compiled function, everything you need
for a pattern so you get that closure preformance boost from V8. The loop is
something like.

```javascript
while (next = next() && remaining);
```

Or something. Not thinking straight.

This gets rid of all the man conditionals in the parse and serialize loops.
Everything could simply be unwound if not for resume. Thus, closures. But, also,
maybe a switch statement? Fall through? Evil but good.

## Bit Packing

It might be much easier, if you were to put bits in arrays.

## Positional Callbacks

I'm wondering if I want to eliminate positional callbacks, only build a tree.
That simplifies all the data structures.

Or...

Fix it up so that the tokenizer assigns a name &mdash; arg0, arg1, arg2 and if
it has never named anything, then it the callback gets a flattening. You could
even wrap the callback, so flattening costs extra.

What am I trying to save here? What cost? The thought is that array indexes cost
less than object indexes.

Actually, the fear is 
