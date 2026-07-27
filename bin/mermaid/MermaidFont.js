import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const packageName = '@fontsource/noto-sans';
const stylesheetName = '400.css';
const packageJson = require(`${packageName}/package.json`);
const packageRoot = path.dirname(require.resolve(`${packageName}/${stylesheetName}`));
const dataUrls = new Set();

const inlineWoff2 = css => css.replace(
  /url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g,
  (_source, filename) => {
    const bytes = fs.readFileSync(path.join(packageRoot, 'files', filename));
    const dataUrl = `data:font/woff2;base64,${bytes.toString('base64')}`;
    dataUrls.add(dataUrl);
    return `url(${dataUrl}) format('woff2')`;
  },
);

const sourceCss = fs.readFileSync(path.join(packageRoot, stylesheetName), 'utf8');

export const MERMAID_FONT_FAMILY = 'Noto Sans';
export const MERMAID_FONT_CSS = inlineWoff2(sourceCss);
export const MERMAID_FONT_PAGE_CSS = [
  MERMAID_FONT_CSS,
  `#container * { font-family: '${MERMAID_FONT_FAMILY}' !important; }`,
].join('\n');
export const MERMAID_FONT_DATA_URLS = Object.freeze([...dataUrls]);
export const createMermaidFontSvgCss = svgId => [
  MERMAID_FONT_CSS,
  `#${svgId} * { font-family: '${MERMAID_FONT_FAMILY}' !important; }`,
].join('\n');
export const MERMAID_FONT_IDENTITY = Object.freeze({
  package: packageName,
  version: packageJson.version,
  stylesheet: stylesheetName,
  sha256: createHash('sha256')
    .update(`${MERMAID_FONT_PAGE_CSS}\0${createMermaidFontSvgCss('svg-id')}`)
    .digest('hex'),
});

if (!MERMAID_FONT_DATA_URLS.length || MERMAID_FONT_CSS.includes('./files/')) {
  throw new Error('Unable to inline the deterministic Mermaid font.');
}

const loadFonts = async family => {
  const faces = [...document.fonts].filter(face => face.family.replaceAll('"', '') === family);
  await Promise.all(faces.map(face => face.load()));
  return faces.length > 0 && faces.every(face => face.status === 'loaded');
};

const installOnPage = page => {
  const goto = page.goto.bind(page);
  page.goto = async (...args) => {
    const response = await goto(...args);
    await page.addStyleTag({ content: MERMAID_FONT_PAGE_CSS });
    const loaded = await page.evaluate(loadFonts, MERMAID_FONT_FAMILY);
    if (!loaded) throw new Error(`Unable to load deterministic Mermaid font: ${MERMAID_FONT_FAMILY}`);
    return response;
  };
  return page;
};

const installed = new WeakSet();

export const installMermaidFont = browser => {
  if (installed.has(browser) || typeof browser.newPage !== 'function') return browser;
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (...args) => installOnPage(await newPage(...args));
  installed.add(browser);
  return browser;
};
