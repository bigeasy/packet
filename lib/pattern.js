// Don't forget that parsers of any sort tend to be complex. A simple PEG grammar
// quickly becomes a thousand lines. This compiles to under 400 lines of
// JavaScript. You are giong to find it difficult to make it much smaller.
//
// This module is separated for isolation during testing. It is not meant to be
// exposed as part of the public API.

// We don't count an initial newline as a line.
function error (message, pattern, index) {
  var lines;
  if (pattern.indexOf("\n") != -1) {
    lines = pattern.substring(0, index).split(/\n/);
    if (lines[0] == "") lines.shift();
    return message + " at line " + lines.length + " character " + (lines.pop().length + 1);
  } else {
    return message + " at character " + (index + 1);
  }
}

var BASE = { "0x": 16, "0": 8, "X": 10 };

function numeric (base, value) {
  try {
    return parseInt(value, BASE[base || "X"]);
  } catch (e) {
    return null;
  }
}

var re = {};

function compileRegularExpressions() {
  var name, $, lines, i, I, source;
  source = require("fs").readFileSync(__filename, "utf8").split(/\r?\n/);
  for (i = 0, I = source.length; i < I; i++, $ = null) {
    for (; !$ && i < I; i++) {
      $ = /re\["([^"]+)"\s*\/\*\s*$/.exec(source[i]);
    }
    if ($) {
      name = $[1], lines = [];
      for (; ! ($ = /^\s*(i?)\*\/\]/.exec(source[i])); i++) {
        lines.push(source[i].replace(/\/\/.*$/, '').trim());
      }
      re[name] = new RegExp(lines.join("").replace(/ /g, ''), $[1] || "");
    }
  }
}

compileRegularExpressions();

// Extract an alternation range number or bit mask from at the current pattern
// substring given by `rest`.
function number (pattern, rest, index) {
  var match = re["number" /*
    ^               // start
    (                 // capture for length
      \s*               // skip white
      (?:
        \*                // any
        |
        (?:
          (\&?)             // test is mask
          0x([0-9a-f]+)     // hex
          |
          (\d+)             // decimal
        )
      )
    (-)?            // range
    ) 
    (.*)            // rest
    $               // end
  i*/].exec(rest);

  if (! match)
    throw new Error(error("invalid number", pattern, index));

  var matched = match[1], mask = match[2], hex = match[3],
    decimal = match[4], range = match[5], rest = match[6], value;

  if (hex != null) {
    value = parseInt(hex, 16);
  } else if (decimal != null) {
    value = parseInt(decimal, 10);
  }

  index += matched.length;

  return { any: value == null
         , mask: !! mask
         , value: value
         , index: index
         , range: range
         , rest: rest
         }
}

// Parse an alternation condition.
function condition (pattern, index, rest, struct) {
  var from = number(pattern, rest, index), match, num, to;
  if (from.mask) {
    if (from.range)
      throw new Error(error("masks not permitted in ranges", pattern, index));
    struct.mask = from.value;
    index = from.index;
  } else if (! from.any) {
    if (from.range) {
      if (from.mask)
        throw new Error(error("masks not permitted in ranges", pattern, from.index - 1));
      to = number(pattern, from.rest, from.index);
      if (to.mask)
        throw new Error(error("masks not permitted in ranges", pattern, from.index));
      if (to.any)
        throw new Error(error("any not permitted in ranges", pattern, from.index));
      struct.minimum = from.value;
      struct.maximum = to.value;
      index = to.index;
    } else {
      struct.minimum = struct.maximum = from.value;
      index = from.index;
    }
  } else if (from.range) {
    throw new Error(error("any not permitted in ranges", pattern, index));
  }
  num = to || from;
  if (match = /(\s*)\S/.exec(num.rest))
    throw new Error(error("invalid pattern", pattern, index + match[1].length));
  return index;
}

