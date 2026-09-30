#!/usr/bin/env node
/**
 * Static site generator for climat.today. No dependencies.
 *
 *   node build.mjs                                   build into ./public
 *   SITE_URL=https://staging.example node build.mjs  build for another origin
 *
 *   content/<path>.html          -> public/<path>/index.html, plus index.md
 *   content/glossary/terms.json  -> rendered into /glossary/
 *
 * Also writes sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html,
 * site.webmanifest, _redirects, and redirect stubs for the previous site's URLs.
 *
 * The build FAILS on invalid front matter, a missing required field, or an
 * internal link that does not resolve. A page that ships is a page that parsed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'public');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL || config.url).replace(/\/+$/, '');
// The output must be the same whenever it is built from the same sources, or the check that
// public/ matches the sources would fail every morning. So no date comes from the clock:
// LATEST is the most recent `updated` across the pages, set once they are loaded.
let LATEST = '';
const errors = [];
const warnings = [];
const DRAFT = Boolean(process.env.DRAFT); // DRAFT=1: unresolved internal links warn instead of failing

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&rarr;': '→', '&times;': '×', '&middot;': '·', '&hellip;': '…' };
const decode = (s) => s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
const stripTags = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const plain = (h) => decode(stripTags(h));
const slugify = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const abs = (p) => (/^https?:/.test(p) ? p : SITE_URL + p);
const rel = (f) => path.relative(ROOT, f);
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : []);
const write = (relPath, data) => { const f = path.join(OUT, relPath); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const fmtDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const words = (h) => plain(h).split(/\s+/).filter(Boolean).length;

// ---------------------------------------------------------------- load
function loadPage(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^\s*<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) { errors.push(`${rel(file)}: missing JSON front matter`); return null; }
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { errors.push(`${rel(file)}: front matter is not valid JSON: ${e.message}`); return null; }
  const key = path.relative(CONTENT, file).split(path.sep).join('/').replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  const page = { file, key, url: key ? `/${key}/` : '/', meta, section: key.split('/')[0] || '', depth: key ? key.split('/').length : 0 };
  page.meta.layout = meta.layout || 'simple';
  // `updated` is the date of the last substantive edit. It feeds the visible date, the
  // structured data and the sitemap, so it is required and never defaults to the build date.
  for (const f of ['title', 'description', 'updated']) if (!meta[f]) errors.push(`${rel(file)}: front matter needs "${f}"`);
  if (meta.updated && !/^\d{4}-\d{2}-\d{2}$/.test(meta.updated)) errors.push(`${rel(file)}: "updated" must be YYYY-MM-DD`);
  if (page.meta.layout === 'article') for (const f of ['summary', 'updated']) if (!meta[f]) errors.push(`${rel(file)}: an article needs "${f}"`);
  if (meta.description && (meta.description.length < 70 || meta.description.length > 170)) warnings.push(`${rel(file)}: description is ${meta.description.length} characters (aim for 140 to 160)`);
  if (meta.title && meta.title.length > 70) warnings.push(`${rel(file)}: title is ${meta.title.length} characters`);
  const prepared = prepareBody(raw.slice(m[0].length));
  page.body = prepared.html;
  page.toc = prepared.toc;
  return page;
}

/** Heading ids, a table of contents, and scrollable tables. */
function prepareBody(html) {
  const toc = [];
  const used = new Set();
  let out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (all, lvl, attrs, inner) => {
    let id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (!id) {
      const base = slugify(inner) || 'section';
      id = base;
      for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
      attrs = `${attrs} id="${id}"`;
    }
    used.add(id);
    if (lvl === '2') toc.push({ id, text: plain(inner) });
    return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
  });
  // Tables scroll inside their own wrapper. Four or more columns get a minimum width,
  // so on a phone they scroll sideways instead of squeezing into unreadable slivers.
  out = out.replace(/<table[^>]*>[\s\S]*?<\/table>/g, (t) => {
    const cols = ((t.match(/<tr[^>]*>([\s\S]*?)<\/tr>/) || [])[1] || '').match(/<t[hd][\s>]/g)?.length || 0;
    return `<div class="table-wrap${cols >= 4 ? ' table-wide' : ''}" tabindex="0" role="region" aria-label="Table">${t}</div>`;
  });
  return { html: out, toc };
}

