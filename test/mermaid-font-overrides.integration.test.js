import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { MermaidBuildSession } from '../bin/mermaid/MermaidBuildSession.js';

const fixture = new URL('./fixtures/hostile-fonts.json', import.meta.url);
const hostileFontDefinitions = JSON.parse(fs.readFileSync(fixture, 'utf8'));

test('nested configuration and styles cannot bypass the pinned font', {
  timeout: 120_000,
}, async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'geek-blog-hostile-font-'));
  const session = new MermaidBuildSession({ projectRoot: root, basePath: '/' });
  t.after(() => fs.rmSync(root, { force: true, recursive: true }));
  t.after(() => session.abort());

  for (const [index, markdown] of hostileFontDefinitions.entries()) {
    await assert.rejects(
      session.transform({
        markdown,
        sourcePath: `content/pages/hostile-font-${index + 1}.md`,
        title: 'Hostile font',
      }),
      /Unsupported Mermaid font override/,
    );
  }
});
