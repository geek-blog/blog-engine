import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeMermaidFontFamily,
  UnsupportedMermaidFontShorthandError,
} from '../bin/mermaid/svgFontSafety.js';

test('accepts only the pinned family in CSS and SVG attributes', () => {
  const safe = '<svg font-family="Noto Sans"><style>text{font-family:\'Noto Sans\'}</style></svg>';
  const cssOverride = '<svg><style>text{font-family:Noto Sans, HostileFont}</style></svg>';
  const attributeOverride = '<svg><text font-family="HostileFont">Unsafe</text></svg>';

  assert.equal(
    normalizeMermaidFontFamily(safe, 'Noto Sans'),
    '<svg font-family="Noto Sans"><style>text{font-family:\'Noto Sans\'}</style></svg>',
  );
  assert.equal(
    normalizeMermaidFontFamily(cssOverride, 'Noto Sans'),
    '<svg><style>text{font-family:\'Noto Sans\'}</style></svg>',
  );
  assert.equal(
    normalizeMermaidFontFamily(attributeOverride, 'Noto Sans'),
    '<svg><text font-family="Noto Sans">Unsafe</text></svg>',
  );
});

test('removes generic fallbacks and handles XML-encoded family quotes', () => {
  const source = '<svg><style>text{font-family:&quot;Noto Sans&quot;,sans-serif}</style></svg>';
  const expected = '<svg><style>text{font-family:\'Noto Sans\'}</style></svg>';

  assert.equal(normalizeMermaidFontFamily(source, 'Noto Sans'), expected);
});

test('rejects font shorthand before it can override measurement policy', () => {
  const inline = '<svg><text style="font:16px HostileFont !important">Unsafe</text></svg>';
  const stylesheet = '<svg><style>.hostile{font:16px HostileFont}</style></svg>';
  const comment = '<svg><style>.hostile{font/**/:16px HostileFont!important}</style></svg>';
  const escape = '<svg><style>.hostile{f\\6f nt:16px HostileFont!important}</style></svg>';
  const mixed = [
    '<svg><style>.safe{fill:red}</style>',
    '<rect style="font/**/:16px HostileFont!important"/></svg>',
  ].join('');

  assert.throws(
    () => normalizeMermaidFontFamily(inline, 'Noto Sans'),
    UnsupportedMermaidFontShorthandError,
  );
  assert.throws(
    () => normalizeMermaidFontFamily(stylesheet, 'Noto Sans'),
    UnsupportedMermaidFontShorthandError,
  );
  assert.throws(
    () => normalizeMermaidFontFamily(comment, 'Noto Sans'),
    UnsupportedMermaidFontShorthandError,
  );
  assert.throws(
    () => normalizeMermaidFontFamily(escape, 'Noto Sans'),
    UnsupportedMermaidFontShorthandError,
  );
  assert.throws(
    () => normalizeMermaidFontFamily(mixed, 'Noto Sans'),
    UnsupportedMermaidFontShorthandError,
  );
});
