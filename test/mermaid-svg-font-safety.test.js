import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMermaidFontFamily } from '../bin/mermaid/svgFontSafety.js';

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