// ---------------------------------------------------------------- markdown alternate
const inlineMd = (x) => x
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, h, t) => `[${plain(t)}](${h.startsWith('/') ? abs(h) : h})`)
  .replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, '**$2**')
  .replace(/<(em|i)>([\s\S]*?)<\/\1>/g, '*$2*')
  .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function tableMd(t) {
  const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => inlineMd(c[1]).replace(/\|/g, '\\|')));
  if (!rows.length) return '';
  const head = rows[0];
  return `\n\n| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n')}\n\n`;
}

function toMarkdown(html) {
  let s = html.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, '');
  s = s.replace(/<table[\s\S]*?<\/table>/g, tableMd);
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_, inner) => { let i = 0; return `\n${inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_2, x) => `${++i}. ${inlineMd(x)}\n`)}\n`; });
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, x) => `\n\n## ${inlineMd(x)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_, x) => `\n\n### ${inlineMd(x)}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, x) => `- ${inlineMd(x)}\n`);
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (_, x) => `\n> ${inlineMd(x)}\n`);
  s = s.replace(/<(p|dt|dd|figcaption)[^>]*>([\s\S]*?)<\/\1>/g, (_, _t, x) => `\n${inlineMd(x)}\n`);
  s = s.replace(/<[^>]+>/g, '');
  return decode(s).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function pageMarkdown(p) {
  const m = p.meta;
  const parts = [`# ${m.h1 || m.title}`];
  if (m.summary) parts.push(`> ${m.summary}`);
  if (m.updated) parts.push(`Updated ${m.updated}. Canonical: ${abs(p.url)}`);
  if (m.key_facts?.length) parts.push(m.key_facts.map((k) => `- **${k.label}:** ${k.value}`).join('\n'));
  parts.push(toMarkdown(p.body));
  if (p.key === 'glossary' && glossary.length) parts.push(glossary.map((t) => `## ${t.term}${t.abbr ? ` (${t.abbr})` : ''}\n\n${t.definition}${t.source?.url ? `\n\nSource: [${t.source.title}](${t.source.url})` : ''}`).join('\n\n'));
  if (m.faq?.length) parts.push(`## Frequently asked questions\n\n${m.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}`);
  if (m.sources?.length) parts.push(`## Sources\n\n${m.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})${s.publisher ? `, ${s.publisher}` : ''}${s.accessed ? ` (accessed ${s.accessed})` : ''}`).join('\n')}`);
  return `${parts.join('\n\n')}\n`;
}

// ---------------------------------------------------------------- structured data
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

function organization(full) {
  const o = config.organization;
  const node = { '@type': 'Organization', '@id': ORG_ID, name: config.name, url: `${SITE_URL}/` };
  if (!full) return node;
  return {
    ...node,
    alternateName: config.alternateNames,
    description: config.description,
    logo: { '@type': 'ImageObject', url: abs('/assets/logo-512.png'), width: 512, height: 512 },
    email: config.contactEmail,
    telephone: o.telephone,
    foundingDate: o.foundingDate,
    parentOrganization: { '@type': 'Organization', name: o.parentName, url: o.parentUrl },
    address: { '@type': 'PostalAddress', ...o.address },
    sameAs: o.sameAs,
    knowsAbout: ['Carbon project development', 'Project design documents', 'Verified Carbon Standard', 'Gold Standard for the Global Goals', 'Additionality', 'Validation and verification'],
  };
}

function breadcrumbs(p) {
  const trail = [{ name: 'Home', url: '/' }];
  const segs = p.key ? p.key.split('/') : [];
  segs.forEach((seg, i) => {
    const key = segs.slice(0, i + 1).join('/');
    const page = byKey.get(key);
    if (i === segs.length - 1) trail.push({ name: p.meta.crumb || p.meta.h1 || p.meta.title, url: p.url });
    else if (page) trail.push({ name: page.meta.crumb || config.sections[seg] || page.meta.title, url: page.url });
  });
  return trail;
}

function jsonLd(p) {
  const m = p.meta;
  const pageId = `${abs(p.url)}#webpage`;
  const graph = [organization(p.key === '' || p.key === 'about')];
  if (p.key === '') graph.push({ '@type': 'WebSite', '@id': SITE_ID, url: `${SITE_URL}/`, name: config.name, description: config.description, inLanguage: config.language, publisher: { '@id': ORG_ID } });
  graph.push({
    '@type': m.layout === 'glossary' ? ['WebPage', 'CollectionPage'] : p.key === 'about' ? 'AboutPage' : p.key === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': pageId, url: abs(p.url), name: m.title, description: m.description, inLanguage: config.language,
    isPartOf: { '@id': SITE_ID }, dateModified: m.updated,
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(m.image || config.ogImage) },
  });
  const trail = breadcrumbs(p);
  if (trail.length > 1) graph.push({ '@type': 'BreadcrumbList', '@id': `${abs(p.url)}#breadcrumb`, itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.url) })) });
  if (m.layout === 'article') {
    graph.push({
      '@type': 'Article', '@id': `${abs(p.url)}#article`, headline: m.h1 || m.title, description: m.description, abstract: m.summary,
      datePublished: m.published || m.updated, dateModified: m.updated, inLanguage: config.language,
      author: m.author?.name ? { '@type': 'Person', name: m.author.name, ...(m.author.url ? { url: m.author.url } : {}), ...(m.author.role ? { jobTitle: m.author.role } : {}) } : { '@id': ORG_ID },
      ...(m.reviewer?.name ? { reviewedBy: { '@type': 'Person', name: m.reviewer.name, ...(m.reviewer.url ? { url: m.reviewer.url } : {}), ...(m.reviewer.role ? { jobTitle: m.reviewer.role } : {}) } } : {}),
      publisher: { '@id': ORG_ID }, mainEntityOfPage: { '@id': pageId },
      image: abs(m.image || config.ogImage), articleSection: config.sections[p.section] || undefined, wordCount: words(p.body),
      citation: (m.sources || []).map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}) })),
    });
  }
  if (m.schema === 'software') {
    graph.push({
      '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: config.name, url: abs('/product/'),
      applicationCategory: 'BusinessApplication', applicationSubCategory: 'Carbon project development software', operatingSystem: 'Web',
      description: config.description, publisher: { '@id': ORG_ID }, featureList: m.features || [],
    });
  }
  if (m.layout === 'glossary' && glossary.length) {
    graph.push({
      '@type': 'DefinedTermSet', '@id': `${abs(p.url)}#terms`, name: 'Carbon project development glossary', url: abs(p.url),
      hasDefinedTerm: glossary.map((t) => ({ '@type': 'DefinedTerm', '@id': `${abs(p.url)}#${t.slug}`, name: t.term, ...(t.abbr ? { termCode: t.abbr } : {}), description: t.definition, url: `${abs(p.url)}#${t.slug}`, inDefinedTermSet: { '@id': `${abs(p.url)}#terms` } })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// ---------------------------------------------------------------- templates
const LOGO = `<img src="/assets/logo-on-dark.svg" alt="${esc(config.name)}" width="151" height="42">`;
const isCurrent = (href, p) => (href === '/' ? p.url === '/' : p.url.startsWith(href));
const navLinks = (p) => config.nav.map((n) => `<li><a href="${n.href}"${isCurrent(n.href, p) ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('');

function header(p) {
  return `<header class="site-header"><div class="container header-row">
<a class="logo" href="/" aria-label="${esc(config.name)} home">${LOGO}</a>
<nav class="nav-desktop" aria-label="Main"><ul>${navLinks(p)}</ul></nav>
<a class="btn btn-accent btn-sm header-cta" href="${config.cta.href}">${esc(config.cta.label)}</a>
<details class="nav-mobile"><summary aria-label="Menu"><span class="burger" aria-hidden="true"></span><span class="sr-only">Menu</span></summary>
<nav aria-label="Main, mobile"><ul>${navLinks(p)}<li><a href="/about/">About</a></li><li><a class="btn btn-accent" href="${config.cta.href}">${esc(config.cta.label)}</a></li></ul></nav></details>
</div></header>`;
}

function footer() {
  const cols = config.footer.map((c) => `<div class="footer-col"><h2>${esc(c.title)}</h2><ul>${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('');
  const o = config.organization;
  return `<footer class="site-footer"><div class="container">
<div class="footer-grid"><div class="footer-brand"><a class="logo" href="/" aria-label="${esc(config.name)} home">${LOGO}</a>
<p>${esc(config.tagline)}.</p>
<p class="footer-small">${esc(config.name)} (climat.today) is built by <a href="${o.parentUrl}">${esc(o.parentName)}</a>, ${esc(o.address.addressLocality)}, India.</p></div>${cols}</div>
<div class="footer-base"><p>&copy; ${LATEST.slice(0, 4)} ${esc(o.parentName)}. Climat is not a registry and not a validation body.</p>
<p><a href="/llms.txt">llms.txt</a> &middot; <a href="/sitemap.xml">Sitemap</a> &middot; <a href="mailto:${config.contactEmail}">${config.contactEmail}</a></p></div>
</div></footer>`;
}

function head(p, cssHref) {
  const m = p.meta;
  const title = p.key === '' ? m.title : `${m.title} | ${config.name}`;
  const image = abs(m.image || config.ogImage);
  return `<!doctype html>
<html lang="${config.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(m.description)}">
<link rel="canonical" href="${abs(p.url)}">
<meta name="robots" content="${m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
<link rel="alternate" type="text/markdown" href="${abs(p.url)}index.md" title="Markdown version of this page">
<meta property="og:type" content="${m.layout === 'article' ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(config.name)}">
<meta property="og:locale" content="${config.locale}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${abs(p.url)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(config.name)}: ${esc(config.tagline)}">
${m.layout === 'article' && m.updated ? `<meta property="article:modified_time" content="${m.updated}T00:00:00Z">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.title)}">
<meta name="twitter:description" content="${esc(m.description)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="${config.themeColor}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/poppins-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${cssHref}">
</head>`;
}

const crumbsHtml = (p) => {
  const t = breadcrumbs(p);
  if (t.length < 2) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${t.map((c, i) => (i === t.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.url}">${esc(c.name)}</a></li>`)).join('')}</ol></nav>`;
};

const ctaBand = () => `<section class="cta-band"><div class="container cta-inner">
<div><h2>Bring one real project.</h2><p>Early access is by conversation. Tell us the methodology and where the project stands, and we will show you what Climat finds in it.</p></div>
<a class="btn btn-accent" href="${config.cta.href}">${esc(config.cta.label)}</a></div></section>`;

function card(c) {
  const m = c.meta;
  return `<li class="card"><a href="${c.url}"><span class="card-kicker">${esc(m.kicker || config.sections[c.section] || '')}</span>
<span class="card-title">${esc(m.h1 || m.title)}</span><span class="card-text">${esc(m.card || m.description)}</span>
<span class="card-more" aria-hidden="true">Read &rarr;</span></a></li>`;
}

function relatedHtml(p) {
  const items = (p.meta.related || []).map((k) => byKey.get(k.replace(/^\/|\/$/g, ''))).filter(Boolean);
  (p.meta.related || []).forEach((k) => { if (!byKey.get(k.replace(/^\/|\/$/g, ''))) warnings.push(`${rel(p.file)}: related page "${k}" does not exist`); });
  if (!items.length) return '';
  return `<section class="related"><div class="container"><h2>Related reading</h2><ul class="cards">${items.map(card).join('')}</ul></div></section>`;
}

function faqHtml(m) {
  if (!m.faq?.length) return '';
  return `<section class="faq" aria-labelledby="faq-heading"><h2 id="faq-heading">Frequently asked questions</h2>
${m.faq.map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}</section>`;
}

function sourcesHtml(m) {
  if (!m.sources?.length) return '';
  return `<section class="sources" aria-labelledby="sources-heading"><h2 id="sources-heading">Sources</h2>
<ol>${m.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>${s.publisher ? `, ${esc(s.publisher)}` : ''}${s.accessed ? `. Accessed ${fmtDate(s.accessed)}.` : ''}</li>`).join('')}</ol></section>`;
}

function articleLayout(p) {
  const m = p.meta;
  const toc = [...p.toc, ...(m.faq?.length ? [{ id: 'faq-heading', text: 'Frequently asked questions' }] : []), ...(m.sources?.length ? [{ id: 'sources-heading', text: 'Sources' }] : [])];
  const facts = m.key_facts?.length ? `<dl class="keyfacts">${m.key_facts.map((k) => `<div><dt>${esc(k.label)}</dt><dd>${esc(k.value)}</dd></div>`).join('')}</dl>` : '';
  const mins = Math.max(1, Math.round(words(p.body) / 220));
  return `<article class="article">
<header class="article-head"><div class="container">${crumbsHtml(p)}
<p class="kicker">${esc(m.kicker || '')}</p><h1>${esc(m.h1 || m.title)}</h1>
<p class="summary">${esc(m.summary)}</p>
<p class="byline">Updated <time datetime="${m.updated}">${fmtDate(m.updated)}</time> &middot; ${mins} min read &middot; ${m.author?.name ? esc(m.author.name) : 'Climat editorial team'}${m.reviewer?.name ? ` &middot; Reviewed by ${m.reviewer.url ? `<a href="${esc(m.reviewer.url)}">${esc(m.reviewer.name)}</a>` : esc(m.reviewer.name)}${m.reviewer.role ? `, ${esc(m.reviewer.role)}` : ''}` : ''}</p></div></header>
<div class="container article-grid">
<aside class="toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></aside>
<div class="prose">${facts}
${p.body}
${faqHtml(m)}
${sourcesHtml(m)}
<p class="disclaimer">This page is educational. Registry rules change, and the published standard or methodology is always the authority. It is not legal, financial or validation advice. It was drafted with AI assistance and checked against the sources listed above${m.reviewer?.name ? `, then reviewed by ${esc(m.reviewer.name)}` : '; it has not yet been reviewed by a named practitioner'}. See our <a href="/editorial-policy/">editorial policy</a>.</p>
</div></div>
${relatedHtml(p)}</article>`;
}

function hubLayout(p) {
  const kids = pages.filter((c) => c.key.startsWith(`${p.key}/`) && c.depth === p.depth + 1).sort((a, b) => (a.meta.order ?? 50) - (b.meta.order ?? 50) || (a.meta.title > b.meta.title ? 1 : -1));
  return `<section class="page-head"><div class="container">${crumbsHtml(p)}<p class="kicker">${esc(p.meta.kicker || '')}</p><h1>${esc(p.meta.h1 || p.meta.title)}</h1>
${p.meta.summary ? `<p class="summary">${esc(p.meta.summary)}</p>` : ''}</div></section>
<section class="hub"><div class="container"><ul class="cards">${kids.map(card).join('')}</ul>
<div class="prose hub-body">${p.body}${faqHtml(p.meta)}</div></div></section>`;
}

function glossaryLayout(p) {
  const letters = [...new Set(glossary.map((t) => t.term[0].toUpperCase()))];
  const term = (t) => `<article class="term" id="${t.slug}"><h3>${esc(t.term)}${t.abbr ? ` <abbr>${esc(t.abbr)}</abbr>` : ''}</h3>
${t.also_known_as?.length ? `<p class="aka">Also: ${t.also_known_as.map(esc).join(', ')}</p>` : ''}<p>${esc(t.definition)}</p>
<p class="term-meta">${t.source?.url ? `Source: <a href="${esc(t.source.url)}" rel="noopener">${esc(t.source.title)}</a>${t.source.publisher ? `, ${esc(t.source.publisher)}` : ''}.` : ''}
${t.related?.length ? ` Related: ${t.related.map((s) => glossary.find((g) => g.slug === s)).filter(Boolean).map((g) => `<a href="#${g.slug}">${esc(g.term)}</a>`).join(', ')}.` : ''}
${t.see ? ` <a class="term-see" href="${t.see}">Read the full explanation &rarr;</a>` : ''}</p></article>`;
  const groups = letters.map((L) => `<section class="letter" aria-labelledby="letter-${L}"><h2 id="letter-${L}">${L}</h2>${glossary.filter((t) => t.term[0].toUpperCase() === L).map(term).join('\n')}</section>`).join('\n');
  return `<section class="page-head"><div class="container">${crumbsHtml(p)}<p class="kicker">${esc(p.meta.kicker || 'Reference')}</p><h1>${esc(p.meta.h1 || p.meta.title)}</h1>
<p class="summary">${esc(p.meta.summary || '')}</p>
<p class="byline">${glossary.length} terms &middot; Updated <time datetime="${p.meta.updated}">${fmtDate(p.meta.updated)}</time></p></div></section>
<div class="container glossary"><nav class="az" aria-label="Jump to letter">${letters.map((L) => `<a href="#letter-${L}">${L}</a>`).join('')}</nav>
<div class="prose">${p.body}${groups}</div></div>`;
}

function simpleLayout(p) {
  return `<section class="page-head"><div class="container">${crumbsHtml(p)}${p.meta.kicker ? `<p class="kicker">${esc(p.meta.kicker)}</p>` : ''}<h1>${esc(p.meta.h1 || p.meta.title)}</h1>
${p.meta.summary ? `<p class="summary">${esc(p.meta.summary)}</p>` : ''}</div></section>
<div class="container"><div class="prose prose-page">${p.body}${faqHtml(p.meta)}${sourcesHtml(p.meta)}</div></div>`;
}

function render(p, cssHref) {
  const m = p.meta;
  let main;
  if (m.layout === 'article') main = articleLayout(p);
  else if (m.layout === 'hub') main = hubLayout(p);
  else if (m.layout === 'glossary') main = glossaryLayout(p);
  else if (m.layout === 'page') main = `${p.body.replace('<!--crumbs-->', crumbsHtml(p))}${faqHtml(m) ? `<section class="band"><div class="container"><div class="prose">${faqHtml(m)}</div></div></section>` : ''}`;
  else main = simpleLayout(p);
  const cta = m.cta === false ? '' : ctaBand();
  return `${head(p, cssHref)}
<body class="layout-${m.layout}${p.key === '' ? ' is-home' : ''}">
<a class="skip" href="#main">Skip to content</a>
${header(p)}
<main id="main">
${main}
${cta}
</main>
${footer()}
<script type="application/ld+json">${jsonLd(p)}</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- build
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let glossary = [];
const termsFile = path.join(CONTENT, 'glossary', 'terms.json');
if (fs.existsSync(termsFile)) {
  try {
    glossary = JSON.parse(fs.readFileSync(termsFile, 'utf8')).sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
    const slugs = new Set();
    for (const t of glossary) {
      if (!t.term || !t.slug || !t.definition) errors.push(`glossary: a term is missing term, slug or definition (${JSON.stringify(t).slice(0, 60)})`);
      if (slugs.has(t.slug)) errors.push(`glossary: duplicate slug "${t.slug}"`);
      slugs.add(t.slug);
    }
    for (const t of glossary) for (const r of t.related || []) if (!slugs.has(r)) warnings.push(`glossary: "${t.slug}" relates to unknown term "${r}"`);
  } catch (e) { errors.push(`content/glossary/terms.json is not valid JSON: ${e.message}`); }
}

const pages = walk(CONTENT).filter((f) => f.endsWith('.html')).map(loadPage).filter(Boolean);
const byKey = new Map(pages.map((p) => [p.key, p]));
LATEST = pages.map((p) => p.meta.updated || '').sort().pop() || '';

// assets: stylesheet is content-hashed so it can be cached forever
const css = fs.readFileSync(path.join(ROOT, 'src/styles/site.css'), 'utf8');
const cssName = `site.${crypto.createHash('sha256').update(css).digest('hex').slice(0, 10)}.css`;
write(`assets/${cssName}`, css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/\n+/g, '\n').trim());
for (const f of walk(path.join(ROOT, 'src/assets'))) {
  const r = path.relative(path.join(ROOT, 'src/assets'), f).split(path.sep).join('/');
  const dest = r === 'favicon.ico' ? 'favicon.ico' : `assets/${r}`;
  fs.mkdirSync(path.dirname(path.join(OUT, dest)), { recursive: true });
  fs.copyFileSync(f, path.join(OUT, dest));
}

for (const p of pages) {
  write(`${p.key ? `${p.key}/` : ''}index.html`, render(p, `/assets/${cssName}`));
  write(`${p.key ? `${p.key}/` : ''}index.md`, pageMarkdown(p));
}

// 404
const notFound = { key: '404', url: '/404.html', section: '', depth: 1, toc: [], file: '404', meta: { layout: 'simple', title: 'Page not found', description: 'The page you were looking for is not here.', h1: 'This page is not here', noindex: true, cta: false }, body: '<p>The address may be out of date. The site was rebuilt in 2026 and some older pages were retired.</p><p><a class="btn btn-accent" href="/">Go to the home page</a></p><p>Or go straight to the <a href="/product/">product</a>, the <a href="/guides/">guides</a>, or the <a href="/glossary/">glossary</a>.</p>' };
write('404.html', render(notFound, `/assets/${cssName}`).replace(/<link rel="canonical"[^>]*>\n/, '').replace(/<link rel="alternate" type="text\/markdown"[^>]*>\n/, ''));

// redirects from the previous site's URLs
const indexable = pages.filter((p) => !p.meta.noindex);
write('_redirects', `${Object.entries(config.redirects).map(([from, to]) => `${from} ${to} 301`).join('\n')}\n/index.html / 301\n`);
for (const [from, to] of Object.entries(config.redirects)) {
  // A stub named about.html beside a directory named about/ makes some hosts loop
  // (they serve /about from the file and redirect /about/ to it). Those paths rely on _redirects.
  if (from.replace(/\.html$/, '/') === to) continue;
  write(from.replace(/^\//, ''), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${abs(to)}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page has moved to <a href="${to}">${abs(to)}</a>.</p></body></html>\n`);
}

