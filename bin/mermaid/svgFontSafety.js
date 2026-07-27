const CSS_FONT_FAMILY = /font-family\s*:\s*((?:(?:&(?:quot|apos);)|[^;}])+)/gi;
const CSS_FONT_SHORTHAND = /(?:^|[;{"'])\s*font\s*:/i;
const SVG_FONT_FAMILY = /\sfont-family\s*=\s*(['"])(.*?)\1/gi;

const normalizeCss = (declaration, value, family) => (
  declaration.replace(value, `'${family}'`)
);

export class UnsupportedMermaidFontShorthandError extends Error {
  constructor() {
    super('Unsupported Mermaid font shorthand');
    this.name = 'UnsupportedMermaidFontShorthandError';
  }
}

export const normalizeMermaidFontFamily = (svg, allowedFamily) => {
  if (CSS_FONT_SHORTHAND.test(svg)) throw new UnsupportedMermaidFontShorthandError();
  return svg.replace(CSS_FONT_FAMILY, (declaration, value) => (
    normalizeCss(declaration, value, allowedFamily)
  )).replace(
    SVG_FONT_FAMILY,
    (attribute, _quote, value) => attribute.replace(value, allowedFamily),
  );
};
