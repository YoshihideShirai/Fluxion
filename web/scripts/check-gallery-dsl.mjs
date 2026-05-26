import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const root = resolve(webRoot, '..');
const examplesGalleryDir = resolve(root, 'examples/gallery');
const siteGalleryDir = resolve(root, 'site/src/content/gallery');

const compilerModule = await import(pathToFileURL(resolve(webRoot, 'dist/dsl/compiler.js')).href);
const { compileTextDsl } = compilerModule;

const files = [
  'arg-min-example.fluxion.txt',
  'boolean-operations.fluxion.txt',
  'fixed-in-frame-m-object-test.fluxion.txt',
  'gradient-image-from-array.fluxion.txt',
  'graph-area-plot.fluxion.txt',
  'heat-diagram-plot.fluxion.txt',
  'moving-angle.fluxion.txt',
  'moving-around.fluxion.txt',
  'moving-dots.fluxion.txt',
  'moving-group-to-destination.fluxion.txt',
  'moving-zoomed-scene-around.fluxion.txt',
  'moving_frame_box.fluxion.txt',
  'point-with-trace.fluxion.txt',
  'rotation-updater.fluxion.txt',
  'polygon-on-axes.fluxion.txt',
  'sine-curve-unit-circle.fluxion.txt',
  'three-d-camera-rotation.fluxion.txt',
  'three-d-camera-illusion-rotation.fluxion.txt',
  'vector-arrow.fluxion.txt',
];

const markdownFiles = readdirSync(siteGalleryDir)
  .filter((file) => file.endsWith('.md'))
  .sort();

function readMarkdownBody(path) {
  const source = readFileSync(path, 'utf8');
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/u.exec(source);
  if (!match) throw new Error('Missing frontmatter block.');
  return match[1].trim();
}

function compileExample(label, source) {
  try {
    compileTextDsl(source);
  } catch (error) {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const file of files) {
  const source = readFileSync(resolve(examplesGalleryDir, file), 'utf8');
  compileExample(`examples/gallery/${file}`, source);
}

for (const file of markdownFiles) {
  const source = readMarkdownBody(resolve(siteGalleryDir, file));
  compileExample(`site/src/content/gallery/${file}`, source);
}

console.log(`Compiled ${files.length} example gallery DSL files and ${markdownFiles.length} site gallery pages successfully.`);
