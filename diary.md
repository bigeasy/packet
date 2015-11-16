# Packet Diary ![Tracker](https://www.prettyrobots.com/1x1-pixel.png)

Getting started late on the diary. I keep one for new projects, but this has
been around for a while, so there is none.

`sizeOf` should be a function, not a property.

## Inbox

 * What is `bytesWritten` about? What is `rest` about? Don't we reset when we
   call `serialize` or `extract`?

## Pre-compilation

Your unwind loop gets fast. Inside the compiled function, everything you need
for a pattern so you get that closure performance boost from V8. The loop is
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

## Pre-Compiled Parsers and Serializers

I've held onto a pointless optimization for far to long. I've believed, based on
nothing but intuition, that parameters are faster than objects. Perhaps at some
point I saw some evidence of this but that's gone.

The logic still supports positional arguments now, but the implementation
expects an object, instead of expecting an array.

## Offsets

The `Serializer` is just that, it takes an object or parameters and flattens
them to a stream. Currently, I'm facing a problem in that `offsetsOf` returns an
object if the `Serializer` was told to extract from an `Object.` However, the
structure of the `offsetsOf` report includes the containing bytes of of bit
packed fields. There is no name to assign the containing bytes. They are unnamed
in the pattern.

It won't be a problem for arrays of structures, though. The array will most
likely have a name.

Thus, for that one special case, we say that there are no objects coming out of
`offsetsOf`. It is an array for the purpose of visualization. If you want to
find a particular field, you can use `Array.filter` or some such.

Oh, also, for the purpose of display, we might also want to see skipped bytes.
They certainly do not have a name.

## Reconsidering My Objectives for Packet

Throughout this project, I've avoided slippery slopes. Slopes such as, nesting
and pattern matching.

Of course, the moment I tried to build something with Packet myself I
encountered a need for choices based on the first bit of the first byte, a
common construct in binary formats, and so I immediately added alternation to
Packet. It's fine to slide down the slope if you're the one about to extend a
metaphor beyond its utility.