// An alternation condition that never matches. This is not a constant for the
// sake of consistancy with `always()`.
function never () {
  return {
    maximum: Number.MIN_VALUE,
    minimum: Number.MAX_VALUE
  }
}

// Generates an alternation condition that will always match. This is not a
// constant because we build upon it to create specific conditions.
function always () {
  return {
    maximum: Number.MAX_VALUE,
    minimum: Number.MIN_VALUE,
    mask: 0
  }
}

// Parse an alternation pattern.
function alternates (pattern, array, rest, primary, secondary, allowSecondary, index) {
  var alternate, $, startIndex;
  // Chip away at the pattern.
  while (rest) {
    alternate             = {}
    alternate[primary]    = always();
    alternate[secondary]  = allowSecondary ? always() : never();

    // Match the condition and the colon prior to the pattern. If this doesn't
    // match than we assume that we have a final, default pattern.
    if ($ = /^([^/:]+)(?:(\s*\/\s*)([^:]+))?(:\s*)(.*)$/.exec(rest)) {
      var first = $[1], delimiter = $[2], second = $[3], imparative = $[4], rest = $[5];

      startIndex = index;
      condition(pattern, index, first, alternate[primary]);

      // If we are allowing patterns to match write conditions, and we have a
      // write conidtion, parse the condition. Otherwise, the read and write
      // conditions are the same.
      if (allowSecondary) {
        if (second) {
          condition(pattern, index, second, alternate[secondary]);
        } else {
          alternate[secondary] = alternate[primary];
        }

      // If we do not allow patterns with write conditions, raise an exception if
      // one exists.
      } else if (second) {
        var slashIndex = startIndex + first.length + delimiter.indexOf("/");
        throw new Error(error("field alternates not allowed", pattern, slashIndex));
      }

      // Increment the index.
      index += first.length + imparative.length;
      if (delimiter != null) index += delimiter.length + second.length;
    }

    // Check to see if we have futher alternates.
    if ($ = /^(\s*)([^|]+)(\|\s*)(.*)$/.exec(rest)) {
      var padding = $[1], part = $[2], delimiter = $[3], rest = $[4];
    } else {
      var padding = "", part = rest, delimiter = "", rest = null;
    }
    index += padding.length;

    // Parse the altenate pattern.
    alternate.pattern = parse(pattern, part, index, 8);
    index += part.length + delimiter.length;

    // Record the alternate.
    array.push(alternate);
  }
}

