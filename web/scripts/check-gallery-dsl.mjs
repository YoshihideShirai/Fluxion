import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const root = resolve(webRoot, '..');
const examplesGalleryDir = resolve(root, 'examples/gallery');
const siteGalleryDir = resolve(root, 'site/src/content/gallery');

const compilerModule = await import(pathToFileURL(resolve(webRoot, 'dist/dsl/compiler.js')).href);
const playerModule = await import(pathToFileURL(resolve(webRoot, 'dist/runtime/player.js')).href);
const { compileTextDsl } = compilerModule;
const { Player } = playerModule;

const files = readdirSync(examplesGalleryDir)
  .filter((file) => file.endsWith('.fluxion.txt'))
  .sort();

const markdownFiles = readdirSync(siteGalleryDir)
  .filter((file) => file.endsWith('.md'))
  .sort();

const requiredFrontmatterFields = [
  'title',
  'source_manim_url',
  'source_example_path',
  'porting_strategy',
  'fidelity',
  'known_gaps',
  'category',
  'status',
];

const allowedStatuses = new Set(['ported', 'partial', 'blocker']);
const allowedFidelities = new Set(['faithful', 'visual_approximation']);
const faithfulLabelFreeExamples = new Set([
  'animations-using-animate',
  'gradient-image-from-array',
  'simple-circle',
  'square-to-circle',
  'moving-dots',
  'moving-group-to-destination',
  'moving-around',
  'orbital-dot',
  'orbital_dot',
  'rotation-updater',
  'point-with-trace',
  'special-camera',
  'three-d-light-source-position',
  'three-d-surface-plot',
  'three-d-camera-rotation',
  'three-d-camera-illusion-rotation',
]);

function isFaithfulLabelFreeExample(label) {
  return [...faithfulLabelFreeExamples].some((slug) => label.includes(slug));
}

