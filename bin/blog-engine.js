#!/usr/bin/env node
import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .name('blog-engine')
  .description('CLI for Blog Engine')
  .version('1.0.0');

program.command('init')
  .description('Initialize a new blog content repo')
  .action(async () => {
    console.log('Initializing blog content...');
    const targetDir = process.cwd();

    // Create content directory
    await fs.ensureDir(path.join(targetDir, 'content'));
    // Create config file
    await fs.writeFile(path.join(targetDir, 'blog.config.js'), 'export default { title: "My Blog" };');
    // Create gitignore
    await fs.writeFile(path.join(targetDir, '.gitignore'), 'node_modules\ndist\n.yalc\n');
    console.log('Blog content initialized!');
  });

program.command('dev')
  .description('Start dev server')
  .action(() => {
    console.log('Starting dev server...');
    const viteConfig = path.join(__dirname, '../vite.config.js');
    const child = spawn('npx', ['vite', '--config', viteConfig], { stdio: 'inherit' });
  });

program.command('build')
  .description('Build static site')
  .action(() => {
    console.log('Building site...');
    const viteConfig = path.join(__dirname, '../vite.config.js');
    const child = spawn('npx', ['vite', 'build', '--config', viteConfig], { stdio: 'inherit' });
  });

program.command('preview')
  .description('Preview built site')
  .action(() => {
    console.log('Starting preview server...');
    const viteConfig = path.join(__dirname, '../vite.config.js');
    const child = spawn('npx', ['vite', 'preview', '--config', viteConfig], { stdio: 'inherit' });
  });

program.parse();