// Parse a part of a pattern. The `next` regular expression is replaced when we
// match bit packing patterns, with a regular expression that excludes modifiers
// that are non-applicable to bit packing patterns.
function parse (pattern, part, index, bits, next) {
  var fields = [], lengthEncoded = false, rest, $;

  next = next || /^(-?)([xbl])(\d+)([fa]?)(.*)$/;

  // We chip away at the pattern, removing the parts we've matched, while keeping
  // track of the index separately for error messages.
  rest = part
  for (;;) {
    // Match a packet pattern.
    $ = next.exec(rest);

    // The 6th field is a trick to reuse this method for bit packing patterns
    // which are limited in what they can do. For bit packing the 5th pattern
    // will match the rest only if it begins with a comma or named field arrow,
    // otherwise it falls to the 6th which matches.
    if (!$)
      throw new Error(error("invalid pattern", pattern, index));
    if ($[6])
      throw new Error(error("invalid pattern", pattern, index + rest.length - $[6].length));

    // The remainder of the pattern, if any.
    rest = $[5]

    // Convert the match into an object.
    var f =
    { signed:     !!$[1] || $[4] == "f"
    , endianness: $[2] == 'n' ? 'b' : $[2]
    , bits:       parseInt($[3], 10)
    , type:       $[4] || 'n'
    };

    // Move the character position up to the bit count.
    if ($[1]) index++;
    index++;

    // Check for a valid character
    if (f.bits == 0)
      throw new Error(error("bit size must be non-zero", pattern, index));
    if (f.bits % bits)
      throw new Error(error("bit size must be divisible by " + bits, pattern, index));
    if (f.type == "f" && !(f.bits == 32 || f.bits == 64))
      throw Error(error("floats can only be 32 or 64 bits", pattern, index));

    // Move the character position up to the rest of the pattern.
    index += $[3].length;
    if ($[4]) index++;

    // Set the implicit fields. Unpacking logic is inconsistant between bits and
    // bytes, but not applicable for bits anyway.
    if (f.bits > 64 && f.type == "n") f.type = "a";
    f.bytes = f.bits / bits
    f.exploded = f.signed || f.bytes > 8 || ~"ha".indexOf(f.type);


    // Check for bit backing. The intense rest pattern in the regex allows us to
    // skip over a nested padding specifier in the bit packing pattern, nested
    // curly brace matching for a depth of one.
    if ($ = /^{((?:-b|b|x)(?:[^{}]+|{[^}]+})+)}(\s*,.*|\s*)$/.exec(rest)) {
      index++

      var packIndex = index;

      f.packing   = parse(pattern, $[1], index, 1, re["pack" /*
        ^       // start
        (-?)    // sign
        ([xb])  // skip or big-endian
        (\d+)   // bits
        ()      // never a modifier
        (       // valid tokens following size
          \s*     // optional whitespace followed by
          (?:
            ,     // a comma to continue the pattern
            |
            =>    // a name specifier
            |
            {\d   // a fill character specifier
          )
          .*    // the rest of the pattern
          |
        )
        (.*)    // match everything if the previous match misses
        $
      */]);
      rest = $[2];
      index += $[1].length + 1;

      // Check that the packed bits sum up to the size of the field into which
      // they are packed.
      var sum = f.packing.reduce(function (x, y) { return x + y.bits }, 0);

      if (sum < f.bits)
        throw new Error(error("bit pack pattern underflow", pattern, packIndex));

      if (sum > f.bits)
        throw new Error(error("bit pack pattern overflow", pattern, packIndex));

    // Check for alternation.
    } else if ($ = /^\(([^)]+)\)(.*)$/.exec(rest)) {
      f.arrayed     = true;
      var read      = $[1];
      rest          = $[2];
      var write     = null;

      // See if there is a full write pattern. If not, then the pattern will be
      // the same for reads and writes, but with possible different conditions
      // for write to match an alternate.
      if ($ = /^(\s*\/\s*)\(([^)]+)\)(.*)$/.exec(rest)) {
        var slash = $[1], write = $[2], rest = $[3];
      }

      // Parse the primary alternation pattern.
      index += 1
      alternates(pattern, f.alternation = [], read, "read", "write", ! write, index);
      index += read.length + 1;

      // Parse the full write alternation pattern, if we have one.
      if (write) {
        index += slash.length + 1
        alternates(pattern, f.alternation, write, "write", "read", false, index);
        index += write.length
      }

      // This condition will catch all, and let us know that no condition
      // matched.
      f.alternation.push({
        read: always(), write: always(), failed: true
      });

    // Neither bit packing nor alternation.
    } else{
      // Check if this is a length encoding.
      if ($ = /^\/(.*)$/.exec(rest)) {
        index++;
        f.lengthEncoding = true;
        rest = $[1];
        f.arrayed = false;
        f.repeat = 1;
        lengthEncoded = true;
        fields.push(f);
        // Nothing else can apply to a length encoding.
        continue;
      }

      f.repeat = 1;
      f.arrayed = lengthEncoded;
      if (! lengthEncoded) {
        // Check for structure modifiers.
        if ($ = /^\[(\d+)\](.*)$/.exec(rest)) {
          f.arrayed = true
          f.repeat = parseInt($[1], 10)
          index++
          if (f.repeat == 0)
            throw new Error(error("array length must be non-zero", pattern, index));
          index += $[1].length + 1
          rest = $[2]
        }
      }

      // Check for a padding value.
      if ($ = /^({\s*)((0x|0)?([a-f\d]+)\s*})(.*)$/i.exec(rest)) {
        var before = $[1], after = $[2], base = $[3], pad = $[4], rest = $[5];
        index += before.length;
        if ((f.padding = numeric(base, pad)) == null) {
          throw new Error(error("invalid number format", pattern, index));
        }
        index += after.length;
      }

      // Check for zero termination.
      if ($ = /^z(?:<(.*?)>)?(.*)$/.exec(rest)) {
        index++
        rest = $[2];
        if ($[1] != null) {
          index++;
          f.terminator = [];
          var terminator = $[1];
          for (;;) {
            $ = re["terminator" /*
              ^         // start
              (\s*)     // skip whitespace
              (?:
                0x([A-F-a-f00-9]{2})  // hex
                |
                (\d+)                 // decimal
              )
              (\s*,)?   // separtor for next character
              (.*)      // rest
              $         // end
            */].exec(terminator);
            if (!$)
              throw new Error(error("invalid terminator", pattern, index));
            var before = $[1], hex = $[2], decimal = $[3], comma = $[4], terminator = $[5];
            index += before.length;
            var numberIndex = index;
            if (hex) {
              var value = parseInt(hex, 16);
              index += hex.length + 2;
            } else {
              var value = parseInt(decimal, 10);
              index += decimal.length;
            }
            if (value > 255)
              throw new Error(error("terminator value out of range", pattern, numberIndex));
            f.terminator.push(value);
            if (/\S/.test(terminator) && ! comma)
              throw new Error(error("invalid pattern", pattern, index));
            if (! comma) {
              index += terminator.length
              break
            }
            index += comma.length;
          }
          index++;
        } else {
          f.terminator = [ 0 ];
        }
        f.arrayed = true;
        if (f.repeat == 1) f.repeat = Number.MAX_VALUE;
      }

      // Parse piplines.
      while ($ = /^\|(\w[\w\d]*)\((\)?)(.*)/.exec(rest)) {
        index          += rest.length - $[3].length;
        var transform       = { name: $[1], parameters: [] };
        rest            = $[3];
        var hasArgument     = ! $[2];

        // Regular expression to match a pipeline argument, expressed as a
        // JavaScript scalar, taken in part from
        // [json2.js](http://www.JSON.org/json2.js). 
        while (hasArgument) {
          $ = re["scalar" /*
            ( '(?:[^\\']|\\.)+'|"(?:[^\\"]|\\.)+"   // string
            | true | false                          // boolean
            | null                                  // null
            | -?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?     // number
            )    
            (\s*,\s*|\s*\))?                        // remaining arguments
            (.*)                                    // remaining pattern
          */].exec(rest);
          index += rest.length - $[3].length;
          value = eval($[1]); 
          hasArgument = $[2].indexOf(")") == -1;
          rest = $[3];

          transform.parameters.push(value)
        }

        if (!f.pipeline) f.pipeline = [];
        f.pipeline.push(transform)
      }

      // Named pattern.
      if ($ = /^\s*=>\s*(\w[\w\d]*)\s*(.*)/.exec(rest)) {
        index += rest.length - $[2].length;
        f.name = $[1];
        rest = $[2];
      }
    }

    // Record the new field pattern object.
    fields.push(f);

    // A comma indicates that we're to continue.
    if (!($ = /^(\s*,\s*)(.*)$/.exec(rest))) break;

    // Reset for the next iteration.
    index += $[1].length;
    rest = $[2];
    lengthEncoded = false
  }
  if (/\S/.test(rest))
    throw  new Error(error("invalid pattern", pattern, index));

  return fields;
}

//#### parse(pattern)
// Parse a pattern and create a list of fields.

// The `pattern` is the pattern to parse.
module.exports.parse = function (pattern) {
  var part = pattern.replace(/\n/g, " ").replace(/^\s+/, "")
    , index = pattern.length - part.length;
  return parse(pattern, part, index, 8);
}
