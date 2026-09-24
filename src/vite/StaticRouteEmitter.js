import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// GitHub Pages serves only real files with 200; SPA routes otherwise hit 404.html.
// Emits <slug>.html (200 at /slug, matching sitemap URLs) and <slug>/index.html (200 at /slug/).
export class StaticRouteEmitter {
  constructor(projectRoot, config, outDir = path.join(projectRoot, 'dist')) {
    this.projectRoot = projectRoot;
    this.config = config;
    this.outDir = outDir;
  }

  async emit() {
    const template = fs.readFileSync(path.join(this.outDir, 'index.html'), 'utf8');
    const posts = await this.#load('posts');
    const pages = await this.#load('pages');
    pages.forEach(page => this.#write(page.slug, template, page.title, page.description));
    posts.forEach(post => this.#write(post.slug, template, post.title, post.excerpt));
  }

  async #load(name) {
    const file = path.join(this.projectRoot, 'content', `${name}.js`);
    if (!fs.existsSync(file)) return [];
    return (await import(pathToFileURL(file).href))[name] || [];
  }

  #write(slug, template, title, description) {
    const html = this.#render(template, title, description || this.config.description);
    fs.writeFileSync(path.join(this.outDir, `${slug}.html`), html);
    fs.mkdirSync(path.join(this.outDir, slug), { recursive: true });
    fs.writeFileSync(path.join(this.outDir, slug, 'index.html'), html);
  }

  #render(template, title, description) {
    const siteName = this.config.siteName || this.config.title || 'Blog';
    const meta = `<meta name="description" content="${escapeHtml(description)}" />`;
    return template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(`${title} | ${siteName}`)}</title>\n    ${meta}`);
  }
}

export const staticRoutesPlugin = (projectRoot, config) => ({
  name: 'static-routes',
  apply: 'build',
  closeBundle: () => new StaticRouteEmitter(projectRoot, config).emit(),
});
