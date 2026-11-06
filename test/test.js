'use strict';


var assert   = require('assert');
var path     = require('path');
var generate = require('markdown-it-testgen');

/*eslint-env mocha*/

describe('markdown-it-deflist', function () {
  var md = require('markdown-it')()
    .use(require('../'));

  generate(path.join(__dirname, 'fixtures/deflist.txt'), md);
});

describe('markdown-it-deflist dt position', function () {
  var md = require('markdown-it')()
    .use(require('../'));

  // Returns the source slice covered by each dt inline token.
  function termRanges(src) {
    var tokens = md.parse(src, {});

    return tokens.filter(function (token, idx) {
      return token.type === 'inline' && idx > 0 && tokens[idx - 1].type === 'dt_open';
    }).map(function (token) {
      return src.slice(token.position, token.position + token.size);
    });
  }

  it('points every term at its own line', function () {
    assert.deepStrictEqual(
      termRanges('Term 1\n: def one\n\nTerm 2 **bold**\n: def two\n\nTerm 3\n: def three\n'),
      [ 'Term 1', 'Term 2 **bold**', 'Term 3' ]
    );
  });

  it('handles a term following multiple dds', function () {
    assert.deepStrictEqual(
      termRanges('Term 1\n: def a\n: def b\n\nTerm 2\n: def c\n'),
      [ 'Term 1', 'Term 2' ]
    );
  });

  it('excludes leading indentation and trailing spaces from the range', function () {
    assert.deepStrictEqual(
      termRanges('  Indented term  \n: def\n'),
      [ 'Indented term' ]
    );
  });

  it('skips the list marker for terms nested in a list item', function () {
    assert.deepStrictEqual(
      termRanges('- Term A\n  : def a\n\n  Term B\n  : def b\n'),
      [ 'Term A', 'Term B' ]
    );
  });

  it('skips the blockquote marker', function () {
    assert.deepStrictEqual(
      termRanges('> Term A\n> : def a\n>\n> Term B\n> : def b\n'),
      [ 'Term A', 'Term B' ]
    );
  });
});
