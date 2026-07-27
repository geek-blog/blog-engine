const CSS_FONT_FAMILY = /font-family\s*:\s*((?:(?:&(?:quot|apos);)|[^;}])+)/gi;
const SVG_FONT_FAMILY = /\sfont-family\s*=\s*(['"])(.*?)\1/gi;

const normalizeCss = (declaration, value, family) => (
  declaration.replace(value, `'${family}'`)
);

export const normalizeMermaidFontFamily = (svg, allowedFamily) => svg
  .replace(CSS_FONT_FAMILY, (declaration, value) => (
    normalizeCss(declaration, value, allowedFamily)
  ))
  .replace(
    SVG_FONT_FAMILY,
    (attribute, _quote, value) => attribute.replace(value, allowedFamily),
  );
