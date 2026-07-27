import { renderMermaid } from '@mermaid-js/mermaid-cli';
import puppeteer from 'puppeteer';
import { ConcurrencyQueue } from './ConcurrencyQueue.js';
import {
  createMermaidFontSvgCss,
  installMermaidFont,
  MERMAID_FONT_DATA_URLS,
  MERMAID_FONT_FAMILY,
} from './MermaidFont.js';
import { installMermaidRequestPolicy } from './MermaidRequestPolicy.js';
import { MERMAID_BACKGROUND } from './renderPolicy.js';
import { normalizeMermaidSvgDimensions } from './svgDimensions.js';
import {
  assertDeterministicMermaidDefinition,
  normalizeMermaidFontFamily,
} from './svgFontSafety.js';
import { assertSafeMermaidSvg, sanitizeMermaidSvg } from './svgSafety.js';

const launchBrowser = () => puppeteer.launch();
const toSvg = data => new TextDecoder().decode(data);

export class MermaidRenderer {
  constructor({
    renderer = renderMermaid,
    browserLauncher = launchBrowser,
    concurrency = 2,
  } = {}) {
    this.renderer = renderer;
    this.browserLauncher = browserLauncher;
    this.queue = new ConcurrencyQueue(concurrency);
  }

  render(definition, spec) {
    return this.queue.run(() => this.#render(definition, spec));
  }

  async close() {
    if (!this.browserPromise) return;
    const browser = await this.browserPromise.catch(() => null);
    await browser?.close();
    this.browserPromise = null;
  }

  async #render(definition, spec) {
    assertDeterministicMermaidDefinition(definition);
    this.browserPromise ??= Promise.resolve(this.browserLauncher())
      .then(installMermaidRequestPolicy)
      .then(installMermaidFont);
    const browser = await this.browserPromise;
    const result = await this.renderer(browser, definition, 'svg', {
      backgroundColor: MERMAID_BACKGROUND,
      mermaidConfig: spec.mermaidConfig,
      myCSS: createMermaidFontSvgCss(spec.svgId),
      svgId: spec.svgId,
    });
    const sanitized = sanitizeMermaidSvg(toSvg(result.data));
    const fontNormalized = normalizeMermaidFontFamily(sanitized, MERMAID_FONT_FAMILY);
    const svg = normalizeMermaidSvgDimensions(fontNormalized);
    assertSafeMermaidSvg(svg, { allowedCssResources: MERMAID_FONT_DATA_URLS });
    return { svg, desc: result.desc, title: result.title };
  }
}