function readMarkdown(path) {
  const source = readFileSync(path, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u.exec(source);
  if (!match) throw new Error('Missing frontmatter block.');
  return { frontmatter: match[1], body: match[2].trim() };
}

function getFrontmatterValue(frontmatter, field) {
  const match = new RegExp(`^${field}:\\s*(.+)$`, 'm').exec(frontmatter);
  return match?.[1]?.trim();
}

function checkMarkdownFrontmatter(label, frontmatter) {
  for (const field of requiredFrontmatterFields) {
    const hasScalarField = new RegExp(`^${field}:\\s*\\S+`, 'm').test(frontmatter);
    const hasBlockField = new RegExp(`^${field}:\\s*$`, 'm').test(frontmatter);
    if (!hasScalarField && !hasBlockField) {
      throw new Error(`${label}: missing required frontmatter field '${field}'.`);
    }
  }

  const status = getFrontmatterValue(frontmatter, 'status');
  if (!allowedStatuses.has(status)) {
    throw new Error(`${label}: invalid status '${status}'.`);
  }

  const fidelity = getFrontmatterValue(frontmatter, 'fidelity');
  if (!allowedFidelities.has(fidelity)) {
    throw new Error(`${label}: invalid fidelity '${fidelity}'.`);
  }

  const sourceExamplePath = getFrontmatterValue(frontmatter, 'source_example_path');
  if (!sourceExamplePath || !existsSync(resolve(root, sourceExamplePath))) {
    throw new Error(`${label}: source_example_path does not exist: ${sourceExamplePath ?? '(missing)'}.`);
  }

  const knownGapsIndex = frontmatter.search(/^known_gaps:/m);
  if (knownGapsIndex === -1) {
    throw new Error(`${label}: missing known_gaps.`);
  }

  const knownGapsBlock = frontmatter.slice(knownGapsIndex).split(/\r?\n(?=[a-zA-Z_]+:)/u)[0];
  if (!/^\s*-\s+/m.test(knownGapsBlock)) {
    throw new Error(`${label}: known_gaps must contain at least one item.`);
  }
}

function compileExample(label, source) {
  try {
    const documentData = compileTextDsl(source);
    checkRenderableTimeline(label, documentData);
  } catch (error) {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function flattenNodes(nodes) {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

function colorValues(node) {
  return [node.style?.fill, node.style?.stroke].filter(
    (value) => typeof value === 'string' && value !== '' && value !== 'none',
  );
}

function isVisible(node) {
  const opacity = Number(node.transform?.opacity ?? 1);
  if (!Number.isFinite(opacity) || opacity <= 0.02) return false;
  const fill = node.style?.fill;
  const stroke = node.style?.stroke;
  const strokeWidth = Number(node.style?.strokeWidth ?? 0);
  const hasFill = typeof fill === 'string' && fill !== '' && fill !== 'none';
  const hasStroke = typeof stroke === 'string' && stroke !== '' && stroke !== 'none' && strokeWidth > 0;
  return hasFill || hasStroke || node.type === 'text' || node.type === 'math' || node.type === 'group';
}

function visualSample(documentData, seconds) {
  let renderedNodes = [];
  const renderer = {
    render: (nodes) => {
      renderedNodes = nodes;
    },
  };
  const player = new Player(documentData, renderer);
  player.seek(seconds);
  const flattened = flattenNodes(renderedNodes);
  const visible = flattened.filter(isVisible);
  return {
    colors: new Set(visible.flatMap(colorValues)),
    hasTextOrMath: visible.some((node) => node.type === 'text' || node.type === 'math'),
    visibleCount: visible.length,
  };
}

function checkRenderableTimeline(label, documentData) {
  const duration = documentData.duration ?? Math.max(0, ...documentData.timeline.map((op) => op.t + ('duration' in op ? op.duration : 0)));
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${label}: expected a positive animation duration.`);
  }

  const sampleTimes = [0, 0.2, 0.5, 0.8, 1].map((unit) => duration * unit);
  const samples = sampleTimes.map((seconds) => visualSample(documentData, seconds));
  const bestVisibleCount = Math.max(...samples.map((sample) => sample.visibleCount));
  const colors = new Set(samples.flatMap((sample) => [...sample.colors]));
  const hasTextOrMath = samples.some((sample) => sample.hasTextOrMath);
  const allowLabelFree = isFaithfulLabelFreeExample(label);

  if (bestVisibleCount < (allowLabelFree ? 2 : 3)) {
    throw new Error(`${label}: rendered timeline has too few visible nodes.`);
  }
  if (colors.size < 2) {
    throw new Error(`${label}: rendered timeline should use at least two visible colors.`);
  }
  if (!hasTextOrMath && !allowLabelFree) {
    throw new Error(`${label}: rendered timeline should include text or math labels for gallery readability.`);
  }
}

function normalizeDslSource(source) {
  return source
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

function checkGalleryExampleSync(label, frontmatter, body) {
  const sourceExamplePath = getFrontmatterValue(frontmatter, 'source_example_path');
  if (!sourceExamplePath?.startsWith('examples/gallery/')) return;
  const examplePath = resolve(root, sourceExamplePath);
  const exampleSource = readFileSync(examplePath, 'utf8');
  if (normalizeDslSource(body) !== normalizeDslSource(exampleSource)) {
    throw new Error(`${label}: body is out of sync with ${sourceExamplePath}.`);
  }
}

for (const file of files) {
  const source = readFileSync(resolve(examplesGalleryDir, file), 'utf8');
  compileExample(`examples/gallery/${file}`, source);
}

for (const file of markdownFiles) {
  const label = `site/src/content/gallery/${file}`;
  const { body, frontmatter } = readMarkdown(resolve(siteGalleryDir, file));
  checkMarkdownFrontmatter(label, frontmatter);
  checkGalleryExampleSync(label, frontmatter, body);
  compileExample(label, body);
}

console.log(
  `Compiled ${files.length} example gallery DSL files and checked ${markdownFiles.length} site gallery pages successfully.`,
);