Nesting already exists in the form of bit packing. An
[issue](https://github.com/bigeasy/packet/issues/81) exists requesting more
nesting, this time to support length encoded arrays of structures. This is to
support the real world use case of creating a [Minecraft protocol
parser](https://github.com/superjoe30/node-minecraft-protocol). If it were me
building that parser, I'd added length encoded arrays without pause.

The request for parsed inspection that came in through private email was also
compelling. Here a programmer found Packet and wanted to use it to explode
Packets for a web application that lets you inspect binary files, targeted at
the gaming community. That's too cool of an application not to support. I'm
adding `offsetsOf` so that Packet can show it's work.

I've thought about how Packet has evolved. It is a compelling library. People
see it and they want it to solve their problem. Their problem is that they want
to explode binary data with declarations of that data, not by picking through
the bits themselves.

Someone wanted to implement a protocol where the packet parsing was fed by a
config file. Packet looked perfect for this, but it isn't.

Someone wanted to create a binary file format explorer where people could
inspect the contents of a binary file by expressing what they think they see as
a pattern, then see what they got. Packet looked perfect for this, but it
wasn't.

Someone wants to [read through a binary file looking for a
sentry](https://github.com/bigeasy/packet/issues/62), a start of record marker,
then extracting a packet if the record extracted has a proper checksum. Packet
looked perfect for this, but it isn't.

You make what you measure. While building Packet, I was building the
[MicroJS](http://microjs.com/) libraries
[Stencil](https://github.com/bigeasy/stencil),
[Inquiry](https://github.com/bigeasy/inquiry),
[Cadence](https://github.com/bigeasy/cadence) and
[Timezone](https://github.com/bigeasy/timezone), so I'd established a habit of
rejecting anything that would be nice to have, anything that would cause the
library to grow beyond 5k, or the braggable under 1k of Inquiry.

Having a simple reason to say no was liberating. It was used primarily against
myself, but once a library gets some adoption, like Timezone, I find that people
appreciate the goal of minimalism. When you can do something easily through a
three line recipe, why bake another conditional into a function that is supposed
to be high-performance like the date math and formatting function in Timezone?

These libraries minimal and the reasoning to decide whether to include a feature
was simple, but libraries themselves are not simple utilities. Stencil and
Inquiry are both languages of sorts, Timezone does some lexing and syntax
bashing, Cadence has some serious syntax bashing. With them I favored minzipped
size over other factors and still got some great libraries.

My concern with Packet has always been speed. I've been resistant to extensions
because it complicates the parse and serialize loop. It has given me a simple
criteria by which to judge any request for a new feature; will it add a
condition to the parse loop and serialize loop? If so that makes it harder for
me to make my bargain, that the Packet declaration language is so easy to use,
you won't mind if Packet is a little bit slower than a hand-made parser. If it
gets too complicated, then I have to use benchmarks to make my case, and if gets
too slow then Packet is curious library, maybe for prototyping, but not for
production.

Well, [best-foot-forward](https://github.com/bigeasy/packet/blob/master/diary.md#best-foot-forward)
makes performance concerns go away. Packet parsers and serializers will the
fastest they can be, but this is not going to be a MicroJS library. It's not
going to be huge, it can still live on the browser, but it's not going to be
tiny. And, of course, as the [composition
architecture](https://github.com/bigeasy/packet/blob/master/diary.md#composed-loops)
takes shape, you can probably ship only what you need.

My new criteria for considering a request is a little more complicated;

 * does request represent a natural application of binary parsing and
   serialization?
 * does the use case work with real binary data, data in the wild?
 * does the Packet API prevent the user from obtaining the benefits of the
   Packet definition language?

Perhaps the last bit is the way to look at Packet. My hunch is that when people
read through the definition language description, they think, oh, that's
perfect. This makes sense.

If I know a lot about binary, this looks like C structures, Perl's or Python's
pack, I've see this before.

If I'm not altogether familiar with binary, I get the sense that this library
catalogues the things you to expect in binary data. There is a lot of structure
here, and I can build on top of this structure.

But, then my desire to keep it fast and minimal means that they can't get their
hands on that language. There's now way to embed logic in the language. There's
no way to get the parser to show it's work.

And the nice people of GitHub will say...

"Oh, you mean I can't match repeated structures without an external loop? Those
are all over this real world protocol. (Minecraft.) I've got a lot of loops
already."

"I can't get a dump of how the patterns matched? Well, I guess I can't use it to
build an inspector, just a reader/writer. I'll keep that in mind."

"You mean in order to search for a word, I need to invoke your high-ceremony API
to get those two bytes? I'll just read them using a buffer library, and then
I'll read my record using the same library."

"Great library though. It looks like it is really useful for *something*."

The Packet API is a two step process. This is because Packet supports
incremental parsing and serialization. It's not a single step in any case. Let
Packet know what to extract or serialize, then fed it buffers and it will tell
you when it's done.

That high-ceremony API exists because Packet promises to do a lot of work once
you get it set up. It will go to binary, turn it into JavaScript and give you
your binary data as JSON.

As aspect of the clouds in my thinking is the concern that Packet will attract
someone who wants to do binary because it is faster. This is an ugly failing on
my part, to assume that I'm going to get trolled. I've had some unpleasant
issues opened up on GitHub, but for the most part my interactions have been with
the sort of people I'd want to work with in the office, real people doing real
work, or people with a natural curiosity teaching themselves new things on their
own time. Or maybe it is me just parroting the Node.js line of keeping things
out of the core, out of the library, saying no.

This truly is a diary, so please don't take this to be directed at you, dear
reader, unless you are me rereading this, in which case, build for the people
you want to help, not against people you want to avoid.

Try to imagine if you'd like to use Packet to solve the problem for which
they've chosen Packet. People are very generous in sharing details of their use
case. When it is a real world example; Minecraft, rs485, or greenfield
development that wants to use the Packet language as a foundation, like a packet
inspector, accommodate.

## Best Foot Forward

What's not being said here (update: added mention of this up there), what's
changed my tune is realizing that Packet needs to take a best-foot-forward
approach and **compile** a Packet parser that is a function with all the reads
inlined that falls back to a general purpose loop if the compiled parser stops
in mid-read. Then you could even go so far as to disable incremental parsing, if
you know that you'll always have the entire structure when you invoke `parse`.
(And all the same for the `Serializer`.)

With this in place, the bad criteria of not wanting to pollute the loop with
conditionals that won't trigger for the common case, that's nonsense, because
the common case is that binary data is woolly and binary protocols are slap-dash
and a general purpose loop is always going to be slower and all you're doing is
trying to make the fact that it is slower painfully obvious.

A best-foot-forward function can be simple. It can just check to makes sure it
can read the next field. If not it falls back to the general purpose function.

The general purpose function can now also be very simple, because it can be a
composition. It is the fallback that happens during partial reads. It can be a
bit slow, because it will be invoked only on occasion. It probably won't be that
slow. I've tried to avoid function calls in an effort to keep things fast, but
the loops are now so convoluted, composition would probably be faster.

But, a best-foot-forward function with unrolled loops and direct buffer copies
and no conditionals to test to see if transforms are needed, that is going to be
blindingly fast. No doubt about it. It is no longer optimize first. It will be
impossible to write a more efficient parser (or serializer).

For some applications the best-foot-forward function will the only ever called.
For some applications, incrementalism can be disabled because we'll know for
certain that we have the entire packet.

With this in place, we can now add features like length encoded arrays of
structures and packet scanning without paying a price for the simple cases of
reading a fixed length structure. These can be part of the composition pattern.
A composition that reads and array of structures can call best-foot-forward
functions, it can be mix or match.

Best-foot-forward can be implemented in steps, fixed network order data first,
then fixups like IEEE floats, then arrays, then pipelines, then alternation,
etc.

The code is generated in memory, but it is tested by writing out some of out to
the file system and `requir`ing it so Istanbul can test the logic of the general
case on a generated specific case.

*Notes*: Some untested thoughts: `this.length` is going to cost something, maybe
we push the total bytes read forward into callback. The callback reset logic is
going to cost. Maybe the user is responsible for continuing. It mucks up our
nice API thought, but I'm not sure I'm using it the API that way.

If not, then it makes sense to remove it. If continuing from within callbacks is
awesome, then the costs are probably not significant, and the logic would need
to go somewhere in any case.

I'm seeing where callback based ought to be an option. If you don't need
incremental, `parse` can just return an object.

If speed matters, then why am I adding convenience functions like figuring the
start and end of the range? Why don't you please provide that? Now I have to
calculate it everywhere.

Alternation is becoming annoying. I'd like to keep a separate map of alternates
that is only used if there are alternates to track. This gets passed into the
generic builder, but is only auto created. Actually, it's a sparse array, and at
each position, we note the path that is chosen, we then flatten.

This breakifies the current parse loop.

*Serialization*: I'm no longer happy with the notion of fixing up alternation
prior to, you know what, I'm done with positional parameters. They have been on
the way out for some time. I have a documentation issue, so how do if solve that?

Create two simple functions that pack and unpack?

```
pack('byte: b8, word: b16', { byte: 1, word: 1 })
unpack('byte: b8, word: b16', [ 0x01, 0x00, 0x01 ])
```

### Improvements

Get rid of signedness for sizes larger that 32 bit. Reintroduce it when
requested. When I first created Packet, there was much left of me that wanted to
be future, ugh, proof, but flexible, but I'm going to let JavaScirpt's
limitation set this boundaries, and get a faster unsigned integer.

When you have single bytes, you can do array scans and slices. This gets back to
doing buffer only, or maybe you have a language for buffer slices?

```
"<b8z>" // slice a buffer terminated by zero.
"<b16z>" // slice a buffer terminated by two zeros?
"<b16,b8z>" // get those properties, append a buffer?
"<>b8z" // slice a buffer terminated by zero.
```

Or, hey, super easy. If you say b8, you get `Buffer`, otherwise you get an
array. If really did want an `Array`, then you can create one yourself pretty
easily, but you probably shouldn't.

## Composed Loops

In order to support best-foot-forward and length encoded arrays of structures,
there needs to be a transition away from the monolithic loop that works through
the pattern, to a composition strategy where the `parse` function is replaced at
each step with function to parse the next record. If it is incomplete, the next
call to `parse` picks up where it left off. (Also `write`.)

In order to do this without a huge breaking rewrite, we need to start with a
simple case, parse a network order word, and then continue with the loop as it
is. This would reimplement the current `parse` loop as a function builder that
takes the `pattern` and `patternIndex` and calls `nextField()` and
`nextValue()`. In fact, that is first commit in the transition.

I'll transition the `Parser` first. Then the `Serializer`.

## Tracking Source Formatting Changs

Checking generated source into source control.

Currently concerned that I'm playing formatting whack-a-mole; removing an
extraneous new line when this parser is generated removes all new lines when
that parser is generated. There is no way for me to know. Gee whiz, if only I
had a tool that would track these changes, and maybe even display where and how
things have changed.

You're not supposed to check generated source into source control. Here, let me
give you a long, pedantic lecture on that...

Generated source is still source. While developing packing I'm writing code that
writes code. My process is to edit and view the generated source. The generated
source is very much under my control.

## Verb Stick

I don't want nouns. I want a stick with a verb tied to it, like a carrot.

I'm thinking about how to use this library, and what occurs to me today is
dismantling the objects, already in progress, and then why not let the user pick
the function name for continuation? That can be part of the closure.

Given a pattern, you build a parse, write, or sizeOf. It doesn't happen all at
once. Which means we're really starting to dispose of `index.js` and replace it
with the contents of `composers.js`.

## Pattern Matching

The use case presented is a scan for a packet on a serial network. The packet
has a sentry and a CRC. My first instinct is to say can for the sentry yourself,
then when you find it, give it to Packet, but it is a two-byte sentry, it would
be nice if Packet would scan for that sentry by itself so the user could use the
pattern language, without having to invoke the Packet API at every byte.

The Packet API is a two step process. This is because Packet supports
incremental parsing and serialization. It's not a single step in any case. Let
Packet know what to extract or serialize, then fed it buffers and it will tell
you when it's done. (Does it do that with serialize? It should.)

I imagine adding a function named `search` to the `Parser`. The `search`
function will apply the pattern at each byte. Invokes your callback every time
it matches. This means that internally, `Parser` is forking off on each byte,
trying to match the pattern.

Thus, we'd add a new construct to the language.

```javascript
"0x1002, b8, b8, 0x1003" // match literal sentries at the start and end of
                         // pattern
```

TODO: Some stuff here can go direct to the documentation.

When called with `parse` no search is performed, the bytes are read from the position in the buffer
indicated by the call to `parse`. The callback given to `extract` gets a
`boolean` as a first and last argument.

Initial implementations of `search` would inspect those those booleans (not just
any boolean, only booleans associated with a literal pattern) and callback if
they are all true.

Later implementations would fail fast, giving up on the pattern the moment a
byte in a literal did not match the literal.

This also makes it easer to write serialization patterns.

That is obvious case. Now, there may be more complicated cases down the road.
Some thoughts...

```javascript
"{ $b16 == 0x1002 }, b8, b8, { $b16 == 0x1003 }"
```

Madness. Probably unnecessary, but it it arose, there is still room in the
language to have JavaScript that could be wedged in there.

That might not be the best expression, though. Something more general might to
use the pipeline notation.

```javascript
"b16|{ $1 == 0x1002 }, b8, b8, b16|{ $1 == 0x1003 }"
```

Since we're grouping for structures in any case, we might want to group and
pipe?

```javascript
"{b16, b8, b8, b16}|{ $1 == 0x1002 && $4 == 0x1003 }"
```

What if you need the whole darn buffer?

```javascript
"{b16, b8, b8, b16}|{ crc($0) == $3 }"
```

Here the presence of `$0` means to keep the buffer.

How do you return the buffer to the callback? Use the `$` hack?

```javascript
"{b16, b8, b8, b16}|{ $.crc = crc($0) == $3 }"
```

Do we go nuts with this? What I've wanted to avoid is building a regular
expression engine.

```javascript
"(0xaa, 0xaa*) => sentry, b16, b16, b32"
```

Actually, it is probably easy enough, if we're not minifying, to throw in named
functions really quickly.

```javascript
parser.extract("{b16, b8, b8, b16}|{ crc($0, $3) }", function crc (buffer, checksum) {
  return complicatedCRCFunction(buffer) == checksum;
});
```

You can detect if a function is a pipeline function by the presence of
`/^\$\d+/`, if it exists, then we need to pass in parameters, otherwise it is
pipeline function. We can create use the name namespace for transforms.

Or maybe we use a signal like `?`. It means that it is a boolean return and a
condition of matching when performing a search.

```javascript
"{b16, b8, b8, b16}|{ ? $.crc = crc($0) == $3 }"
```

Another concern is that I didn't want to get into packet sniffing an intrusion
detection, but, how hard is it to look at [Snort
rules](http://manual.snort.org/node32.html) and see what the requirements are?

They're not too steep. It's Boyer-Moore, which we'll use to implement search,
with some thoughts on offsets and depth. Implementing a basic subset of regular
expressions would be as powerful.  (Note that Snort is operating against packets
individually, so it is not as complicated as searching through a file or a
stream.)

If I implement a light regular expression engine, the I can feel better about
calling this library Packet. Yes, it does parsing. Yes, it does serialization.
Yes, it does pattern matching. Yes, it is faster than the parser you'd write
yourself.

## Syntax Beastiary

Here are some thoughts on syntax...

```javascript
'b8'          // perfect wouldn't change a thing.
'b16'         // bits instead of bytes, because we want to convey the binaryness.

// the colon is precious. we use it for naming.
'foo: b16'

// notice how not all names are valid anymore. boo-hoo. but it is so easy to
// detect, it doesn't matter too much, does it.
'b16: b16'

// matched characters are precious

'b16[10]'     // kind of a waste of a bracket, don't you think? It will only
              // ever contain a number, but we're not ever saying when we're
              // going to create an array or buffer, we're not consistent.

'b16*8'       // we could say this instead, times 8. creates array.
'b16*8z'      // we can still zero terminate, creates padded array? can't the
              // user pad simply by filling the array?

'b8z'         // creates an array.
'b8/b8'       // also creates an array.
'b8.8'        // not as noisy as *.
'b8.8z'       // can still zero terminate.
'b8.8{0}z'    // can still pad. . means it is part of the same thing, but * 
              // really breaks up the statement.

// how to create a record? Where we have no packing.
'record:{foo: b16, bar: b8z}'

// reuse counting to create an array. I don't like the slash up against the
curlies though, too much going on.
'records:b8/{foo: b16, bar: b8z}'

// reuse curlies for packing
'b8{flag: b1, value: b7}'

// we can say a name is an array, without is packing
'records:b8{foo: b16, bar: b8z}'

// can we still get our slices of the array?
'check:<records:b8{foo: b16, bar: b8z}>'

// and continue?
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f>, sum:b32'

// what about processing before return?
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> -> crc($1), sum:b32'

// what about calculating as you go?
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> | crc($1), sum:b32'

// yeah, but a javascript block *will* have commas, so we need to use some
// curlies.
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> | { crc($1) }, sum:b32'
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> -> { crc($1) }, sum:b32'

// ah, but only if we *need* curlies.
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> | crc($1), sum:b32'
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> -> 'checksum: ' + crc($1), sum:b32'

// alternation got the comma the first time around because of switch statements.
'b8(252/252-0xffff: x8{252}, foo: b16         \
   | 0-251: foo: b8                           \
   | 253/0x10000-0xffffff: x8{253}, foo: b24  \
   | x8{254}, foo: b64)'

// but now the commas are too many. I'm not sure what to put there. the
// alternation syntax is fine. we use pipes and parens. unfortunately, it means
// we can't use pipes to create pipelines, but we might be moving to -> for
// that, for function calls. alternation is usually about only a few bytes that
// have been conditionally encoded, not entirely different packets.

// We could reuse our arrows.
'b8(252/252-0xffff -> x8{252}, foo: b16         \
   | 0-251 -> foo: b8                           \
   | 253/0x10000-0xffffff -> x8{253}, foo: b24  \
   | x8{254}, foo: b64)'

// We could use equal arrows.
'b8(252/252-0xffff => x8{252}, foo: b16         \
   | 0-251 => foo: b8                           \
   | 253/0x10000-0xffffff => x8{253}, foo: b24  \
   | x8{254}, foo: b64)'

// We could use tildes to mean there abouts.
'b8(252/252-0xffff ~ x8{252}, foo: b16         \
   | 0-251 ~ foo: b8                           \
   | 253/0x10000-0xffffff ~ x8{253}, foo: b24  \
   | x8{254}, foo: b64)'

// We can't have pipelines, unless we want say that whitespace is significant.
// But, if it's not a number, or a pattern, or if we make ~ required, we can
// have pipelines.
'b8(252/252-0xffff ~ x8{252}, foo: b16         \
   | 0-251 ~ foo: b8z | utf8()                   \
   | 253/0x10000-0xffffff ~ x8{253}, foo: b24  \
   | ~ x8{254}, foo: b8z | utf16())'

// or we can go to arrows.
'b8(252/252-0xffff ~ x8{252}, foo: b16         \
   | 0-251 ~ foo: b8z -> utf8()                   \
   | 253/0x10000-0xffffff ~ x8{253}, foo: b24  \
   | ~ x8{254}, foo: b8z -> utf16())'

// but arrows are one way, what if we did two way arrows?
'b8(252/252-0xffff ~ x8{252}, foo: b16         \
   | 0-251 ~ foo: b8z <-> utf8()                   \
   | 253/0x10000-0xffffff ~ x8{253}, foo: b24  \
   | ~ x8{254}, foo: b8z <-> utf16())'

// what if we get noisy with equal arrows too?
'b8(252/252-0xffff => x8{252}, foo: b16         \
   | 0-251 => foo: b8z <-> utf8()               \
   | 253/0x10000-0xffffff => x8{253}, foo: b24  \
   | => x8{254}, foo: b8z <-> utf16())'

// what if we get noisy with equal arrows too?
'b8(252/252-0xffff        => x8{252}, foo: b16    \
   | 0-251                => foo: b8z <-> utf8()  \
   | 253/0x10000-0xffffff => x8{253}, foo: b24    \
   |                      => x8{254}, foo: b8z <-> utf16())'

// hey, that could mean run on parse and serialize, on parse only or on
// serialize only.

// how to we put our checksum back? The arrows both pointing in the same
// direction mean to run through the checksum in both directions.

// But, we only write the sum at the end.
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> >-> crc($1), sum:b32 <- $.check'

// The arrows have meaning, but we default call, how do we say pipe?
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> >-> | crc($1), sum:b32 <- $.check'

// Or maybe if we pipe we pipe?
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> | crc($1), sum:b32 <- $.check'

// Or we are explicit with the arrows.
'check:<records:b8{foo: b16, bar: b8z}, foo:b32f> >|< crc($1), sum:b32 <- $.check'

// but how about construction now?
// if crc($1) returns a function can we call that function instead?
```

I'd like to be able to have a ternary like alternation, so that `foo, bar:` get
assigned the results of the alternation.

## Inbox

 * Maybe there is a pattern parser that is exposed to the user? That is their
   packet collection. They manage it, precompile, etc?

```javascript
var parser = packet.extract('b8', new Parser, function () {
  return packet.extract('b8', function () {
  });
});
var parser = new Parser(packet.compile('b8', function () {
  return packet.extract('b8', function () {
  });
}));
var parser = parser.extract('b8', function () {
  return packet.extract('b8', function () {
  });
}));
var parser = parser.packet(compiled['name'],
var serializer = packet.serialize('b8', new Serializer, object);
```

If I really wanted to break tests, and I do, then I'd prepend a byte to the
given array and make the parser start at an offset.

 * The only reason I'm keeping positional arguments around is because they are
   easy to document, so I'm going to not be clever about anything, and simply
   check to see if `isNamed` is set.


## Nested Structures

Nested structures and structural alternation, that blows this up into a great
big language, almost asking for a transpiler, but let's not do that, but we are
definitely on a collision course with curly braces.

Because nested length encoded or null terminated arrays of structures are not
really an issue. In the nested parser you just punt and return. In the
incremental parser you move to a previous step.

## Redux

Probably am going to embrace the new nested style of language and remove the old
parser at some point. This project is not going to be a module. It will produce
a module, but I'm going to build it into a module, so I can take my time letting
go of old ideas, leaving the old language parser in place, bringing in a new
means of expressing the structure.

From my notes I can see that the challenges where alternation and nested
structures. My goal was to make them arbitrarily nested and create a test of the
most convoluted structure imaginable.

I also recall agonizing over invocation. The output objects are indeed little
state machines, they are going to know when the packet is finished and how much
of the buffer has been consumed. I know that I was trying to figure out how to
support different forms of invocation, whole packets versus incremental packets.
I was trying to consider a minimalist structure, maybe an array with three
items, buffer, index, and object under construction, something along those
lines, essentially trying to minimize the energy spent trying to figure out what
to do next. This might become apparent to me as I continue to implement the
parsers, sorting out how to invoke them.
