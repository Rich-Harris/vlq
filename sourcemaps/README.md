# Using vlq.js with source maps

This library doesn't include any special magic for dealing with source maps, just the low-level encoding/decoding. But it's actually fairly straightforward to convert an incomprehensible-looking string like this...

```
AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA
```

...into an array of mappings. (A source map is a JSON object with a number of properties, including `mappings`, which is a string like the one above. [You can find the spec here.](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1))

Suppose we had some CoffeeScript code:

** helloworld.coffee **
```coffee
console.log 'hello world'
```

It would get transpiled into this:

** helloworld.js **
```js
(function() {
  console.log('hello world');

}).call(this);
```

The long mapping string above instructs browsers (and other source map consumers) which bits of `helloworld.js` correspond to which bits of `helloworld.coffee`. Each line in the generated JavaScript is represented as a series of VLQ-encoded *segments*, separated by the `,` character. The lines themselves are separated by `;` characters. So we could represent the mapping like so:

```js
mappings = 'AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA';
vlqs = mappings.split( ';' ).map( function ( line ) {
	return line.split( ',' );
});

[
	// line 0 of helloworld.js (everything is zero-based)
	[ 'AAAA' ],

	// line 1
	[ 'AAAA', 'EAAA', 'OAAO', 'CAAC', 'GAAR', 'CAAY', 'aAAZ', 'CAAA', 'CAAA' ],

	// line 2
	[ 'AAAA' ]
]
```

Using vlq.js to decode each segment, we can convert that into the following:

```js
decoded = vlqs.map( function ( line ) {
	return line.map( vlq.decode );
});

[
  // line 0
  [ [ 0, 0, 0, 0 ] ],

  // line 1
  [
    [ 0, 0, 0, 0 ],
    [ 2, 0, 0, 0 ],
    [ 7, 0, 0, 7 ],
    [ 1, 0, 0, 1 ],
    [ 3, 0, 0, -8 ],
    [ 1, 0, 0, 12 ],
    [ 13, 0, 0, -12 ],
    [ 1, 0, 0, 0 ],
    [ 1, 0, 0, 0 ]
  ],

  // line 2
  [ [ 0, 0, 0, 0 ] ]
]
```

Each segment has 4 *fields* in this case, though the [spec](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1) allows segments to have either 1, 4 or 5 fields (in other words, 2, 3, 4 and 5 below are optional - in our CoffeeScript example, the fifth field is never used). They are:

1. The zero-based starting column of the current line. If this is the first segment of the line, it's absolute, otherwise it's relative to the same field in the previous segment.
2. The zero-based index of the original **source file**, as listed in the source map object's `sources` array (since the generated code may be the result of combining several files), *relative to the previous value*.
3. The zero-based starting **line** in the original source code that this segment corresponds to, *relative to the previous value*.
4. The zero-based starting **column** in the original source code that this segment corresponds to, *relative to the previous value*.
5. The zero-based index of the **name**, as listed in the source map object's `names` array, that this mapping corresponds to, *relative to the previous value*. (This isn't used here because no names are changed, but it's useful when minifying JavaScript, since `myVeryLongVarName` will get changed to `a` or similar.)

We can now decode our mappings a bit further:

```js
var sourceFileIndex = 0,
    sourceCodeLine = 0,
    sourceCodeColumn = 0,
    nameIndex = 0;

decoded = decoded.map( function ( line ) {
  var generatedCodeColumn = 0; // reset each time

  return line.map( function ( segment ) {
    var result;

    generatedCodeColumn += segment[0];

    result = [ generatedCodeColumn ];

    if ( segment.length === 1 ) {
      // only one field!
      return result;
    }

    sourceFileIndex  += segment[1];
    sourceCodeLine   += segment[2];
    sourceCodeColumn += segment[3];

    result.push( sourceFileIndex, sourceCodeLine, sourceCodeColumn );

    if ( segment.length === 5 ) {
      nameIndex += segment[4];
      result.push( nameIndex );
    }

    return result;
  });
});

[
  // line 0
  [ [ 0, 0, 0, 0 ] ],

  // line 1
  [
    [ 0, 0, 0, 0 ],
    [ 2, 0, 0, 0 ],
    [ 9, 0, 0, 7 ],
    [ 10, 0, 0, 8 ],
    [ 13, 0, 0, 0 ],
    [ 14, 0, 0, 12 ],
    [ 27, 0, 0, 0 ],
    [ 28, 0, 0, 0 ],
    [ 29, 0, 0, 0 ]
  ],

  // line 2
  [ [ 0, 0, 0, 0 ] ]
]
```

The first and third lines don't really contain any interesting information. But the second line does. Let's take the first three segments:

```js
// line 1 (the second line - still zero-based, remember)
[
  // Column 0 of line 1 corresponds to source file 0, line 0, column 0
  [ 0, 0, 0, 0 ],

  // Column 2 of line 1 also corresponds to 0, 0, 0! In other words, the
  // two spaces before `console` in helloworld.js don't correspond to
  // anything in helloworld.coffee
  [ 2, 0, 0, 0 ],

  // Column 9 of line 1 corresponds to 0, 0, 7. Taken together with the
  // previous segment, this means that columns 2-9 of line 1 in the
  // generated helloworld.js file correspond to columns 0-7 of line 0
  // in the original helloworld.coffee
  [ 9, 0, 0, 7 ],

  ...
]
```

It's through this fairly convoluted process that your browser (assuming it's one of the good ones) is able to read `helloworld.js` and an accompanying source map (typically `helloworld.js.map`) and do this:

### Chrome

<img src='https://github.com/Rich-Harris/vlq/blob/master/sourcemaps/Chrome.png'>

### Firefox

<img src='https://github.com/Rich-Harris/vlq/blob/master/sourcemaps/Firefox.png'>

You can try this for yourself by cloning this repo and opening the `sourcemaps/index.html` file.