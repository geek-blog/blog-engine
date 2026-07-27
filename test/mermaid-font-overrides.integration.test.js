import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { MermaidBuildSession } from '../bin/mermaid/MermaidBuildSession.js';

const enabled = process.env.GEEK_BLOG_REAL_MERMAID_TESTS === '1';
const fixture = new URL('./fixtures/hostile-fonts.json', import.meta.url);
const hostileFontDefinitions = JSON.parse(fs.readFileSync(fixture, 'utf8'));

test('nested configuration and styles cannot bypass the pinned font', {
  skip: !enabled && 'set GEEK_BLOG_REAL_MERMAID_TESTS=1 to launch Chromium',
  timeout: 120_000,
}, async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'geek-blog-hostile-font-'));
  const session = new MermaidBuildSession({ projectRoot: root, basePath: '/' });
  t.after(() => fs.rmSync(root, { force: true, recursive: true }));
  t.after(() => session.abort());

  for (const [index, markdown] of hostileFontDefinitions.entries()) {
    try {
      await session.transform({
        markdown,
        sourcePath: `content/pages/hostile-font-${index + 1}.md`,
        title: 'Hostile font',
      });
    } catch (error) {
      assert.match(error.message, /Unsafe Mermaid SVG output/);
      continue;
    }
    const staging = await session.prepareForCommit();
    for (const filename of fs.readdirSync(staging)) {
      assert.doesNotMatch(fs.readFileSync(path.join(staging, filename), 'utf8'), /HostileFont/);
    }
  }
});
