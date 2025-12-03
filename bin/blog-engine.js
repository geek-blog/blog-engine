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
    const templatesDir = path.join(__dirname, '../templates');

    // Create content/posts directory
    await fs.ensureDir(path.join(targetDir, 'content/posts'));

    // Create content/pages directory
    await fs.ensureDir(path.join(targetDir, 'content/pages'));

    // Create public directory
    await fs.ensureDir(path.join(targetDir, 'public'));

    // Copy welcome post template with date substitution
    let welcomeContent = await fs.readFile(path.join(templatesDir, 'welcome.md'), 'utf8');
    welcomeContent = welcomeContent.replace('{{DATE}}', new Date().toISOString().split('T')[0]);
    await fs.writeFile(path.join(targetDir, 'content/posts/welcome.md'), welcomeContent);

    // Copy static pages templates
    await fs.copy(
      path.join(templatesDir, 'pages/about.md'),
      path.join(targetDir, 'content/pages/about.md')
    );
    await fs.copy(
      path.join(templatesDir, 'pages/contact.md'),
      path.join(targetDir, 'content/pages/contact.md')
    );

    // Copy 404.html to public directory
    await fs.copy(
      path.join(templatesDir, '404.html'),
      path.join(targetDir, 'public/404.html')
    );

    // Copy blog config
    await fs.copy(
      path.join(templatesDir, 'blog.config.js'),
      path.join(targetDir, 'blog.config.js')
    );

    // Copy gitignore
    await fs.copy(
      path.join(templatesDir, 'gitignore'),
      path.join(targetDir, '.gitignore')
    );

    // Create GitHub Actions workflow directory and copy deploy workflow
    await fs.ensureDir(path.join(targetDir, '.github/workflows'));
    await fs.copy(
      path.join(templatesDir, 'deploy.yml'),
      path.join(targetDir, '.github/workflows/deploy.yml')
    );

    console.log('✅ Blog content initialized!');
    console.log('\nCreated:');
    console.log('  - content/posts/welcome.md (sample post)');
    console.log('  - content/pages/about.md (static page)');
    console.log('  - content/pages/contact.md (static page)');
    console.log('  - public/404.html (GitHub Pages redirect)');
    console.log('  - blog.config.js');
    console.log('  - .gitignore');
    console.log('  - .github/workflows/deploy.yml');
    console.log('\nNext steps:');
    console.log('  1. Run: npx blog-engine process  (generate posts.js and pages.js)');
    console.log('  2. Run: npx blog-engine dev      (start dev server)');
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

program.command('process')
  .description('Process markdown posts and pages into JavaScript modules')
  .action(() => {
    console.log('Processing content...');
    const processScript = path.join(__dirname, 'process-content.js');
    const child = spawn('node', [processScript], { stdio: 'inherit' });
    child.on('exit', (code) => {
      process.exit(code);
    });
  });

program.parse();
