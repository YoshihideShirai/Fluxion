import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(siteDir, '../..');
const out = resolve(root, 'site/public/playground');

await rm(out, { recursive: true, force: true });
await mkdir(resolve(out, 'examples'), { recursive: true });

await cp(resolve(root, 'web/index.html'), resolve(out, 'index.html'));
await cp(
  resolve(root, 'examples/simple_circle.fluxion.json'),
  resolve(out, 'examples/simple_circle.fluxion.json'),
);

const webDist = resolve(root, 'web/dist');
if (!existsSync(webDist)) {
  throw new Error('web/dist was not found; run `cd web && npm run build` before building the site playground.');
}

await cp(webDist, resolve(out, 'dist'), { recursive: true });
