import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ENGINE_REPOSITORY } from '../bin/workspace/constants.js';
import { digestText } from '../bin/workspace/files.js';

const signature = '1234567890abcdef';
const version = `1.0.0+${signature.slice(0, 8)}`;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'ignore' });

const createSource = (root, cache) => {
  const key = digestText(ENGINE_REPOSITORY).slice(0, 16);
  const seed = path.join(root, 'source-seed');
  fs.mkdirSync(seed);
  writeJson(path.join(seed, 'package.json'), { name: 'blog-engine', version: '1.0.0' });
  git(seed, 'init', '--quiet');
  git(seed, 'config', 'user.email', 'test@example.com');
  git(seed, 'config', 'user.name', 'Test');
  git(seed, 'remote', 'add', 'origin', ENGINE_REPOSITORY);
  git(seed, 'add', 'package.json');
  git(seed, 'commit', '--quiet', '-m', 'fixture');
  const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: seed, encoding: 'utf8' }).stdout.trim();
  const source = path.join(cache, 'sources', key, commit);
  fs.mkdirSync(path.dirname(source), { recursive: true });
  fs.renameSync(seed, source);
  return { commit, source };
};

const createProject = root => {
  const project = path.join(root, 'project');
  fs.mkdirSync(project);
  writeJson(path.join(project, 'package.json'), {
    dependencies: { 'blog-engine': 'file:.yalc/blog-engine' },
  });
  writeJson(path.join(project, 'package-lock.json'), {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { 'blog-engine': 'file:.yalc/blog-engine' } },
      '.yalc/blog-engine': { version },
      'node_modules/blog-engine': { resolved: '.yalc/blog-engine' },
    },
  });
  fs.writeFileSync(path.join(project, '.gitignore'), '.yalc/\nyalc.lock\n.geek-blog/\nnode_modules/\n');
  git(project, 'init', '--quiet');
  git(project, 'add', 'package.json', 'package-lock.json', '.gitignore');
  return project;
};
const createCommands = (root, corruptPackage) => {
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  const npx = `#!/usr/bin/env node
const fs=require('fs'),path=require('path');if(!process.argv.includes('add'))process.exit(0);
const target=path.join(process.cwd(),'.yalc','blog-engine');fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(path.join(target,'bin'),{recursive:true});
const manifest={name:'blog-engine',version:'${version}',yalcSig:'${signature}'};
fs.writeFileSync(path.join(target,'package.json'),JSON.stringify(manifest));
fs.writeFileSync(path.join(target,'yalc.sig'),'${signature}');
fs.writeFileSync(path.join(target,'bin','blog-engine.js'),'');
const lock={packages:{'blog-engine':{signature:'${signature}'}}};
fs.writeFileSync(path.join(process.cwd(),'yalc.lock'),JSON.stringify(lock));`;
  const npm = `#!/usr/bin/env node
const fs=require('fs'),path=require('path');if(!process.argv.includes('ci'))process.exit(0);
const engine=path.join(process.cwd(),'.yalc','blog-engine');
const installed=[path.join(engine,'node_modules','dependency'),
path.join(process.cwd(),'node_modules','blog-engine','bin')];
for(const target of installed)fs.mkdirSync(target,{recursive:true});
fs.writeFileSync(path.join(installed[0],'index.js'),'installed');
${corruptPackage ? "fs.writeFileSync(path.join(engine,'bin','blog-engine.js'),'corrupt');" : ''}
fs.writeFileSync(path.join(installed[1],'blog-engine.js'),'');`;
  for (const [name, script] of Object.entries({ npx, npm })) {
    fs.writeFileSync(path.join(bin, name), script);
    fs.chmodSync(path.join(bin, name), 0o755);
  }
  return bin;
};

export const withWorkspaceIntegrityFixture = (callback, options = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'geek-blog-integrity-'));
  const cache = path.join(root, 'cache');
  const { commit, source } = createSource(root, cache);
  const project = createProject(root);
  const lock = { engine: { commit, package: 'blog-engine', repository: ENGINE_REPOSITORY } };
  const previous = { PATH: process.env.PATH, cache: process.env.GEEK_BLOG_CACHE_DIR };
  const nodeVersion = Object.getOwnPropertyDescriptor(process.versions, 'node');
  process.env.PATH = `${createCommands(root, options.corruptPackage)}${path.delimiter}${previous.PATH}`;
  process.env.GEEK_BLOG_CACHE_DIR = cache;
  Object.defineProperty(process.versions, 'node', { ...nodeVersion, value: '20.0.0' });
  try {
    const installed = path.join(project, '.yalc', 'blog-engine', 'node_modules', 'dependency', 'index.js');
    callback({ installed, project, lock, source });
  } finally {
    Object.defineProperty(process.versions, 'node', nodeVersion);
    process.env.PATH = previous.PATH;
    if (previous.cache === undefined) delete process.env.GEEK_BLOG_CACHE_DIR;
    else process.env.GEEK_BLOG_CACHE_DIR = previous.cache;
    fs.rmSync(root, { recursive: true, force: true });
  }
};