// sitemap, robots, manifest
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.sort((a, b) => a.url.localeCompare(b.url)).map((p) => `  <url><loc>${abs(p.url)}</loc><lastmod>${p.meta.updated}T00:00:00+00:00</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `# ${config.name}: everything here is published to be read, by people and by machines.
User-agent: *
Allow: /

# AI search, assistant and training crawlers are welcome, named explicitly so
# there is no doubt. Remove a name to withdraw it.
${config.aiCrawlers.map((a) => `User-agent: ${a}`).join('\n')}
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`);
// IndexNow: the key file proves ownership; tools/indexnow.mjs submits changed URLs after a deploy.
write(`${config.indexNowKey}.txt`, `${config.indexNowKey}\n`);
// Response headers for hosts that read a _headers file (Cloudflare Pages, Netlify).
write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY

# The Markdown twins exist for agents that ask for them. They are not a second copy for search.
/*.md
  Content-Type: text/markdown; charset=utf-8
  X-Robots-Tag: noindex

/llms.txt
  Content-Type: text/plain; charset=utf-8
/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  X-Robots-Tag: noindex

# Content-hashed or effectively permanent files.
/assets/${cssName}
  Cache-Control: public, max-age=31536000, immutable
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);
write('site.webmanifest', `${JSON.stringify({ name: `${config.name}: carbon project origination`, short_name: config.name, description: config.description, start_url: '/', display: 'browser', background_color: '#ffffff', theme_color: config.themeColor, icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/logo-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2)}\n`);

// llms.txt and llms-full.txt
const group = (title, list) => (list.length ? `## ${title}\n\n${list.map((p) => `- [${p.meta.h1 || p.meta.title}](${abs(p.url)}index.md): ${p.meta.summary || p.meta.description}`).join('\n')}\n` : '');
const inSection = (s) => indexable.filter((p) => p.section === s).sort((a, b) => a.depth - b.depth || (a.meta.order ?? 50) - (b.meta.order ?? 50));
write('llms.txt', `# ${config.entity}

> ${config.description} Built by ${config.organization.parentName} in ${config.organization.address.addressLocality}, India. Climat is not a registry and not a validation body.

Every page on this site has a Markdown version at the same address with \`index.md\` appended. Educational pages cite the primary registry documents they rest on and carry the date they were last checked. The full text of the site is in [llms-full.txt](${abs('/llms-full.txt')}).

${group('Product', inSection('product'))}
${group('Methodologies', inSection('methodologies'))}
${group('Registries', inSection('registries'))}
${group('Guides', inSection('guides'))}
${group('Reference', inSection('glossary'))}
${group('Company', indexable.filter((p) => ['about', 'trust', 'contact'].includes(p.key)))}
`.replace(/\n{3,}/g, '\n\n'));
write('llms-full.txt', `# ${config.name}: full site text\n\nLast updated ${LATEST}. Source: ${SITE_URL}/\n\n${indexable.sort((a, b) => a.url.localeCompare(b.url)).map((p) => `---\n\nURL: ${abs(p.url)}\n\n${pageMarkdown(p)}`).join('\n')}`);

// internal link check over everything that was written
const outFiles = walk(OUT).filter((f) => f.endsWith('.html'));
let links = 0;
for (const f of outFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  for (const x of html.matchAll(/\b(?:href|src)="(\/[^"]*|#[^"]*)"/g)) {
    links++;
    const [target, hash] = x[1].split('#');
    const where = path.relative(OUT, f);
    if (!target) { if (hash && !ids.has(hash)) errors.push(`${where}: anchor #${hash} does not exist on the page`); continue; }
    const clean = target.split('?')[0];
    const candidate = path.join(OUT, clean.endsWith('/') ? `${clean}index.html` : clean);
    if (!fs.existsSync(candidate)) { (DRAFT ? warnings : errors).push(`${where}: link to ${x[1]} does not resolve`); continue; }
    if (hash && candidate.endsWith('.html') && !new RegExp(`\\bid="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(fs.readFileSync(candidate, 'utf8'))) errors.push(`${where}: ${x[1]} points at an anchor that does not exist`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) { for (const e of errors) console.error(`ERROR ${e}`); console.error(`\n${errors.length} error(s). Build failed.`); process.exit(1); }
const bytes = walk(OUT).reduce((n, f) => n + fs.statSync(f).size, 0);
console.log(`built ${pages.length} pages, ${glossary.length} glossary terms, ${links} internal links checked, ${(bytes / 1024).toFixed(0)} KB total -> ${rel(OUT)}/ for ${SITE_URL}`);
