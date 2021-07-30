[![Actions Status](https://github.com/bigeasy/packet/workflows/Node%20CI/badge.svg)](https://github.com/bigeasy/packet/actions)
[![codecov](https://codecov.io/gh/bigeasy/packet/branch/master/graph/badge.svg)](https://codecov.io/gh/bigeasy/packet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Incremental binary parsers and serializers for Node.js.

| What          | Where                                         |
| --- | --- |
| Discussion    | https://github.com/bigeasy/packet/issues/1    |
| Documentation | https://bigeasy.github.io/packet              |
| Source        | https://github.com/bigeasy/packet             |
| Issues        | https://github.com/bigeasy/packet/issues      |
| CI            | https://travis-ci.org/bigeasy/packet          |
| Coverage:     | https://codecov.io/gh/bigeasy/packet          |
| License:      | MIT                                           |

Packet creates **pre-compiled**, **pure-JavaScript**, **binary parsers** and
**serializers** that are **incremental** through a packet definition pattern
language that is **declarative** and very **expressive**.

Packet simplifies the construction an maintenance of libraries that convert
binary to JavaScript and back. The name Packet may make you think that it is
designed solely for binary network protocols, but it is also great for reading
and writing binary file formats.

**Incremental** &mdash; Node packet creates incremental parsers and serializers
that are almost as fast as the parser you'd write by hand, but a lot easier to
define and maintain.

**Declarative** &mdash; Packet defines a binary structure using a pattern
language inspired by Perl's `pack`. The binary patterns are used to define both
parsers and serializers. If you have a protocol specification, or even just a C
header file with structures that define your binary data, you can probably
translate that directly into Packet patterns.

For parsers, you associate the patterns to callbacks invoked with captured
values when the pattern is extracted from the stream. For serializers you simply
give the values to write along with the pattern to follow when writing them.

**Expressive** &mdash; The pattern language can express

  * signed and unsigned integers,
  * endianess of singed and unsigned integers,
  * floats and doubles,
  * fixed length arrays of characters or numbers,
  * length encoded strings of characters or numbers,
  * zero terminated strings of characters or numbers,
  * said strings terminated any fixed length terminator you specify,
  * padding of said strings with any padding value you specify,
  * signed and unsigned integers extracted from bit packed integers,
  * conditions based on bit patterns,
  * character encodings,
  * custom transformations,
  * and pipelines of character encodings and custom transformations.

## Installing

Packet installs from NPM.

```text
//{ "mode": "text" }
npm install packet
```
Memento is a database that supports atomic, isolated transactions, written to a
write-ahead log and synced for durability in the event of system crash, and
merged into b-trees for fast retrieval. It reads from an in memory page cache
and evicts pages from the cache when they reach a user specified memory limit.

Memento is written in pure JavaScript.

Memento provides a contemporary `async`/`await` interface.

This `README.md` is also a unit test using the
[Proof](https://github.com/bigeasy/proof) unit test framework. We'll use the
Proof `okay` function to assert out statements in the readme. A Proof unit test
generally looks like this.

```javascript
//{ "code": { "tests": 2 }, "text": { "tests": 4  } }
require('proof')(%(tests)d, async okay => {
    //{ "include": "test" }
    //{ "include": "testDisplay" }
})
```

```javascript
//{ "name": "testDisplay", "mode": "text" }
okay('always okay')
okay(true, 'okay if true')
okay(1, 1, 'okay if equal')
okay({ value: 1 }, { value: 1 }, 'okay if deep strict equal')
```

You can run this unit test yourself to see the output from the various
code sections of the readme.

```text
//{ "name": "install", "mode": "text" }
git clone git@github.com:bigeasy/packet.git
cd packet
npm install --no-package-lock --no-save
node --allow-natives-syntax test/readme/readme.t.js
```

The `--allow-natives-syntax` switch allows us to test that we are creating
pcakets that have JavaScript "fast properties."

## Packet Definition Language

To test our examples below we are going to use the following function.

```javascript
//{ "name": "test", "mode": "code" }
{
}
```

### Whole Integers


