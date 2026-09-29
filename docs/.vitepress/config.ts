import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import container from 'markdown-it-container';
import { defineConfig, type DefaultTheme } from 'vitepress';

// GitHub Pages project sites live at https://<user>.github.io/<repo>/,
// so `base` must be the repo name wrapped in slashes.
const REPO_NAME = 'SI679_notebook';

const docsDir = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = path.resolve(docsDir, '..');

interface CodeSource {
  slug: string;
  label: string;
  from: string;
  week: string;
}

const { sources: codeSources } = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'code-sources.json'), 'utf8'),
) as { sources: CodeSource[] };

// Week pages are discovered from docs/weeks/week-NN.md; the sidebar label is
// the page's frontmatter `title`. Add a file and it shows up here.
const weeksDir = path.join(docsDir, 'weeks');
const weekPages = (fs.existsSync(weeksDir) ? fs.readdirSync(weeksDir) : [])
  .filter((file) => /^week-\d+\.md$/.test(file))
  .sort()
  .map((file) => {
    const id = file.replace(/\.md$/, '');
    const source = fs.readFileSync(path.join(weeksDir, file), 'utf8');
    const title = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? id;
    return { id, title, link: `/weeks/${id}` };
  });

// Only link a project once `npm run sync-code` has generated its pages.
const codeItemsFor = (week: string): DefaultTheme.SidebarItem[] =>
  codeSources
    .filter((src) => src.week === week && fs.existsSync(path.join(docsDir, 'code', src.slug, 'index.md')))
    .map((src) => ({ text: `💾 ${src.label}`, link: `/code/${src.slug}/` }));

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Start here',
    items: [
      { text: 'Home', link: '/' },
      { text: '📋 Cheat Sheet', link: '/cheatsheet' },
    ],
  },
  {
    text: 'Page 0 · JS & TS Foundations',
    collapsed: false,
    items: [{ text: 'Notes', link: '/foundations' }, ...codeItemsFor('foundations')],
  },
  ...weekPages.map((week) => ({
    text: week.title,
    collapsed: false,
    items: [{ text: 'Notes', link: week.link }, ...codeItemsFor(week.id)],
  })),
  { text: 'Reference', items: [{ text: 'All source code', link: '/code/' }] },
];

export default defineConfig({
  title: 'SI 679 Notebook',
  description: 'Study notebook for SI 679: Backend Development',
  base: `/${REPO_NAME}/`,
  cleanUrls: true,
  lang: 'en-US',
  head: [
    ['meta', { name: 'theme-color', content: '#2f5d3a' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap',
      },
    ],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    // `::: sticky Title` … `:::` renders a sticky note for real-life examples.
    config(md) {
      md.use(container, 'sticky', {
        render(tokens, idx) {
          const token = tokens[idx];
          if (token.nesting !== 1) return '</div>\n';
          const title = token.info.trim().slice('sticky'.length).trim() || 'Real life';
          return `<div class="sticky-note"><p class="sticky-note-title">📌 ${md.utils.escapeHtml(title)}</p>\n`;
        },
      });
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Page 0: Foundations', link: '/foundations' },
      { text: 'Cheat Sheet', link: '/cheatsheet' },
      ...(weekPages.length
        ? [{ text: 'Weeks', items: weekPages.map((w) => ({ text: w.title, link: w.link })) }]
        : []),
      { text: 'Source code', link: '/code/' },
    ],
    sidebar,
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    docFooter: { prev: 'Previous', next: 'Next' },
  },
});
