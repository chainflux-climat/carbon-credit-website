#!/usr/bin/env node
/**
 * Tell IndexNow (Bing, and the engines that share its feed) which URLs changed.
 * Run it after a deploy, once the new pages are live:
 *
 *   node tools/indexnow.mjs                 submit every URL in public/sitemap.xml
 *   node tools/indexnow.mjs /guides/x/ /    submit only these paths
 *
 * The key is public by design: it is served from the site root as <key>.txt, which is
 * how the receiving engine checks that the sender controls the site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const site = (process.env.SITE_URL || config.url).replace(/\/+$/, '');
const host = new URL(site).host;

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map((a) => site + (a.startsWith('/') ? a : `/${a}`))
  : [...fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (!urlList.length) {
  console.error('nothing to submit');
  process.exit(1);
}

const keyCheck = await fetch(`${site}/${config.indexNowKey}.txt`).catch((e) => ({ ok: false, status: e.message }));
if (!keyCheck.ok) {
  console.error(`the key file is not reachable at ${site}/${config.indexNowKey}.txt (${keyCheck.status}). Deploy first, then submit.`);
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: config.indexNowKey, keyLocation: `${site}/${config.indexNowKey}.txt`, urlList }),
});
console.log(`submitted ${urlList.length} URL(s) for ${host}: HTTP ${res.status} ${res.statusText}`);
process.exit(res.ok ? 0 : 1);
