const CSS_FONT_FAMILY = /font-family\s*:\s*((?:(?:&(?:quot|apos);)|[^;}])+)/gi;
const CSS_FONT_SHORTHAND = /(?:^|[;{])\s*font\s*:/im;
const SVG_FONT_FAMILY = /\sfont-family\s*=\s*(['"])(.*?)\1/gi;

const decodeNumericEntities = value => value.replace(
  /&#(?:x([0-9a-f]+)|([0-9]+));?/gi,
  (_entity, hex, decimal) => String.fromCodePoint(
    Number.parseInt(hex || decimal, hex ? 16 : 10),
  ),
);

const decodeCssEscapes = value => value
  .replace(/\\\r?\n/g, '')
  .replace(/\\([0-9a-f]{1,6})(?:[ \t\r\n\f])?|\\(.)/gi, (_escape, hex, character) => (
    hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : character
  ));

const decodeUnicodeEscapes = value => value.replace(
  /\\u([0-9a-f]{4})/gi,
  (_escape, hex) => String.fromCodePoint(Number.parseInt(hex, 16)),
);

const normalizeCssText = value => decodeCssEscapes(
  decodeUnicodeEscapes(decodeNumericEntities(value)),
).replace(/\/\*[\s\S]*?\*\//g, '');

const normalizedCss = svg => {
  const styles = [...svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]);
  const attributes = [...svg.matchAll(/\sstyle\s*=\s*(['"])([\s\S]*?)\1/gi)].map(match => match[2]);
  return normalizeCssText([...styles, ...attributes].join('\n'));
};

const normalizeCss = (declaration, value, family) => (
  declaration.replace(value, `'${family}'`)
);

export class UnsupportedMermaidFontShorthandError extends Error {
  constructor() {
    super('Unsupported Mermaid font shorthand');
    this.name = 'UnsupportedMermaidFontShorthandError';
  }
}

export class UnsupportedMermaidFontDefinitionError extends Error {
  constructor(property) {
    super(`Unsupported Mermaid font override: ${property}`);
    this.name = 'UnsupportedMermaidFontDefinitionError';
  }
}

const FONT_OVERRIDE = /(?:\b[\w-]*fontfamily|\bfont-family|\bfont|\ball)\s*:/i;

export const assertDeterministicMermaidDefinition = definition => {
  const normalized = normalizeCssText(definition).replace(/["']/g, '');
  const property = normalized.match(FONT_OVERRIDE)?.[0];
  if (property) throw new UnsupportedMermaidFontDefinitionError(property.slice(0, -1));
};

export const normalizeMermaidFontFamily = (svg, allowedFamily) => {
  if (CSS_FONT_SHORTHAND.test(normalizedCss(svg))) {
    throw new UnsupportedMermaidFontShorthandError();
  }
  return svg.replace(CSS_FONT_FAMILY, (declaration, value) => (
    normalizeCss(declaration, value, allowedFamily)
  )).replace(
    SVG_FONT_FAMILY,
    (attribute, _quote, value) => attribute.replace(value, allowedFamily),
  );
};
