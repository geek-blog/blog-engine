import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { StaticRouteEmitter } from '../src/vite/StaticRouteEmitter.js';

const fixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'static-routes-'));
  fs.mkdirSync(path.join(root, 'content'));
  fs.mkdirSync(path.join(root, 'dist'));
  fs.writeFileSync(path.join(root, 'dist', 'index.html'), '<head><title>Blog Engine</title></head>');
  fs.writeFileSync(path.join(root, 'content', 'posts.js'),
    'export const posts = [{ slug: "hello", title: "Hi <there>", excerpt: "Post summary" }];');
  fs.writeFileSync(path.join(root, 'content', 'pages.js'), 'export const pages = [{ slug: "about", title: "About" }];');
  return root;
};

test('emits a 200-able HTML file per post and page route with title and description', async () => {
  const root = fixture();
  await new StaticRouteEmitter(root, { siteName: 'Site', description: 'Site desc' }).emit();
  const post = fs.readFileSync(path.join(root, 'dist', 'hello', 'index.html'), 'utf8');
  assert.match(post, /<title>Hi &lt;there&gt; \| Site<\/title>/);
  assert.match(post, /<meta name="description" content="Post summary" \/>/);
  assert.equal(fs.readFileSync(path.join(root, 'dist', 'hello.html'), 'utf8'), post);
  const page = fs.readFileSync(path.join(root, 'dist', 'about', 'index.html'), 'utf8');
  assert.match(page, /content="Site desc"/);
});
