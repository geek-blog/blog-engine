import assert from 'node:assert/strict';
import test from 'node:test';
import {
  installMermaidFont,
  MERMAID_FONT_CSS,
  MERMAID_FONT_DATA_URLS,
  MERMAID_FONT_FAMILY,
  MERMAID_FONT_PAGE_CSS,
} from '../bin/mermaid/MermaidFont.js';
import { MermaidRenderer } from '../bin/mermaid/MermaidRenderer.js';

const createBrowser = loaded => {
  const events = [];
  const page = {
    addStyleTag: async ({ content }) => events.push(['style', content]),
    evaluate: async (_callback, family) => {
      events.push(['evaluate', family]);
      return loaded;
    },
    goto: async url => {
      events.push(['goto', url]);
      return 'response';
    },
  };
  return {
    browser: { newPage: async () => page },
    events,
  };
};

test('inlines pinned font subsets and loads them after navigation', async () => {
  const { browser, events } = createBrowser(true);

  assert.equal(installMermaidFont(browser), browser);
  assert.equal(installMermaidFont(browser), browser);
  const response = await (await browser.newPage()).goto('file:///renderer.html');

  assert.equal(response, 'response');
  assert.deepEqual(events.map(([name]) => name), ['goto', 'style', 'evaluate']);
  assert.equal(events[1][1], MERMAID_FONT_PAGE_CSS);
  assert.equal(events[2][1], MERMAID_FONT_FAMILY);
  assert.ok(MERMAID_FONT_DATA_URLS.length >= 8);
  assert.match(MERMAID_FONT_PAGE_CSS, /#container \*/);
  assert.doesNotMatch(MERMAID_FONT_CSS, /\.\/files\//);
});

test('fails rendering when the deterministic font cannot load', async () => {
  const { browser } = createBrowser(false);
  const page = await installMermaidFont(browser).newPage();

  await assert.rejects(
    page.goto('file:///renderer.html'),
    /Unable to load deterministic Mermaid font: Noto Sans/,
  );
});

test('rejects source font overrides before launching a browser', async () => {
  let launches = 0;
  const renderer = new MermaidRenderer({
    browserLauncher: () => {
      launches += 1;
      return {};
    },
  });

  await assert.rejects(
    renderer.render('flowchart LR\nclassDef x font:16px HostileFont', {}),
    /Unsupported Mermaid font override: font/,
  );
  assert.equal(launches, 0);
});
