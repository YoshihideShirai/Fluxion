import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const root = resolve(webRoot, '..');
const galleryDir = resolve(root, 'examples/gallery');

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
  'vector-arrow.fluxion.txt',
];

for (const file of files) {
  const source = readFileSync(resolve(galleryDir, file), 'utf8');
  try {
    compileTextDsl(source);
  } catch (error) {
    throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Compiled ${files.length} gallery DSL examples successfully.`);
