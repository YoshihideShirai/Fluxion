import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const root = resolve(webRoot, '..');
const examplesGalleryDir = resolve(root, 'examples/gallery');
const siteGalleryDir = resolve(root, 'site/src/content/gallery');

const compilerModule = await import(pathToFileURL(resolve(webRoot, 'dist/dsl/compiler.js')).href);
const playerModule = await import(pathToFileURL(resolve(webRoot, 'dist/runtime/player.js')).href);
const rendererModule = await import(pathToFileURL(resolve(webRoot, 'dist/renderers/svgRenderer.js')).href);
const { compileTextDsl } = compilerModule;
const { Player } = playerModule;
const { buildCameraTransform, buildFixedFrameTransform } = rendererModule;

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
  'gap_id',
];

const officialManimExampleAnchors = new Set([
  'argminexample',
  'booleanoperations',
  'braceannotation',
  'fixedinframemobjecttest',
  'followinggraphcamera',
  'gradientimagefromarray',
  'graphareaplot',
  'heatdiagramplot',
  'manimcelogo',
  'movingangle',
  'movingaround',
  'movingdots',
  'movingframebox',
  'movinggrouptodestination',
  'movingzoomedscenearound',
  'openingmanim',
  'pointmovingonshapes',
  'pointwithtrace',
  'polygononaxes',
  'rotationupdater',
  'sinandcosfunctionplot',
  'sinecurveunitcircle',
  'threedcameraillusionrotation',
  'threedcamerarotation',
  'threedlightsourceposition',
  'threedsurfaceplot',
  'vectorarrow',
]);

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
  'polygon-on-axes',
  'special-camera',
  'three-d-light-source-position',
  'three-d-surface-plot',
  'three-d-camera-rotation',
  'three-d-camera-illusion-rotation',
]);

const expectedDurations = new Map([
  ['animations-using-animate', 4],
  ['arg-min-example', 2],
  ['boolean-operations', 9],
  ['brace-annotation', 1],
  ['brace_annotation', 1],
  ['fixed-in-frame-m-object-test', 1],
  ['graph-area-plot', 1],
  ['gradient-image-from-array', 1],
  ['heat-diagram-plot', 1],
  ['manim-ce-logo', 1],
  ['manim_ce_logo', 1],
  ['moving-around', 4],
  ['moving-angle', 4.5],
  ['moving-frame-box', 6],
  ['moving_frame_box', 6],
  ['moving-group-to-destination', 1.5],
  ['moving-zoomed-scene-around', 12],
  ['orbital-dot', 6.5],
  ['orbital_dot', 6.5],
  ['opening-manim', 11.25],
  ['opening_manim', 11.25],
  ['plotting-sin-cos', 1],
  ['sine-curve-unit-circle', 9.5],
  ['simple-circle', 2],
  ['square-to-circle', 3],
  ['three-d-light-source-position', 1],
  ['three-d-surface-plot', 1],
  ['three-d-camera-rotation', 3],
  ['three-d-camera-illusion-rotation', Math.PI / 2],
  ['special-camera', 3],
  ['transform-matching-tex', 3.5],
  ['transform_matching_tex', 3.5],
]);

function isFaithfulLabelFreeExample(label) {
  return [...faithfulLabelFreeExamples].some((slug) => label.includes(slug));
}

function expectedDurationForLabel(label) {
  for (const [slug, duration] of expectedDurations) {
    if (label.includes(slug)) return duration;
  }
  return undefined;
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

function manimAnchorFromUrl(url) {
  return /#([a-z0-9-]+)$/u.exec(String(url ?? ''))?.[1];
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

  const sourceManimUrl = getFrontmatterValue(frontmatter, 'source_manim_url');
  if (!sourceManimUrl?.startsWith('https://docs.manim.community/en/stable/')) {
    throw new Error(`${label}: source_manim_url must point to the stable Manim documentation.`);
  }
  if (!/#[-a-z0-9]+$/u.test(sourceManimUrl)) {
    throw new Error(`${label}: source_manim_url must include a concrete documentation anchor.`);
  }

  const sourceExamplePath = getFrontmatterValue(frontmatter, 'source_example_path');
  if (!sourceExamplePath || !existsSync(resolve(root, sourceExamplePath))) {
    throw new Error(`${label}: source_example_path does not exist: ${sourceExamplePath ?? '(missing)'}.`);
  }
  if (!sourceExamplePath.startsWith('examples/gallery/') || !sourceExamplePath.endsWith('.fluxion.txt')) {
    throw new Error(`${label}: source_example_path must point to an examples/gallery/*.fluxion.txt source.`);
  }

  const knownGapsIndex = frontmatter.search(/^known_gaps:/m);
  if (knownGapsIndex === -1) {
    throw new Error(`${label}: missing known_gaps.`);
  }

  const knownGapsBlock = frontmatter.slice(knownGapsIndex).split(/\r?\n(?=[a-zA-Z_]+:)/u)[0];
  if (!/^\s*-\s+/m.test(knownGapsBlock)) {
    throw new Error(`${label}: known_gaps must contain at least one item.`);
  }

  if (label.includes('vector-arrow')) {
    const requiredVectorArrowNotes = [
      'default の tick / coordinate label なし',
      'filled triangle tip',
      'play animation は追加しない',
    ];
    for (const note of requiredVectorArrowNotes) {
      if (!knownGapsBlock.includes(note)) {
        throw new Error(`${label}: vector-arrow known_gaps must mention '${note}'.`);
      }
    }
  }
}

function compileExample(label, source) {
  try {
    const documentData = compileTextDsl(source);
    checkManimPreviewFrame(label, documentData);
    checkRenderableTimeline(label, documentData);
    checkGallerySpecificStructure(label, documentData);
  } catch (error) {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkManimPreviewFrame(label, documentData) {
  if (documentData.width !== 960 || documentData.height !== 540) {
    throw new Error(`${label}: expected 960x540 Manim preview frame, got ${documentData.width}x${documentData.height}.`);
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
  let renderedCamera = documentData.camera;
  const renderer = {
    render: (nodes, camera) => {
      renderedNodes = nodes;
      renderedCamera = camera ?? documentData.camera;
    },
  };
  const player = new Player(documentData, renderer);
  player.seek(seconds);
  const flattened = flattenNodes(renderedNodes);
  const visible = flattened.filter(isVisible);
  const visibleContent = flattened.filter((node) => isVisible(node) && !isBackgroundNode(node) && node.type !== 'group');
  const contentBounds = unionFiniteBounds(visibleContent.map((node) => approximateNodeBounds(node)));
  const svg = serializeSvgSample(documentData, renderedNodes, renderedCamera);
  return {
    nodes: renderedNodes,
    camera: renderedCamera,
    colors: new Set(visible.flatMap(colorValues)),
    contentColors: new Set(visibleContent.flatMap(colorValues)),
    contentBounds,
    contentVisibleCount: visibleContent.length,
    svg,
    hasTextOrMath: visible.some(
      (node) =>
        node.type === 'text' ||
        node.type === 'math' ||
        (node.type === 'brace' && typeof node.geometry?.label === 'string' && node.geometry.label.trim().length > 0),
    ),
    visibleCount: visible.length,
  };
}

function checkRenderableTimeline(label, documentData) {
  const duration = documentData.duration ?? Math.max(0, ...documentData.timeline.map((op) => op.t + ('duration' in op ? op.duration : 0)));
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${label}: expected a positive animation duration.`);
  }
  const expectedDuration = expectedDurationForLabel(label);
  if (expectedDuration !== undefined && Math.abs(duration - expectedDuration) > 0.005) {
    throw new Error(`${label}: expected duration ${expectedDuration}s, got ${duration}s.`);
  }

  const sampleTimes = [0, 0.2, 0.5, 0.8, 1].map((unit) => duration * unit);
  const samples = sampleTimes.map((seconds) => visualSample(documentData, seconds));
  const bestVisibleCount = Math.max(...samples.map((sample) => sample.visibleCount));
  const bestContentVisibleCount = Math.max(...samples.map((sample) => sample.contentVisibleCount));
  const colors = new Set(samples.flatMap((sample) => [...sample.colors]));
  const contentColors = new Set(samples.flatMap((sample) => [...sample.contentColors]));
  const nonBlackContentColors = [...contentColors].filter((color) => !isBlackColor(color));
  const hasTextOrMath = samples.some((sample) => sample.hasTextOrMath);
  const bestSvgElementCount = Math.max(...samples.map((sample) => sample.svg.elementCount));
  const bestSvgContentElementCount = Math.max(...samples.map((sample) => sample.svg.contentElementCount));
  const allowLabelFree = isFaithfulLabelFreeExample(label);
  const sceneHalfWidth = Number(documentData.width ?? 1280) / 2;
  const sceneHalfHeight = Number(documentData.height ?? 720) / 2;
  const frameBounds = {
    minX: -sceneHalfWidth,
    maxX: sceneHalfWidth,
    minY: -sceneHalfHeight,
    maxY: sceneHalfHeight,
  };
  const hasContentInFrame = samples.some(
    (sample) => sample.contentBounds && boundsIntersect(sample.contentBounds, frameBounds),
  );
  const maxContentWidth = Math.max(
    0,
    ...samples.map((sample) => (sample.contentBounds ? sample.contentBounds.maxX - sample.contentBounds.minX : 0)),
  );
  const maxContentHeight = Math.max(
    0,
    ...samples.map((sample) => (sample.contentBounds ? sample.contentBounds.maxY - sample.contentBounds.minY : 0)),
  );

  if (bestVisibleCount < (allowLabelFree ? 2 : 3)) {
    throw new Error(`${label}: rendered timeline has too few visible nodes.`);
  }
  if (bestContentVisibleCount < 1) {
    throw new Error(`${label}: rendered timeline has no visible non-background content.`);
  }
  if (bestSvgElementCount < (allowLabelFree ? 2 : 3)) {
    throw new Error(`${label}: SVG render smoke test produced too few elements.`);
  }
  if (bestSvgContentElementCount < 1) {
    throw new Error(`${label}: SVG render smoke test produced no non-background content elements.`);
  }
  for (const sample of samples) {
    if (!sample.svg.source.startsWith('<svg ') || !sample.svg.source.endsWith('</svg>')) {
      throw new Error(`${label}: SVG render smoke test did not produce a complete svg root.`);
    }
    if (/\b(?:NaN|Infinity|undefined|null)\b/u.test(sample.svg.source)) {
      throw new Error(`${label}: SVG render smoke test emitted non-finite or undefined values.`);
    }
  }
  if (!hasContentInFrame) {
    throw new Error(`${label}: visible non-background content never intersects the scene frame.`);
  }
  if (maxContentWidth > sceneHalfWidth * 8 || maxContentHeight > sceneHalfHeight * 8) {
    throw new Error(`${label}: visible content bounds are implausibly large.`);
  }
  if (colors.size < 2) {
    throw new Error(`${label}: rendered timeline should use at least two visible colors.`);
  }
  if (contentColors.size < 1) {
    throw new Error(`${label}: rendered timeline should include visible non-background color.`);
  }
  if (nonBlackContentColors.length < 1) {
    throw new Error(`${label}: visible non-background content should not be black-only.`);
  }
  if (!hasTextOrMath && !allowLabelFree) {
    throw new Error(`${label}: rendered timeline should include text or math labels for gallery readability.`);
  }
}

function findNode(documentData, id) {
  return flattenNodes(documentData.nodes).find((node) => node.id === id);
}

function countNodesWithPrefix(documentData, prefix) {
  return flattenNodes(documentData.nodes).filter((node) => node.id.startsWith(prefix)).length;
}

function assertGalleryCondition(label, condition, message) {
  if (!condition) throw new Error(`${label}: ${message}`);
}

function isBackgroundNode(node) {
  const width = Number(node.geometry?.w ?? 0);
  const height = Number(node.geometry?.h ?? 0);
  return (
    node.id === 'bg' ||
    (node.type === 'rect' &&
      width >= 900 &&
      height >= 500 &&
      node.style?.fill === '#000000' &&
      (node.style?.stroke === undefined || node.style.stroke === 'none'))
  );
}

function isBlackColor(color) {
  const normalized = String(color).trim().toLowerCase();
  return normalized === '#000' || normalized === '#000000' || normalized === 'black' || normalized === 'rgb(0,0,0)' || normalized === 'rgb(0, 0, 0)';
}

function approximateNodeBounds(node) {
  const childBounds = unionFiniteBounds((node.children ?? []).map((child) => approximateNodeBounds(child)));
  if (childBounds) return offsetAndScaleBounds(childBounds, node);

  const x = Number(node.transform?.x ?? 0);
  const y = Number(node.transform?.y ?? 0);
  const scale = Number(node.transform?.scale ?? 1);
  const scaleX = scale * Number(node.transform?.scaleX ?? 1);
  const scaleY = scale * Number(node.transform?.scaleY ?? 1);

  if (node.type === 'circle') {
    const r = Number(node.geometry?.r ?? 40) * Math.max(Math.abs(scaleX), Math.abs(scaleY));
    return { minX: x - r, maxX: x + r, minY: y - r, maxY: y + r };
  }
  if (node.type === 'line') {
    const x1 = Number(node.geometry?.x1 ?? 0) * scaleX;
    const x2 = Number(node.geometry?.x2 ?? 0) * scaleX;
    const y1 = Number(node.geometry?.y1 ?? 0) * scaleY;
    const y2 = Number(node.geometry?.y2 ?? 0) * scaleY;
    return {
      minX: x + Math.min(x1, x2),
      maxX: x + Math.max(x1, x2),
      minY: y + Math.min(y1, y2),
      maxY: y + Math.max(y1, y2),
    };
  }
  if (node.type === 'path') {
    const pathBounds = pathDataBounds(String(node.geometry?.d ?? ''));
    if (pathBounds) return offsetAndScaleBounds(pathBounds, node);
  }

  const fontSize = Number(node.geometry?.fontSize ?? 32);
  const contentLength = node.type === 'math'
    ? String(node.latex ?? '').length
    : String(node.text ?? '').length;
  const fallbackWidth = Math.max(fontSize * 2, contentLength * fontSize * 0.55);
  const fallbackHeight = node.type === 'math' ? fontSize * 2.5 : fontSize * 1.5;
  const width = Number(node.geometry?.w ?? fallbackWidth) * Math.abs(scaleX);
  const height = Number(node.geometry?.h ?? fallbackHeight) * Math.abs(scaleY);
  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minY: y - height / 2,
    maxY: y + height / 2,
  };
}

function pathDataBounds(d) {
  const values = [...d.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/giu)].map((match) => Number(match[0]));
  const points = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    const x = values[index];
    const y = values[index + 1];
    if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
  }
  if (points.length === 0) return undefined;
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function offsetAndScaleBounds(bounds, node) {
  const x = Number(node.transform?.x ?? 0);
  const y = Number(node.transform?.y ?? 0);
  const scale = Number(node.transform?.scale ?? 1);
  const scaleX = scale * Number(node.transform?.scaleX ?? 1);
  const scaleY = scale * Number(node.transform?.scaleY ?? 1);
  const xs = [bounds.minX * scaleX, bounds.maxX * scaleX];
  const ys = [bounds.minY * scaleY, bounds.maxY * scaleY];
  return {
    minX: x + Math.min(...xs),
    maxX: x + Math.max(...xs),
    minY: y + Math.min(...ys),
    maxY: y + Math.max(...ys),
  };
}

function unionFiniteBounds(boundsList) {
  const finite = boundsList.filter(
    (bounds) =>
      bounds &&
      Number.isFinite(bounds.minX) &&
      Number.isFinite(bounds.maxX) &&
      Number.isFinite(bounds.minY) &&
      Number.isFinite(bounds.maxY),
  );
  if (finite.length === 0) return undefined;
  return {
    minX: Math.min(...finite.map((bounds) => bounds.minX)),
    maxX: Math.max(...finite.map((bounds) => bounds.maxX)),
    minY: Math.min(...finite.map((bounds) => bounds.minY)),
    maxY: Math.max(...finite.map((bounds) => bounds.maxY)),
  };
}

function boundsIntersect(left, right) {
  return left.minX <= right.maxX && left.maxX >= right.minX && left.minY <= right.maxY && left.maxY >= right.minY;
}

function approximatelyEqual(left, right, epsilon = 0.005) {
  return Math.abs(left - right) <= epsilon;
}

function hasAnimation(documentData, expected) {
  return documentData.timeline.some((op) => {
    if (op.op !== 'animate') return false;
    for (const [key, value] of Object.entries(expected)) {
      if (typeof value === 'number') {
        if (!approximatelyEqual(Number(op[key]), value)) return false;
      } else if (op[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

function svgSampleAt(documentData, seconds) {
  return visualSample(documentData, seconds).svg.source;
}

function countSvgOccurrences(source, pattern) {
  return (source.match(pattern) ?? []).length;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function svgGroupPathData(source, id) {
  const match = new RegExp(`<g id="${escapeRegExp(escapeXml(id))}"[^>]*><path d="([^"]*)"`, 'u').exec(source);
  return match?.[1] ?? '';
}

function svgPathPoints(d) {
  const points = [];
  const numberPattern = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/giu;
  for (const command of String(d).matchAll(/([MLC])([^MLCZ]*)/giu)) {
    const kind = command[1].toUpperCase();
    const numbers = [...command[2].matchAll(numberPattern)].map((match) => Number(match[0]));
    if (kind === 'M' || kind === 'L') {
      for (let index = 0; index + 1 < numbers.length; index += 2) {
        points.push({ x: numbers[index], y: numbers[index + 1] });
      }
      continue;
    }
    for (let index = 0; index + 5 < numbers.length; index += 6) {
      points.push({ x: numbers[index + 4], y: numbers[index + 5] });
    }
  }
  return points;
}

function svgPathLastPoint(d) {
  const points = svgPathPoints(d);
  const last = points.at(-1);
  if (!last) return undefined;
  return { ...last, count: points.length };
}

function svgElementTag(source, id) {
  const match = new RegExp(`<[^>]+id="${escapeRegExp(escapeXml(id))}"[^>]*>`, 'u').exec(source);
  return match?.[0] ?? '';
}

function renderedNodeAt(documentData, seconds, id) {
  return flattenNodes(visualSample(documentData, seconds).nodes).find((node) => node.id === id);
}

function findRenderedNode(sample, id) {
  return flattenNodes(sample.nodes).find((node) => node.id === id);
}

function serializeSvgSample(documentData, nodes, camera) {
  const width = Number(documentData.width ?? 960);
  const height = Number(documentData.height ?? 540);
  const nodeById = new Map(flattenNodes(nodes).map((node) => [node.id, node]));
  const sceneNodes = nodes.filter((node) => !isFixedInFrameNode(node));
  const fixedNodes = nodes.filter((node) => isFixedInFrameNode(node));
  const scene = sceneNodes.map((node) => serializeSvgNode(node, { parentOpacity: 1, nodeById })).join('');
  const fixed = fixedNodes.map((node) => serializeSvgNode(node, { parentOpacity: 1, nodeById })).join('');
  const cameraTransform = buildCameraTransform(camera ?? {}, width, height);
  const fixedLayer = fixed ? `<g transform="${buildFixedFrameTransform(width, height)}">${fixed}</g>` : '';
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${formatSvgNumber(width)} ${formatSvgNumber(height)}"><g transform="${cameraTransform}">${scene}</g>${fixedLayer}</svg>`;
  return {
    source,
    elementCount: (source.match(/<(?:g|path|circle|rect|line|polygon|text)\b/gu) ?? []).length,
    contentElementCount: countSerializedContentElements(nodes),
  };
}

function isFixedInFrameNode(node) {
  return node.geometry?.fixedInFrame === true;
}

function countSerializedContentElements(nodes) {
  let count = 0;
  for (const node of flattenNodes(nodes)) {
    if (node.type === 'group' || isBackgroundNode(node) || !isVisible(node)) continue;
    count += node.type === 'image' ? Math.max(1, imagePixelCount(node)) : 1;
  }
  return count;
}

function serializeSvgNode(node, context) {
  const opacity = Number(node.transform?.opacity ?? 1) * context.parentOpacity;
  if (!Number.isFinite(opacity) || opacity <= 0.0001) return '';
  const transform = serializeNodeTransform(node.transform);
  if (node.type === 'group') {
    const clipPath = serializeClipPathAttribute(node, context.nodeById);
    return `<g id="${escapeXml(node.id)}"${transform ? ` transform="${transform}"` : ''} opacity="${formatSvgNumber(opacity)}"${clipPath}>${(node.children ?? []).map((child) => serializeSvgNode(child, { parentOpacity: opacity, nodeById: context.nodeById })).join('')}</g>`;
  }
  if (node.type === 'image') {
    return serializeImageNode(node, opacity, transform);
  }

  const style = serializeStyle(node.style, opacity, node.geometry);
  const drawProgress = serializeDrawProgressAttributes(node.geometry);
  if (node.type === 'circle') {
    return `<circle id="${escapeXml(node.id)}" cx="0" cy="0" r="${formatSvgNumber(node.geometry?.r ?? 0)}"${transform ? ` transform="${transform}"` : ''}${style}${drawProgress}/>`;
  }
  if (node.type === 'rect') {
    const w = Number(node.geometry?.w ?? 0);
    const h = Number(node.geometry?.h ?? 0);
    return `<rect id="${escapeXml(node.id)}" x="${formatSvgNumber(-w / 2)}" y="${formatSvgNumber(-h / 2)}" width="${formatSvgNumber(w)}" height="${formatSvgNumber(h)}"${transform ? ` transform="${transform}"` : ''}${style}${drawProgress}/>`;
  }
  if (node.type === 'triangle') {
    const w = Number(node.geometry?.w ?? 0);
    const h = Number(node.geometry?.h ?? 0);
    const points = `0,${formatSvgNumber(-h / 2)} ${formatSvgNumber(w / 2)},${formatSvgNumber(h / 2)} ${formatSvgNumber(-w / 2)},${formatSvgNumber(h / 2)}`;
    return `<polygon id="${escapeXml(node.id)}" points="${points}"${transform ? ` transform="${transform}"` : ''}${style}${drawProgress}/>`;
  }
  if (node.type === 'line') {
    return `<line id="${escapeXml(node.id)}" x1="${formatSvgNumber(node.geometry?.x1 ?? 0)}" y1="${formatSvgNumber(node.geometry?.y1 ?? 0)}" x2="${formatSvgNumber(node.geometry?.x2 ?? 0)}" y2="${formatSvgNumber(node.geometry?.y2 ?? 0)}"${transform ? ` transform="${transform}"` : ''}${style}${drawProgress}/>`;
  }
  if (node.type === 'path' || node.type === 'brace') {
    const brace = node.type === 'brace'
      ? buildSerializedBracePath(node, context.nodeById)
      : undefined;
    const d = brace?.path ?? String(node.geometry?.d ?? '');
    const label = node.type === 'brace' && typeof node.geometry?.label === 'string'
      ? `<text x="${formatSvgNumber(brace?.anchor.x ?? 0)}" y="${formatSvgNumber(brace?.anchor.y ?? Number(node.geometry?.labelH ?? 40) / 2)}" text-anchor="middle" font-size="${formatSvgNumber(node.geometry?.labelSize ?? 32)}" fill="${escapeXml(node.geometry?.labelColor ?? '#ffffff')}">${escapeXml(node.geometry.label)}</text>`
      : '';
    const fillRule = typeof node.geometry?.fillRule === 'string' && node.geometry.fillRule.length > 0
      ? ` fill-rule="${escapeXml(node.geometry.fillRule)}"`
      : '';
    return `<g id="${escapeXml(node.id)}"${transform ? ` transform="${transform}"` : ''} opacity="${formatSvgNumber(opacity)}"><path d="${escapeXml(d)}"${fillRule}${serializeStyle(node.style, 1, node.geometry)}${drawProgress}/>${label}</g>`;
  }
  if (node.type === 'math' && (node.children ?? []).length > 0) {
    return `<g id="${escapeXml(node.id)}"${transform ? ` transform="${transform}"` : ''} opacity="${formatSvgNumber(opacity)}">${(node.children ?? []).map((child) => serializeSvgNode(child, { parentOpacity: opacity, nodeById: context.nodeById })).join('')}</g>`;
  }
  if (node.type === 'text' || node.type === 'math') {
    const text = node.type === 'math' ? String(node.latex ?? '') : String(node.text ?? '');
    return `<text id="${escapeXml(node.id)}" x="0" y="0"${transform ? ` transform="${transform}"` : ''} font-size="${formatSvgNumber(node.geometry?.fontSize ?? 32)}"${style}>${escapeXml(text)}</text>`;
  }
  return '';
}

function serializeClipPathAttribute(node, nodeById) {
  const rect = resolveSerializedClipRect(node, nodeById);
  if (!rect) return '';
  return ` clip-path="inset(${formatSvgNumber(rect.y - rect.h / 2)} ${formatSvgNumber(rect.x - rect.w / 2)} ${formatSvgNumber(rect.h)} ${formatSvgNumber(rect.w)})"`;
}

function resolveSerializedClipRect(node, nodeById) {
  const targetId = typeof node.geometry?.clipTarget === 'string' ? node.geometry.clipTarget : '';
  if (targetId) {
    const target = nodeById.get(targetId);
    if (!target) return null;
    return serializedNodeClipBounds(target);
  }

  if (node.geometry?.clip !== 'rect') return null;
  const w = Number(node.geometry?.clipW);
  const h = Number(node.geometry?.clipH);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return {
    x: Number(node.geometry?.clipX ?? 0),
    y: Number(node.geometry?.clipY ?? 0),
    w,
    h,
  };
}

function serializedNodeClipBounds(node) {
  if (node.type !== 'rect' && node.type !== 'image') return null;
  const scale = Number(node.transform?.scale ?? 1);
  const scaleX = scale * Number(node.transform?.scaleX ?? 1);
  const scaleY = scale * Number(node.transform?.scaleY ?? 1);
  const w = Math.abs(Number(node.geometry?.w ?? 0) * scaleX);
  const h = Math.abs(Number(node.geometry?.h ?? 0) * scaleY);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return {
    x: Number(node.transform?.x ?? 0),
    y: Number(node.transform?.y ?? 0),
    w,
    h,
  };
}

function serializeImageNode(node, opacity, transform) {
  const pixels = parseImagePixels(String(node.geometry?.data ?? ''), Number(node.geometry?.dataRows ?? 0));
  if (pixels.length === 0 || pixels[0]?.length === 0) {
    const w = Number(node.geometry?.w ?? 0);
    const h = Number(node.geometry?.h ?? 0);
    return `<rect id="${escapeXml(node.id)}" x="${formatSvgNumber(-w / 2)}" y="${formatSvgNumber(-h / 2)}" width="${formatSvgNumber(w)}" height="${formatSvgNumber(h)}"${transform ? ` transform="${transform}"` : ''} fill="#ffffff" opacity="${formatSvgNumber(opacity)}"/>`;
  }
  const w = Number(node.geometry?.w ?? 0);
  const h = Number(node.geometry?.h ?? 0);
  const rows = pixels.length;
  const cols = pixels[0].length;
  const horizontalGradient = detectHorizontalImageGradient(pixels, cols);
  if (horizontalGradient) {
    return `<g id="${escapeXml(node.id)}"${transform ? ` transform="${transform}"` : ''} opacity="${formatSvgNumber(opacity)}"><rect x="${formatSvgNumber(-w / 2)}" y="${formatSvgNumber(-h / 2)}" width="${formatSvgNumber(w)}" height="${formatSvgNumber(h)}" fill="linear-gradient(${horizontalGradient.join(',')})"/></g>`;
  }
  const cellW = w / cols;
  const cellH = h / rows;
  const rects = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = clamp(Number(pixels[row]?.[col] ?? 0), 0, 255);
      const hex = value.toString(16).padStart(2, '0');
      rects.push(`<rect x="${formatSvgNumber(-w / 2 + col * cellW)}" y="${formatSvgNumber(-h / 2 + row * cellH)}" width="${formatSvgNumber(cellW)}" height="${formatSvgNumber(cellH)}" fill="#${hex}${hex}${hex}"/>`);
    }
  }
  return `<g id="${escapeXml(node.id)}"${transform ? ` transform="${transform}"` : ''} opacity="${formatSvgNumber(opacity)}">${rects.join('')}</g>`;
}

function detectHorizontalImageGradient(pixels, cols) {
  if (pixels.length < 2 || cols < 2) return undefined;
  const first = Array.from({ length: cols }, (_, index) => Number(pixels[0]?.[index] ?? pixels[0]?.at(-1) ?? 0));
  if (!pixels.every((row) => first.every((value, index) => Math.abs(Number(row[index] ?? row.at(-1) ?? 0) - value) < 1e-9))) {
    return undefined;
  }
  return first.map((value) => {
    const gray = clamp(Math.round(Number(value)), 0, 255);
    const hex = gray.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  });
}

function buildSerializedBracePath(node, nodeById) {
  const target = nodeById.get(String(node.geometry?.target ?? ''));
  if (!target) return { path: 'M 0 0', anchor: { x: 0, y: 0 } };
  const buff = Math.max(0, Number(node.geometry?.buff ?? 8));
  const sharpness = clamp(Number(node.geometry?.sharpness ?? 2), 0.1, 8);
  const curvature = clamp(Number(node.geometry?.curvature ?? (0.2 + 0.04 / sharpness)), 0.08, 0.6);
  const tip = clamp(Number(node.geometry?.tip ?? (0.48 / Math.sqrt(sharpness))), 0.12, 0.75);
  const direction = String(node.geometry?.direction ?? 'down');
  if (target.type === 'line' && ['perpendicular', 'normal', 'line'].includes(direction)) {
    return buildSerializedLineBrace(target, buff, curvature, tip, node);
  }
  const bounds = approximateNodeBounds(target);
  if (!bounds) return { path: 'M 0 0', anchor: { x: 0, y: 0 } };
  if (direction === 'up' || direction === 'down') {
    const length = Math.max(1, bounds.maxX - bounds.minX);
    const sign = direction === 'up' ? -1 : 1;
    const y = direction === 'up' ? bounds.minY - buff : bounds.maxY + buff;
    const brace = buildSerializedBraceRibbon(
      { x: bounds.minX, y },
      { x: bounds.maxX, y },
      { x: 0, y: sign },
      curvature,
      tip,
    );
    return {
      path: brace.path,
      anchor: computeSerializedBraceLabelAnchor(
        { x: (bounds.minX + bounds.maxX) / 2, y: brace.tipPoint.y },
        sign,
        brace.tipDepth,
        length,
        node,
        true,
      ),
    };
  }
  const length = Math.max(1, bounds.maxY - bounds.minY);
  const sign = direction === 'left' ? -1 : 1;
  const x = direction === 'left' ? bounds.minX - buff : bounds.maxX + buff;
  const brace = buildSerializedBraceRibbon(
    { x, y: bounds.minY },
    { x, y: bounds.maxY },
    { x: sign, y: 0 },
    curvature,
    tip,
  );
  return {
    path: brace.path,
    anchor: computeSerializedBraceLabelAnchor(
      { x: brace.tipPoint.x, y: (bounds.minY + bounds.maxY) / 2 },
      sign,
      brace.tipDepth,
      length,
      node,
      false,
    ),
  };
}

function buildSerializedLineBrace(target, buff, curvature, tip, node) {
  const tx = Number(target.transform?.x ?? 0);
  const ty = Number(target.transform?.y ?? 0);
  const start = { x: tx + Number(target.geometry?.x1 ?? 0), y: ty + Number(target.geometry?.y1 ?? 0) };
  const end = { x: tx + Number(target.geometry?.x2 ?? 0), y: ty + Number(target.geometry?.y2 ?? 0) };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) return { path: 'M 0 0', anchor: start };
  const nx = dy / length;
  const ny = -dx / length;
  const brace = buildSerializedBraceRibbon(
    { x: start.x + nx * buff, y: start.y + ny * buff },
    { x: end.x + nx * buff, y: end.y + ny * buff },
    { x: nx, y: ny },
    curvature,
    tip,
  );
  const gap = serializedBraceLabelGap(brace.tipDepth, length, node);
  return {
    path: brace.path,
    anchor: { x: brace.tipPoint.x + nx * gap, y: brace.tipPoint.y + ny * gap },
  };
}

function buildSerializedBraceRibbon(start, end, normal, curvature, tip) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / length;
  const uy = dy / length;
  const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const tipDepth = clamp(length * tip * 0.34, 16, Math.max(22, length * 0.38));
  const p = (along, outward) =>
    `${formatSvgNumber(center.x + ux * along + normal.x * outward)} ${formatSvgNumber(center.y + uy * along + normal.y * outward)}`;
  const tipPoint = {
    x: center.x + normal.x * tipDepth,
    y: center.y + normal.y * tipDepth,
  };
  const thickness = clamp(length * (0.012 + curvature * 0.014), 4.5, 10);
  const innerThickness = thickness * 0.72;
  const tipThickness = thickness * 1.4;
  const endCurl = clamp(length * 0.055, 7, 20);
  return {
    path: [
      `M ${p(-length / 2, 0)}`,
      `C ${p(-length / 2 + endCurl, 0)} ${p(-length * 0.38, thickness)} ${p(-length * 0.22, thickness)}`,
      `C ${p(-length * 0.1, thickness)} ${p(-length * 0.08, tipDepth - tipThickness)} ${p(0, tipDepth)}`,
      `C ${p(length * 0.08, tipDepth - tipThickness)} ${p(length * 0.1, thickness)} ${p(length * 0.22, thickness)}`,
      `C ${p(length * 0.38, thickness)} ${p(length / 2 - endCurl, 0)} ${p(length / 2, 0)}`,
      `C ${p(length / 2 - endCurl, -innerThickness)} ${p(length * 0.38, -innerThickness)} ${p(length * 0.22, -innerThickness)}`,
      `C ${p(length * 0.1, -innerThickness)} ${p(length * 0.08, tipDepth - tipThickness * 2)} ${p(0, tipDepth - tipThickness)}`,
      `C ${p(-length * 0.08, tipDepth - tipThickness * 2)} ${p(-length * 0.1, -innerThickness)} ${p(-length * 0.22, -innerThickness)}`,
      `C ${p(-length * 0.38, -innerThickness)} ${p(-length / 2 + endCurl, -innerThickness)} ${p(-length / 2, 0)}`,
      'Z',
    ].join(' '),
    tipPoint,
    tipDepth,
  };
}

function computeSerializedBraceLabelAnchor(tipPoint, outwardSign, tipDepth, targetLength, node, horizontal) {
  const alignment = String(node.geometry?.labelAlignment ?? 'center').toLowerCase();
  const gap = serializedBraceLabelGap(tipDepth, targetLength, node);
  const axisShift = clamp(targetLength * 0.28, 18, 90);
  const shiftSign = alignment === 'start' ? -1 : alignment === 'end' ? 1 : 0;
  if (horizontal) return { x: tipPoint.x + shiftSign * axisShift, y: tipPoint.y + outwardSign * gap };
  return { x: tipPoint.x + outwardSign * gap, y: tipPoint.y + shiftSign * axisShift };
}

function serializedBraceLabelGap(tipDepth, targetLength, node) {
  const rawOffset = Number(node.geometry?.labelOffset ?? 0);
  const stretch = clamp(targetLength / 220, 0.65, 2.4);
  return Math.max(0, tipDepth * 0.52 + 10 + stretch * 3.5 + rawOffset * stretch);
}

function parseImagePixels(raw, dataRows = 0) {
  const rows = raw
    .split(';')
    .map((row) => row.split(',').map((value) => Number(value.trim())))
    .filter((row) => row.length > 0 && row.every((value) => Number.isFinite(value)));
  const repeatRows = Math.max(0, Math.floor(dataRows));
  if (rows.length === 1 && repeatRows > 1) return Array.from({ length: repeatRows }, () => [...rows[0]]);
  return rows;
}

function imagePixelCount(node) {
  const pixels = parseImagePixels(String(node.geometry?.data ?? ''), Number(node.geometry?.dataRows ?? 0));
  return pixels.reduce((count, row) => count + row.length, 0);
}

function serializeNodeTransform(transform = {}) {
  const x = Number(transform.x ?? 0);
  const y = Number(transform.y ?? 0);
  const scale = Number(transform.scale ?? 1);
  const scaleX = scale * Number(transform.scaleX ?? 1);
  const scaleY = scale * Number(transform.scaleY ?? 1);
  const rotation = Number(transform.rotation ?? 0);
  const parts = [];
  if (x !== 0 || y !== 0) parts.push(`translate(${formatSvgNumber(x)} ${formatSvgNumber(y)})`);
  if (rotation !== 0) parts.push(`rotate(${formatSvgNumber(rotation)})`);
  if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${formatSvgNumber(scaleX)} ${formatSvgNumber(scaleY)})`);
  return parts.join(' ');
}

function serializeStyle(style = {}, opacity = 1, geometry = {}) {
  const fill = style.fill ?? 'none';
  const stroke = style.stroke ?? 'none';
  const strokeWidth = Number(style.strokeWidth ?? 0);
  const strokeLinecap = style.strokeLinecap;
  const strokeLinejoin = style.strokeLinejoin;
  let fillOpacity = Number(style.fillOpacity ?? 1);
  if (Object.hasOwn(geometry, 'drawProgress') && fill !== 'none') {
    const progress = clamp(Number(geometry.drawProgress), 0, 1);
    if (progress < 0.999) fillOpacity *= clamp((progress - 0.72) / 0.28, 0, 1);
  }
  const strokeOpacity = Number(style.strokeOpacity ?? 1);
  return [
    ` fill="${escapeXml(fill)}"`,
    ` stroke="${escapeXml(stroke)}"`,
    ` stroke-width="${formatSvgNumber(strokeWidth)}"`,
    strokeLinecap ? ` stroke-linecap="${escapeXml(strokeLinecap)}"` : '',
    strokeLinejoin ? ` stroke-linejoin="${escapeXml(strokeLinejoin)}"` : '',
    ` fill-opacity="${formatSvgNumber(fillOpacity)}"`,
    ` stroke-opacity="${formatSvgNumber(strokeOpacity)}"`,
    ` opacity="${formatSvgNumber(opacity)}"`,
  ].join('');
}

function serializeDrawProgressAttributes(geometry = {}) {
  if (!Object.hasOwn(geometry, 'drawProgress')) return '';
  const progress = clamp(Number(geometry.drawProgress), 0, 1);
  return ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="${formatSvgNumber(1 - progress)}"`;
}

function formatSvgNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return String(Math.round(number * 1_000_000) / 1_000_000);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function checkGallerySpecificStructure(label, documentData) {
  if (label.includes('simple-circle')) {
    assertGalleryCondition(label, documentData.width === 960 && documentData.height === 540, 'expected 960x540 frame so Circle(radius=1) maps to 67.5px.');
    const circle = findNode(documentData, 'circle');
    const createStartCircle = renderedNodeAt(documentData, 0, 'circle');
    const createMidCircle = renderedNodeAt(documentData, 0.5, 'circle');
    const createEndCircle = renderedNodeAt(documentData, 1, 'circle');
    const holdCircle = renderedNodeAt(documentData, 2, 'circle');
    assertGalleryCondition(label, circle?.type === 'circle', 'expected Circle mobject.');
    assertGalleryCondition(label, approximatelyEqual(circle?.geometry?.r ?? 0, 67.5), 'expected Manim default Circle radius at frame scale.');
    assertGalleryCondition(label, circle?.style?.fill === '#D147BD' && approximatelyEqual(circle?.style?.fillOpacity ?? 0, 0.5), 'expected PINK fill with opacity 0.5.');
    assertGalleryCondition(label, circle?.style?.stroke === '#ffffff' && approximatelyEqual(circle?.style?.strokeWidth ?? 0, 4), 'expected default white stroke.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'circle', path: 'geometry.drawProgress', from: 0, to: 1, t: 0, duration: 1, easing: 'easeInOut' }), 'expected one-second Create(circle) draw progress.');
    assertGalleryCondition(label, createStartCircle?.geometry?.drawProgress === 0 && createMidCircle?.geometry?.drawProgress === 0.5 && createEndCircle?.geometry?.drawProgress === 1 && holdCircle?.geometry?.drawProgress === 1, 'expected Create(circle) draw progress to reveal then hold.');
    const startSvg = svgSampleAt(documentData, 0);
    const midSvg = svgSampleAt(documentData, 0.5);
    const endSvg = svgSampleAt(documentData, 1);
    const holdSvg = svgSampleAt(documentData, 2);
    assertGalleryCondition(label, svgElementTag(startSvg, 'circle').includes('r="67.5"') && svgElementTag(startSvg, 'circle').includes('fill="#D147BD"') && svgElementTag(startSvg, 'circle').includes('stroke-dashoffset="1"'), 'expected SVG Circle start to be an undrawn Manim PINK circle.');
    assertGalleryCondition(label, svgElementTag(midSvg, 'circle').includes('stroke-dashoffset="0.5"') && svgElementTag(midSvg, 'circle').includes('fill-opacity="0"'), 'expected SVG Circle midpoint to show half stroke before fill reveal.');
    assertGalleryCondition(label, svgElementTag(endSvg, 'circle').includes('stroke-dashoffset="0"') && svgElementTag(endSvg, 'circle').includes('fill-opacity="0.5"'), 'expected SVG Circle end to show full PINK fill opacity.');
    assertGalleryCondition(label, svgElementTag(holdSvg, 'circle').includes('stroke-dashoffset="0"') && svgElementTag(holdSvg, 'circle').includes('fill-opacity="0.5"'), 'expected final wait to hold the completed PINK circle in SVG.');
  }

  if (label.includes('square-to-circle')) {
    assertGalleryCondition(label, documentData.width === 960 && documentData.height === 540, 'expected 960x540 frame so Square side length maps to 135px.');
    const square = findNode(documentData, 'square');
    const targetCircle = findNode(documentData, 'circle');
    const createStartSquare = renderedNodeAt(documentData, 0, 'square');
    const createMidSquare = renderedNodeAt(documentData, 0.5, 'square');
    const createEndSquare = renderedNodeAt(documentData, 1, 'square');
    const transformMidSquare = renderedNodeAt(documentData, 1.5, 'square');
    const transformEndSquare = renderedNodeAt(documentData, 2, 'square');
    const fadeMidSquare = renderedNodeAt(documentData, 2.5, 'square');
    const fadeEndSquare = renderedNodeAt(documentData, 3, 'square');
    assertGalleryCondition(label, square?.type === 'path' && targetCircle?.type === 'path', 'expected same-topology path square and circle for Transform.');
    assertGalleryCondition(label, square?.style?.stroke === '#ffffff' && approximatelyEqual(square?.style?.fillOpacity ?? -1, 0), 'expected rotated white square outline start.');
    assertGalleryCondition(label, targetCircle?.style?.fill === '#D147BD' && approximatelyEqual(targetCircle?.style?.fillOpacity ?? 0, 0.5), 'expected target PINK circle fill opacity 0.5.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'geometry.drawProgress', from: 0, to: 1, t: 0, duration: 1, easing: 'easeInOut' }), 'expected Create(square) draw progress.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'square' && op.effect === 'transform' && op.t === 1 && op.duration === 1), 'expected one-second Transform(square, circle).');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'style.fill', from: '#ffffff', to: '#D147BD', t: 1, duration: 1, easing: 'easeInOut' }), 'expected Transform to interpolate fill to PINK.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'style.fillOpacity', from: 0, to: 0.5, t: 1, duration: 1, easing: 'easeInOut' }), 'expected Transform to interpolate fill opacity.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'geometry.d', t: 1, duration: 1, easing: 'easeInOut' }), 'expected Transform path morph from rotated square to circle.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'transform.opacity', from: 1, to: 0, t: 2, duration: 1, easing: 'easeInOut' }), 'expected final FadeOut(square).');
    assertGalleryCondition(label, createStartSquare?.geometry?.drawProgress === 0 && createMidSquare?.geometry?.drawProgress === 0.5 && createEndSquare?.geometry?.drawProgress === 1, 'expected Create(square) draw progress to reveal the rotated square outline.');
    assertGalleryCondition(label, transformMidSquare?.style?.fill === 'rgb(232, 163, 222)' && approximatelyEqual(transformMidSquare.style?.fillOpacity ?? 0, 0.25) && String(transformMidSquare.geometry?.d ?? '').includes('M 0 -81.4795'), 'expected Transform midpoint to blend diamond geometry toward PINK circle.');
    assertGalleryCondition(label, transformEndSquare?.style?.fill === '#D147BD' && approximatelyEqual(transformEndSquare.style?.fillOpacity ?? 0, 0.5) && String(transformEndSquare.geometry?.d ?? '').startsWith('M 0 -67.5 C 37.279 -67.5'), 'expected Transform end to match the target PINK circle path.');
    assertGalleryCondition(label, approximatelyEqual(fadeMidSquare?.transform?.opacity ?? 0, 0.5) && fadeEndSquare === undefined, 'expected final FadeOut to fade the transformed circle away completely.');
    const createSvg = svgSampleAt(documentData, 0);
    const transformSvg = svgSampleAt(documentData, 1.5);
    const fadeSvg = svgSampleAt(documentData, 2.5);
    const finalSvg = svgSampleAt(documentData, 3);
    assertGalleryCondition(label, svgGroupPathData(createSvg, 'square').includes('M 0 -95.459') && createSvg.includes('stroke-dashoffset="1"'), 'expected SVG square start to be an undrawn rotated diamond.');
    assertGalleryCondition(label, svgGroupPathData(transformSvg, 'square').includes('M 0 -81.4795') && transformSvg.includes('fill="rgb(232, 163, 222)"') && transformSvg.includes('fill-opacity="0.25"'), 'expected SVG Transform midpoint to serialize blended geometry and color.');
    assertGalleryCondition(label, svgElementTag(fadeSvg, 'square').includes('opacity="0.5"') && svgGroupPathData(fadeSvg, 'square').startsWith('M 0 -67.5'), 'expected SVG FadeOut midpoint to keep the final circle path while fading.');
    assertGalleryCondition(label, !finalSvg.includes('id="square"'), 'expected final SVG frame to remove the faded-out transformed circle.');
  }

  if (label.includes('animations-using-animate') || label.includes('moving-around')) {
    const square = findNode(documentData, 'square');
    const shiftMidSquare = renderedNodeAt(documentData, 0.5, 'square');
    const fillMidSquare = renderedNodeAt(documentData, 1.5, 'square');
    const scaleMidSquare = renderedNodeAt(documentData, 2.5, 'square');
    const rotateMidSquare = renderedNodeAt(documentData, 3.5, 'square');
    const finalSquare = renderedNodeAt(documentData, 4, 'square');
    assertGalleryCondition(label, square?.type === 'rect', 'expected default Square mobject as rect.');
    assertGalleryCondition(label, approximatelyEqual(square?.geometry?.w ?? 0, 135) && approximatelyEqual(square?.geometry?.h ?? 0, 135), 'expected Manim default Square side length at frame scale.');
    assertGalleryCondition(label, square?.style?.stroke === '#58C4DD' && approximatelyEqual(square?.style?.strokeWidth ?? 0, 4), 'expected Manim BLUE stroke on square.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'transform.x', from: 0, to: -67.5, t: 0, duration: 1, easing: 'smooth' }), 'expected .animate.shift(LEFT).');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'style.fill', from: '#58C4DD', to: '#FF862F', t: 1, duration: 1, easing: 'smooth' }), 'expected .animate.set_fill(ORANGE).');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'transform.scale', from: 1, to: 0.3, t: 2, duration: 1, easing: 'smooth' }), 'expected .animate.scale(0.3).');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'square', path: 'transform.rotation', from: 0, to: 22.918311805232932, t: 3, duration: 1, easing: 'smooth' }), 'expected .animate.rotate(0.4 radians).');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'effect' && op.id === 'square' && op.effect === 'animate').length === 4, 'expected four sequential Animate effects.');
    assertGalleryCondition(label, approximatelyEqual(shiftMidSquare?.transform?.x ?? 0, -33.75) && shiftMidSquare?.style?.fill === '#58C4DD', 'expected smooth shift midpoint to keep the BLUE square halfway left.');
    assertGalleryCondition(label, approximatelyEqual(fillMidSquare?.transform?.x ?? 0, -67.5) && fillMidSquare?.style?.fill === 'rgb(172, 165, 134)' && fillMidSquare?.transform?.scale === 1, 'expected smooth fill midpoint to blend BLUE toward ORANGE without moving.');
    assertGalleryCondition(label, approximatelyEqual(scaleMidSquare?.transform?.scale ?? 0, 0.65) && scaleMidSquare?.style?.fill === '#FF862F', 'expected smooth scale midpoint to shrink the ORANGE square.');
    assertGalleryCondition(label, approximatelyEqual(rotateMidSquare?.transform?.rotation ?? 0, 11.459156) && approximatelyEqual(rotateMidSquare?.transform?.scale ?? 0, 0.3), 'expected smooth rotation midpoint after scale target is reached.');
    assertGalleryCondition(label, approximatelyEqual(finalSquare?.transform?.x ?? 0, -67.5) && approximatelyEqual(finalSquare?.transform?.scale ?? 0, 0.3) && approximatelyEqual(finalSquare?.transform?.rotation ?? 0, 22.918312) && finalSquare?.style?.fill === '#FF862F', 'expected final MovingAround target state.');
    const shiftMidSvg = svgSampleAt(documentData, 0.5);
    const fillMidSvg = svgSampleAt(documentData, 1.5);
    const scaleMidSvg = svgSampleAt(documentData, 2.5);
    const rotateMidSvg = svgSampleAt(documentData, 3.5);
    const finalSvg = svgSampleAt(documentData, 4);
    assertGalleryCondition(label, svgElementTag(shiftMidSvg, 'square').includes('transform="translate(-33.75 0)"') && svgElementTag(shiftMidSvg, 'square').includes('fill="#58C4DD"'), 'expected SVG shift midpoint to serialize halfway-left BLUE square.');
    assertGalleryCondition(label, svgElementTag(fillMidSvg, 'square').includes('transform="translate(-67.5 0)"') && svgElementTag(fillMidSvg, 'square').includes('fill="rgb(172, 165, 134)"'), 'expected SVG fill midpoint to serialize blended Manim color.');
    assertGalleryCondition(label, svgElementTag(scaleMidSvg, 'square').includes('transform="translate(-67.5 0) scale(0.65 0.65)"') && svgElementTag(scaleMidSvg, 'square').includes('fill="#FF862F"'), 'expected SVG scale midpoint to serialize the shrinking ORANGE square.');
    assertGalleryCondition(label, svgElementTag(rotateMidSvg, 'square').includes('rotate(11.459156) scale(0.3 0.3)'), 'expected SVG rotation midpoint to serialize rotated scaled square.');
    assertGalleryCondition(label, svgElementTag(finalSvg, 'square').includes('transform="translate(-67.5 0) rotate(22.918312) scale(0.3 0.3)"'), 'expected SVG final square transform to match MovingAround target state.');
  }

  if (label.includes('gradient-image-from-array')) {
    const image = findNode(documentData, 'image');
    const frame = findNode(documentData, 'frame');
    const rows = String(image?.geometry?.data ?? '').split(';');
    const firstRow = rows[0]?.split(',').map((value) => Number(value)) ?? [];
    assertGalleryCondition(label, image?.type === 'image', 'expected ImageMobject-like image node.');
    assertGalleryCondition(label, image?.geometry?.sampling === 'nearest', 'expected nearest sampling for array image pixels.');
    assertGalleryCondition(label, image?.geometry?.w === 256 && image?.geometry?.h === 256, 'expected 256x256 grayscale image display.');
    assertGalleryCondition(label, image?.geometry?.dataRows === 256 && rows.length === 1 && firstRow.length === 256, 'expected official 256x256 grayscale array data via repeated source row.');
    assertGalleryCondition(label, firstRow[0] === 0 && firstRow[128] === 128 && firstRow.at(-1) === 255, 'expected horizontal grayscale gradient from black through midpoint gray to white.');
    assertGalleryCondition(label, frame?.type === 'rect' && approximatelyEqual(frame.geometry?.w ?? 0, 269.5) && approximatelyEqual(frame.geometry?.h ?? 0, 269.5), 'expected Manim GREEN frame around image with MED_SMALL_BUFF.');
    assertGalleryCondition(label, frame?.style?.stroke === '#83C167' && approximatelyEqual(frame.style?.strokeWidth ?? 0, 4), 'expected GREEN image border.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'image') < documentData.nodes.findIndex((node) => node.id === 'frame'), 'expected SurroundingRectangle frame to render above the ImageMobject.');
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, countSvgOccurrences(svg, /<rect\b/gu) === 3, 'expected SVG to collapse repeated image rows into one smooth gradient rect plus background and frame.');
    assertGalleryCondition(label, svg.includes('linear-gradient(#000000') && svg.includes('#ffffff)') && svg.includes('stroke="#83C167"'), 'expected SVG gradient endpoints and green frame.');
    assertGalleryCondition(label, /<g id="image"[^>]*><rect x="-128" y="-128" width="256" height="256" fill="linear-gradient\(#000000,#010101,#020202/u.test(svg), 'expected SVG image to serialize a 256px horizontal grayscale gradient.');
    assertGalleryCondition(label, svg.indexOf('id="image"') < svg.indexOf('id="frame"') && /id="frame"[^>]*width="269\.5"[^>]*height="269\.5"[^>]*stroke="#83C167"/u.test(svg), 'expected SVG green frame to render above the image at Manim buff size.');
  }

  if (label.includes('vector-arrow')) {
    const plane = findNode(documentData, 'plane');
    const arrow = findNode(documentData, 'vec');
    const shaft = findNode(documentData, 'vec:shaft');
    const tip = findNode(documentData, 'vec:tip');
    const origin = findNode(documentData, 'origin');
    const originLabel = findNode(documentData, 'origin_label');
    const tipLabel = findNode(documentData, 'tip_label');
    assertGalleryCondition(label, plane?.geometry?.numberPlane === true, 'expected NumberPlane background.');
    assertGalleryCondition(label, ['plane', 'origin', 'vec', 'tip_anchor', 'origin_label', 'tip_label'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected official self.add(numberplane, dot, arrow, origin_text, tip_text) z-order.');
    assertGalleryCondition(label, documentData.timeline.every((op) => op.op === 'create' || op.op === 'set'), 'expected VectorArrow to stay a static self.add scene with no play animations.');
    assertGalleryCondition(label, plane?.children?.length === 22 && approximatelyEqual(plane.geometry?.xUnit ?? 0, 67.5) && approximatelyEqual(plane.geometry?.yUnit ?? 0, 67.5), 'expected 16:9 NumberPlane grid at Manim unit scale without boundary grid lines.');
    assertGalleryCondition(label, approximatelyEqual(plane?.geometry?.xMin ?? 0, -7.111111) && approximatelyEqual(plane?.geometry?.xMax ?? 0, 7.111111) && plane?.geometry?.yMin === -4 && plane.geometry?.yMax === 4, 'expected NumberPlane to use the full Manim frame range.');
    assertGalleryCondition(label, plane?.geometry?.includeTicks === false && plane.geometry?.addCoordinates === false, 'expected default NumberPlane without ticks or coordinate labels.');
    assertGalleryCondition(label, findNode(documentData, 'plane:h:0')?.style?.stroke === '#FFFFFF' && findNode(documentData, 'plane:v:0')?.style?.stroke === '#FFFFFF' && findNode(documentData, 'plane:h:m1')?.style?.stroke === '#29ABCA' && findNode(documentData, 'plane:v:1')?.style?.stroke === '#29ABCA', 'expected white axes and BLUE_D NumberPlane grid lines.');
    assertGalleryCondition(label, arrow?.geometry?.arrow === true && arrow.geometry?.x2 === 135 && arrow.geometry?.y2 === -135, 'expected vector from ORIGIN to [2, 2, 0].');
    assertGalleryCondition(label, shaft?.type === 'line' && tip?.type === 'path', 'expected arrow helper to split shaft and tip.');
    assertGalleryCondition(label, shaft?.style?.stroke === '#FFFFFF' && approximatelyEqual(shaft.style?.strokeWidth ?? 0, 6), 'expected white vector shaft.');
    assertGalleryCondition(label, arrow?.geometry?.buff === 0 && arrow.geometry?.tipShape === 'triangleFilled' && approximatelyEqual(arrow.geometry?.maxTipLengthToLengthRatio ?? 0, 0.25), 'expected default Arrow buff, filled triangle tip, and Manim tip length clamp.');
    assertGalleryCondition(label, approximatelyEqual(arrow?.geometry?.tipLength ?? 0, 23.625) && approximatelyEqual(arrow?.geometry?.tipWidth ?? 0, 23.625), 'expected Manim-like arrow tip size.');
    assertGalleryCondition(label, tip?.style?.fill === '#FFFFFF' && tip.style?.strokeWidth === 0, 'expected filled white ArrowTriangleFilledTip.');
    assertGalleryCondition(label, origin?.geometry?.r === 5.4 && origin.style?.fill === '#FFFFFF', 'expected white origin dot.');
    assertGalleryCondition(label, originLabel?.text === '(0, 0)' && tipLabel?.text === '(2, 2)', 'expected coordinate labels.');
    assertGalleryCondition(label, originLabel?.geometry?.fontSize === 48 && tipLabel?.geometry?.fontSize === 48 && approximatelyEqual(originLabel.geometry?.w ?? 0, 128.25) && approximatelyEqual(tipLabel.geometry?.h ?? 0, 63.45), 'expected default Text label sizing.');
    assertGalleryCondition(label, approximatelyEqual(originLabel?.transform?.y ?? 0, 54) && approximatelyEqual(tipLabel?.transform?.x ?? 0, 216), 'expected labels placed with nextTo.');
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="plane:/gu) === 22, 'expected SVG NumberPlane grid and axes without boundary grid lines.');
    assertGalleryCondition(label, svg.includes('id="vec:shaft"') && svg.includes('id="vec:tip"') && svg.includes('(2, 2)'), 'expected SVG vector arrow shaft, tip, and coordinate label.');
    assertGalleryCondition(label, svg.indexOf('id="plane:h:') < svg.indexOf('id="origin"') && svg.indexOf('id="origin"') < svg.indexOf('id="vec"'), 'expected SVG vector arrow to render above the origin dot like Manim.');
    assertGalleryCondition(label, /id="plane:h:0"[^>]*x1="-479\.99999[23]"[^>]*x2="479\.999993"[^>]*stroke="#FFFFFF"/u.test(svg), 'expected SVG NumberPlane x-axis to span the full Manim frame width.');
    assertGalleryCondition(label, /id="plane:v:0"[^>]*y1="-270"[^>]*y2="270"[^>]*stroke="#FFFFFF"/u.test(svg), 'expected SVG NumberPlane y-axis to span the full Manim frame height.');
    assertGalleryCondition(label, /id="plane:h:m1"[^>]*stroke="#29ABCA"/u.test(svg) && /id="plane:v:1"[^>]*stroke="#29ABCA"/u.test(svg), 'expected SVG NumberPlane non-axis grid lines to use Manim BLUE_D.');
    assertGalleryCondition(label, !svg.includes('id="plane:h:4"') && !svg.includes('id="plane:h:m4"'), 'expected SVG NumberPlane to omit top and bottom boundary grid lines like Manim.');
    assertGalleryCondition(label, /id="vec:shaft"[^>]*x1="0"[^>]*y1="0"[^>]*x2="118\.294602"[^>]*y2="-118\.294602"[^>]*stroke-width="6"/u.test(svg), 'expected SVG vector shaft to stop before the tip with Manim stroke width.');
    assertGalleryCondition(label, svgGroupPathData(svg, 'vec:tip') === 'M 135 -135 L 126.647301 -109.941903 L 109.941903 -126.647301 Z', 'expected SVG vector tip triangle from Arrow default tip length and width.');
    assertGalleryCondition(label, svgElementTag(svg, 'origin_label').includes('transform="translate(0 54)"') && svgElementTag(svg, 'tip_label').includes('transform="translate(216 -135)"'), 'expected SVG coordinate labels to serialize at next_to positions.');
  }

  if (label.includes('fixed-in-frame-m-object-test')) {
    const axes = findNode(documentData, 'axes');
    const text = findNode(documentData, 'text3d');
    assertGalleryCondition(label, axes?.geometry?.threeDAxes === true, 'expected ThreeDAxes helper.');
    assertGalleryCondition(label, axes?.transform?.x === 0 && axes?.transform?.y === 0, 'expected ThreeDAxes to stay at the unshifted Manim scene origin.');
    assertGalleryCondition(label, axes?.geometry?.cameraProjection === 'manim' && axes.geometry?.phi === 75 && axes.geometry?.theta === -45, 'expected fixed-frame example axes to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, axes?.geometry?.xLength === 10.5 && axes.geometry?.yLength === 10.5 && axes.geometry?.zLength === 6.5, 'expected Manim default ThreeDAxes axis lengths.');
    assertGalleryCondition(label, text?.type === 'text' && text.text === 'This is a 3D text', 'expected fixed-in-frame text label.');
    assertGalleryCondition(label, text?.geometry?.fixedInFrame === true, 'expected fixed-in-frame text to render outside the camera transform.');
    assertGalleryCondition(label, approximatelyEqual(text?.transform?.x ?? 0, -270) && approximatelyEqual(text?.transform?.y ?? 0, -212), 'expected text to stay pinned at the upper-left screen corner.');
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="axes:[xyz]:tick:/gu) === 30, 'expected all fixed-frame projected axis ticks to serialize into SVG.');
    assertGalleryCondition(label, svg.includes('<g transform="translate(480 270)"><text id="text3d"') && /id="axes:x:axis"[^>]*x2="305\.322489"/u.test(svg), 'expected SVG fixed-frame text layer and projected x-axis endpoint.');
    assertGalleryCondition(label, svg.indexOf('id="axes:x:axis"') < svg.indexOf('id="text3d"'), 'expected fixed-in-frame text layer to render above the projected 3D axes.');
  }

  if (label.includes('manim-ce-logo') || label.includes('manim_ce_logo')) {
    const logo = findNode(documentData, 'logo');
    const triangle = findNode(documentData, 't');
    const square = findNode(documentData, 's');
    const circle = findNode(documentData, 'c');
    const m = findNode(documentData, 'm');
    assertGalleryCondition(label, documentData.width === 960 && documentData.height === 540, 'expected 16:9 Manim frame for logo.');
    assertGalleryCondition(label, findNode(documentData, 'bg')?.style?.fill === '#ece6e2', 'expected official light logo background.');
    assertGalleryCondition(label, logo?.children?.map((child) => child.id).join(',') === 't,s,c,m', 'expected official VGroup z-order triangle, square, circle, M.');
    assertGalleryCondition(label, triangle?.type === 'triangle' && approximatelyEqual(triangle.geometry?.w ?? 0, 116.9) && approximatelyEqual(triangle.geometry?.h ?? 0, 101.25), 'expected scaled Manim triangle geometry.');
    assertGalleryCondition(label, triangle?.style?.fill === '#e07a5f' && approximatelyEqual(triangle.transform?.x ?? 0, 135) && approximatelyEqual(triangle.transform?.y ?? 0, 42.1875), 'expected official RED triangle placement after VGroup.move_to(ORIGIN).');
    assertGalleryCondition(label, square?.type === 'rect' && square.geometry?.w === 135 && square.geometry?.h === 135, 'expected default Square scaled to 2 Manim units.');
    assertGalleryCondition(label, square?.style?.fill === '#525893' && approximatelyEqual(square.transform?.x ?? 0, 67.5) && approximatelyEqual(square.transform?.y ?? 0, -11.25), 'expected official BLUE square placement after VGroup.move_to(ORIGIN).');
    assertGalleryCondition(label, circle?.type === 'circle' && approximatelyEqual(circle.geometry?.r ?? 0, 67.5), 'expected default Circle scaled to one Manim unit radius.');
    assertGalleryCondition(label, circle?.style?.fill === '#87c2a5' && approximatelyEqual(circle.transform?.x ?? 0, 0) && approximatelyEqual(circle.transform?.y ?? 0, 56.25), 'expected official GREEN circle placement after VGroup.move_to(ORIGIN).');
    assertGalleryCondition(label, m?.type === 'math' && m.latex === '\\\\mathbb{M}' && m.renderer === 'katex', 'expected MathTex blackboard M.');
    assertGalleryCondition(label, m?.geometry?.fontSize === 174 && m?.style?.fill === '#343434' && approximatelyEqual(m.transform?.x ?? 0, -84.375) && approximatelyEqual(m.transform?.y ?? 0, -45), 'expected MathTex M scale and placement after VGroup.move_to(ORIGIN).');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 2, 'expected static logo plus background creation only.');
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, /<svg [^>]*viewBox="0 0 960 540"><g transform="translate\(480 270\) rotate\(0\) scale\(1\) translate\(0 0\)">/u.test(svg), 'expected SVG logo sample to use the centered Manim frame transform.');
    assertGalleryCondition(label, /<rect id="bg" x="-480" y="-270" width="960" height="540"[^>]*fill="#ece6e2"/u.test(svg), 'expected SVG logo background to fill the whole frame.');
    assertGalleryCondition(label, /<polygon id="t" points="0,-50\.625 58\.45,50\.625 -58\.45,50\.625" transform="translate\(135 42\.1875\)"[^>]*fill="#e07a5f"/u.test(svg), 'expected SVG triangle to serialize with official scaled vertices and red fill.');
    assertGalleryCondition(label, /<rect id="s" x="-67\.5" y="-67\.5" width="135" height="135" transform="translate\(67\.5 -11\.25\)"[^>]*fill="#525893"/u.test(svg), 'expected SVG square to serialize with official blue fill.');
    assertGalleryCondition(label, /<circle id="c" cx="0" cy="0" r="67\.5" transform="translate\(0 56\.25\)"[^>]*fill="#87c2a5"/u.test(svg), 'expected SVG circle to serialize with official green fill.');
    assertGalleryCondition(label, svgElementTag(svg, 'm').includes('transform="translate(-84.375 -45)"') && svgElementTag(svg, 'm').includes('font-size="174"') && svgElementTag(svg, 'm').includes('fill="#343434"') && svg.includes('mathbb{M}</text>'), 'expected SVG MathTex fallback text to serialize at the official placement.');
    assertGalleryCondition(label, svg.indexOf('id="t"') < svg.indexOf('id="s"') && svg.indexOf('id="s"') < svg.indexOf('id="c"') && svg.indexOf('id="c"') < svg.indexOf('id="m"'), 'expected SVG logo z-order to match Manim VGroup order.');
  }

  if (label.includes('brace_annotation') || label.includes('brace-annotation')) {
    const segment = findNode(documentData, 'segment');
    const dotA = findNode(documentData, 'dotA');
    const dotB = findNode(documentData, 'dotB');
    const horizontal = findNode(documentData, 'horizontal');
    const perpendicular = findNode(documentData, 'perpendicular');
    assertGalleryCondition(label, segment?.type === 'line' && segment.style?.stroke === '#ff862f', 'expected orange measured segment.');
    assertGalleryCondition(label, dotA?.geometry?.r === 5.4 && dotB?.geometry?.r === 5.4 && dotA?.transform?.x === -135 && dotB?.transform?.x === 135, 'expected Manim default dots at the measured segment endpoints.');
    assertGalleryCondition(label, horizontal?.type === 'brace' && perpendicular?.type === 'brace', 'expected two Brace helpers.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'segment') < documentData.nodes.findIndex((node) => node.id === 'dotA') && documentData.nodes.findIndex((node) => node.id === 'segment') < documentData.nodes.findIndex((node) => node.id === 'dotB'), 'expected official self.add(line,dot,dot2,...) z-order with dots above the line.');
    assertGalleryCondition(label, horizontal?.geometry?.target === 'segment' && horizontal.geometry?.direction === 'down', 'expected horizontal brace below segment.');
    assertGalleryCondition(label, perpendicular?.geometry?.target === 'segment' && perpendicular.geometry?.direction === 'perpendicular', 'expected perpendicular brace tied to segment normal.');
    assertGalleryCondition(label, horizontal?.geometry?.label === '\\\\text{Horizontal distance}' && perpendicular?.geometry?.label === 'x-x_1', 'expected official brace labels.');
    assertGalleryCondition(label, horizontal?.geometry?.labelSize === 42 && horizontal.geometry?.labelW === 300 && horizontal.geometry?.labelH === 90, 'expected horizontal brace label dimensions from get_text.');
    assertGalleryCondition(label, perpendicular?.geometry?.labelSize === 42 && perpendicular.geometry?.labelW === 120 && perpendicular.geometry?.labelH === 88, 'expected perpendicular brace label dimensions from get_tex.');
    assertGalleryCondition(label, horizontal?.geometry?.labelRenderer === 'katex' && perpendicular?.geometry?.labelRenderer === 'katex', 'expected MathTex brace labels.');
    assertGalleryCondition(label, approximatelyEqual(horizontal?.geometry?.sharpness ?? 0, 2) && approximatelyEqual(perpendicular?.geometry?.sharpness ?? 0, 2) && approximatelyEqual(horizontal?.geometry?.buff ?? 0, 13.5) && approximatelyEqual(perpendicular?.geometry?.buff ?? 0, 13.5), 'expected Manim brace sharpness and buff.');
    const svg = svgSampleAt(documentData, 0);
    const horizontalPath = svgGroupPathData(svg, 'horizontal');
    const perpendicularPath = svgGroupPathData(svg, 'perpendicular');
    assertGalleryCondition(label, /<line id="segment"[^>]*x1="-135"[^>]*y1="67\.5"[^>]*x2="135"[^>]*y2="-67\.5"[^>]*stroke="#ff862f"/u.test(svg), 'expected SVG measured segment to match official dot centers.');
    assertGalleryCondition(label, svgElementTag(svg, 'dotA').includes('transform="translate(-135 67.5)"') && svgElementTag(svg, 'dotB').includes('transform="translate(135 -67.5)"'), 'expected SVG dots at the exact measured segment endpoints.');
    assertGalleryCondition(label, svg.indexOf('id="segment"') < svg.indexOf('id="dotA"') && svg.indexOf('id="segment"') < svg.indexOf('id="dotB"'), 'expected SVG dots to render above the measured segment like Manim self.add(line,dot,dot2,...).');
    assertGalleryCondition(label, horizontalPath.startsWith('M -135 81 ') && horizontalPath.includes(' C ') && horizontalPath.endsWith(' Z'), 'expected horizontal Brace to serialize as a curved ribbon below the segment bounds.');
    assertGalleryCondition(label, perpendicularPath.startsWith('M -141.037384 55.425233 ') && perpendicularPath.includes(' C ') && perpendicularPath.endsWith(' Z'), 'expected perpendicular Brace to serialize along the segment normal.');
    assertGalleryCondition(label, /<g id="horizontal"[^>]*>.*<text x="0" y="142\.[0-9]+"/u.test(svg) && svg.includes('text{Horizontal distance}</text>'), 'expected horizontal brace label at the Manim tip-side anchor.');
    assertGalleryCondition(label, /<g id="perpendicular"[^>]*>.*<text x="-36\.[0-9]+" y="-72\.[0-9]+"/u.test(svg) && svg.includes('x-x_1</text>'), 'expected perpendicular brace label at the rotated normal anchor.');
  }

  if (label.includes('boolean-operations')) {
    const title = findNode(documentData, 'title');
    const titleUnderline = findNode(documentData, 'title_underline');
    const ellipseA = findNode(documentData, 'ellipse_a');
    const ellipseB = findNode(documentData, 'ellipse_b');
    const intersection = findNode(documentData, 'intersection');
    const union = findNode(documentData, 'union');
    const exclusion = findNode(documentData, 'exclusion');
    const difference = findNode(documentData, 'difference');
    const labels = ['intersection_label', 'union_label', 'exclusion_label', 'difference_label'].map((id) => findNode(documentData, id));
    assertGalleryCondition(label, title?.text === 'Boolean Operation' && title.style?.fill === '#ffffff' && title.geometry?.fontSize === 48, 'expected title text with Manim MarkupText default font size.');
    assertGalleryCondition(label, title?.transform?.x === -248 && title?.transform?.y === -174 && titleUnderline?.geometry?.x1 === -128 && titleUnderline?.geometry?.x2 === 128 && titleUnderline?.transform?.y === -151, 'expected title and underline at the official upper-left placement.');
    assertGalleryCondition(label, ellipseA?.children?.length === 2 && ellipseB?.children?.length === 2, 'expected two colored source ellipses with fill and stroke paths.');
    assertGalleryCondition(label, ellipseA?.transform?.x === -300 && ellipseB?.transform?.x === -165 && findNode(documentData, 'ellipse_a_fill')?.transform?.opacity === 0.5 && findNode(documentData, 'ellipse_b_fill')?.transform?.opacity === 0.5, 'expected overlapping source ellipses with official fill opacity.');
    assertGalleryCondition(label, findNode(documentData, 'ellipse_a_fill')?.style?.fill === '#58C4DD' && findNode(documentData, 'ellipse_b_fill')?.style?.fill === '#FC6255', 'expected BLUE/RED source ellipses.');
    assertGalleryCondition(label, intersection?.children?.length === 2 && union?.children?.length === 2 && exclusion?.children?.length === 2 && difference?.children?.length === 2, 'expected four boolean result groups with fill and stroke.');
    assertGalleryCondition(label, findNode(documentData, 'intersection_fill')?.style?.fill === '#83C167', 'expected GREEN intersection result.');
    assertGalleryCondition(label, findNode(documentData, 'union_fill')?.style?.fill === '#FF862F', 'expected ORANGE union result.');
    assertGalleryCondition(label, findNode(documentData, 'exclusion_fill')?.style?.fill === '#FFFF00', 'expected YELLOW exclusion result.');
    assertGalleryCondition(label, findNode(documentData, 'difference_fill')?.style?.fill === '#D147BD', 'expected PINK difference result.');
    assertGalleryCondition(label, labels.every((node) => node?.type === 'text' && node.transform?.opacity === 0), 'expected result labels to fade in from hidden state.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'effect' && op.effect === 'animate' && ['intersection', 'union', 'exclusion', 'difference'].includes(op.id)).length === 4, 'expected four staged boolean result animations.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'effect' && op.effect === 'fadeIn' && String(op.id).endsWith('_label')).length === 4, 'expected four staged label fade-ins.');
    const introMid = visualSample(documentData, 0.5);
    const intersectionMid = visualSample(documentData, 1.5);
    const intersectionLabelMid = visualSample(documentData, 2.5);
    const afterIntersection = visualSample(documentData, 2);
    const afterUnion = visualSample(documentData, 4);
    const afterExclusion = visualSample(documentData, 6);
    const afterDifference = visualSample(documentData, 8);
    const intersectionNode = flattenNodes(afterIntersection.nodes).find((node) => node.id === 'intersection');
    const intersectionMidNode = flattenNodes(intersectionMid.nodes).find((node) => node.id === 'intersection');
    const unionNode = flattenNodes(afterUnion.nodes).find((node) => node.id === 'union');
    const exclusionNode = flattenNodes(afterExclusion.nodes).find((node) => node.id === 'exclusion');
    const differenceNode = flattenNodes(afterDifference.nodes).find((node) => node.id === 'difference');
    assertGalleryCondition(label, approximatelyEqual(findRenderedNode(introMid, 'ellipse_a')?.transform?.opacity ?? 0, 0.5) && approximatelyEqual(findRenderedNode(introMid, 'title')?.transform?.opacity ?? 0, 0.5) && approximatelyEqual(findRenderedNode(introMid, 'title_underline')?.transform?.opacity ?? 0, 0.5), 'expected intro FadeIn midpoint to reveal ellipses, title, and underline together.');
    assertGalleryCondition(label, approximatelyEqual(intersectionMidNode?.transform?.x ?? 0, 52.5) && approximatelyEqual(intersectionMidNode?.transform?.y ?? 0, -84.375) && approximatelyEqual(intersectionMidNode?.transform?.scale ?? 0, 0.625) && approximatelyEqual(intersectionMidNode?.transform?.opacity ?? 0, 0.5), 'expected Intersection midpoint to move, scale, and fade from the source lens.');
    assertGalleryCondition(label, approximatelyEqual(intersectionNode?.transform?.x ?? 0, 337.5) && approximatelyEqual(intersectionNode?.transform?.y ?? 0, -168.75) && approximatelyEqual(intersectionNode?.transform?.scale ?? 0, 0.25), 'expected Intersection to move to RIGHT*5 + UP*2.5 at scale 0.25.');
    assertGalleryCondition(label, approximatelyEqual(findRenderedNode(afterIntersection, 'intersection_stroke')?.style?.strokeWidth ?? 0, 16), 'expected scaled Intersection stroke width to compensate for scale 0.25.');
    assertGalleryCondition(label, approximatelyEqual(unionNode?.transform?.x ?? 0, 337.5) && approximatelyEqual(unionNode?.transform?.y ?? 0, 11.25) && approximatelyEqual(unionNode?.transform?.scale ?? 0, 0.3), 'expected Union to stack below Intersection at scale 0.3.');
    assertGalleryCondition(label, approximatelyEqual(exclusionNode?.transform?.x ?? 0, 337.5) && approximatelyEqual(exclusionNode?.transform?.y ?? 0, 222.75) && approximatelyEqual(exclusionNode?.transform?.scale ?? 0, 0.3), 'expected Exclusion to stack below Union at scale 0.3.');
    assertGalleryCondition(label, approximatelyEqual(differenceNode?.transform?.x ?? 0, 148.5) && approximatelyEqual(differenceNode?.transform?.y ?? 0, 11.25) && approximatelyEqual(differenceNode?.transform?.scale ?? 0, 0.3), 'expected Difference to sit left of Union at scale 0.3.');
    assertGalleryCondition(label, (findRenderedNode(afterIntersection, 'intersection_label')?.transform?.opacity ?? 0) === 0 && (findRenderedNode(visualSample(documentData, 3), 'intersection_label')?.transform?.opacity ?? 0) === 1, 'expected Intersection label to fade in after the result moves.');
    assertGalleryCondition(label, approximatelyEqual(findRenderedNode(intersectionLabelMid, 'intersection_label')?.transform?.opacity ?? 0, 0.5), 'expected Intersection label fade midpoint.');
    assertGalleryCondition(label, approximatelyEqual(findRenderedNode(afterUnion, 'union_stroke')?.style?.strokeWidth ?? 0, 13.333) && approximatelyEqual(findRenderedNode(afterExclusion, 'exclusion_stroke')?.style?.strokeWidth ?? 0, 13.333) && approximatelyEqual(findRenderedNode(afterDifference, 'difference_stroke')?.style?.strokeWidth ?? 0, 13.333), 'expected scale-0.3 boolean results to use compensated stroke widths.');
    const finalSvg = svgSampleAt(documentData, 9);
    assertGalleryCondition(label, countSvgOccurrences(finalSvg, /id="(?:intersection|union|exclusion|difference)"/gu) === 4, 'expected all four boolean result groups in final SVG.');
    assertGalleryCondition(label, finalSvg.includes('fill-rule="evenodd"') && finalSvg.includes('id="exclusion_fill"'), 'expected SVG even-odd fill rule for Exclusion hole.');
    assertGalleryCondition(label, finalSvg.includes('Intersection') && finalSvg.includes('Union') && finalSvg.includes('Exclusion') && finalSvg.includes('Difference'), 'expected final SVG boolean labels.');
    assertGalleryCondition(label, svgGroupPathData(finalSvg, 'intersection_fill') === 'M 0 -146.142 A 135 168.75 0 0 1 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z', 'expected SVG Intersection path from the two ellipse crossings.');
    assertGalleryCondition(label, svgGroupPathData(finalSvg, 'difference_fill') === 'M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z', 'expected SVG Difference path to keep the left-only ellipse lens.');
  }

  if (label.includes('opening-manim') || label.includes('opening_manim')) {
    const title = findNode(documentData, 'title');
    const basel = findNode(documentData, 'basel');
    const transformTitle = findNode(documentData, 'transformTitle');
    const gridTitle = findNode(documentData, 'gridTitle');
    const warpedTitle = findNode(documentData, 'warpedTitle');
    const grid = findNode(documentData, 'grid');
    const horizontalGrid = Array.from({ length: 9 }, (_, index) => findNode(documentData, `grid_h${index}`));
    const verticalGrid = Array.from({ length: 15 }, (_, index) => findNode(documentData, `grid_v${index}`));
    const nonOfficialOverlayIds = [
      'codeCard',
      'codeLine1',
      'codeLine2',
      'codeLine3',
      'phaseTex',
      'phaseTexLabel',
      'phaseGrid',
      'phaseGridLabel',
      'phaseWarp',
      'phaseWarpLabel',
      'xAxis',
      'yAxis',
      'origin',
      'xMinus',
      'xPlus',
      'yPlus',
      'yMinus',
      'warpCue1',
      'warpCue2',
      'warpCue3',
      'warpEq',
      'createLag',
    ];
    assertGalleryCondition(label, title?.type === 'math' && title.latex === '\\\\text{This is some }\\\\LaTeX' && title.geometry?.fontSize === 54, 'expected opening Tex title.');
    assertGalleryCondition(label, basel?.type === 'math' && String(basel.latex).includes('\\\\frac{\\\\pi^2}{6}') && basel.geometry?.fontSize === 48, 'expected Basel MathTex equation.');
    assertGalleryCondition(label, transformTitle?.latex === '\\\\text{That was a transform}', 'expected transform target title.');
    assertGalleryCondition(label, gridTitle?.latex === '\\\\text{This is a grid}' && gridTitle.geometry?.fontSize === 62, 'expected grid title.');
    assertGalleryCondition(label, String(warpedTitle?.latex).includes('non-linear function') && String(warpedTitle?.latex).includes('applied to the grid'), 'expected nonlinear transform title.');
    assertGalleryCondition(label, grid?.children?.length === 24, 'expected full-frame NumberPlane-like grid with 24 paths.');
    assertGalleryCondition(label, horizontalGrid.every((node) => node?.type === 'path') && verticalGrid.every((node) => node?.type === 'path'), 'expected 9 horizontal and 15 vertical grid paths.');
    assertGalleryCondition(label, horizontalGrid[4]?.style?.stroke === '#FFFFFF' && approximatelyEqual(horizontalGrid[4]?.style?.strokeWidth ?? 0, 2), 'expected white NumberPlane x-axis grid line.');
    assertGalleryCondition(label, verticalGrid[7]?.style?.stroke === '#FFFFFF' && approximatelyEqual(verticalGrid[7]?.style?.strokeWidth ?? 0, 2), 'expected white NumberPlane y-axis grid line.');
    assertGalleryCondition(label, [...horizontalGrid, ...verticalGrid].filter((node) => node?.style?.stroke === '#FFFFFF').length === 2, 'expected only the two NumberPlane axes to use white strokes.');
    assertGalleryCondition(label, [...horizontalGrid, ...verticalGrid].filter((node) => node?.style?.stroke === '#29ABCA').length === 22, 'expected all non-axis NumberPlane grid lines to use BLUE_D strokes.');
    assertGalleryCondition(label, [...horizontalGrid, ...verticalGrid].every((node) => node?.transform?.opacity === 0), 'expected grid paths to start hidden before Create(grid).');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'grid') < documentData.nodes.findIndex((node) => node.id === 'gridTitle'), 'expected grid title to render above the grid like self.add(grid, grid_title).');
    assertGalleryCondition(label, nonOfficialOverlayIds.every((id) => !findNode(documentData, id)), 'expected OpeningManim to omit non-official explanatory overlays.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'title' && op.effect === 'write' && approximatelyEqual(op.duration, 1.294642857142857)), 'expected opening Write(title) segment from AnimationGroup timing.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'basel', path: 'transform.y', from: -102, to: -62, t: 0, duration: 1.45, easing: 'smooth' }), 'expected Basel equation arrange upward motion.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'title' && op.effect === 'transform' && approximatelyEqual(op.t, 2.25) && approximatelyEqual(op.duration, 0.8928571428571428)), 'expected Transform(title, transformTitle) timing.');
    assertGalleryCondition(label, !documentData.timeline.some((op) => op.op === 'animate' && op.id === 'title' && op.path === 'transform.opacity' && approximatelyEqual(op.t, 2.25) && op.from === 0), 'expected Transform(title, transformTitle) to start from the written visible title.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'grid' && op.effect === 'create' && approximatelyEqual(op.t, 4.5227272727272725) && approximatelyEqual(op.duration, 2.727272727272727)), 'expected lagged Create(grid) timing.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.path === 'geometry.drawProgress' && /^grid_[hv]\d+$/u.test(String(op.id))).length === 24, 'expected draw-progress animation for every grid path.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.path === 'geometry.d' && /^grid_[hv]\d+$/u.test(String(op.id)) && op.t === 8.25 && op.duration === 3).length === 24, 'expected nonlinear morph for every grid path.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'grid_h4', path: 'geometry.d', t: 8.25, duration: 3, easing: 'easeInOut' }), 'expected central horizontal grid nonlinear morph.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'grid_v7', path: 'geometry.d', t: 8.25, duration: 3, easing: 'easeInOut' }), 'expected central vertical grid nonlinear morph.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'gridTitle' && op.effect === 'transform' && op.t === 9.25 && op.duration === 1), 'expected final Transform(gridTitle, warpedTitle).');
    assertGalleryCondition(label, !documentData.timeline.some((op) => op.op === 'animate' && op.id === 'gridTitle' && op.path === 'transform.opacity' && approximatelyEqual(op.t, 9.25) && op.from === 0), 'expected final title transform to start from the visible grid title.');

    const openingMid = visualSample(documentData, 0.725);
    const openingTitle = findRenderedNode(openingMid, 'title');
    const openingBasel = findRenderedNode(openingMid, 'basel');
    assertGalleryCondition(label, approximatelyEqual(openingTitle?.geometry?.writeProgress ?? 0, 0.647632) && approximatelyEqual(openingBasel?.transform?.opacity ?? 0, 0.352368), 'expected staggered title Write and Basel FadeIn at opening midpoint.');

    const transformStartTitle = renderedNodeAt(documentData, 2.25, 'title');
    const transformMidTitle = renderedNodeAt(documentData, 2.75, 'title');
    const transformEndTitle = renderedNodeAt(documentData, 3.25, 'title');
    assertGalleryCondition(label, transformStartTitle?.transform?.opacity === 1 && transformStartTitle?.transform?.x === 0 && transformStartTitle?.transform?.y === 58, 'expected visible title at transform start.');
    assertGalleryCondition(label, approximatelyEqual(transformMidTitle?.transform?.x ?? 0, -174.860767) && approximatelyEqual(transformMidTitle?.transform?.y ?? 0, 153.849606) && transformMidTitle?.transform?.opacity === 1 && approximatelyEqual(transformMidTitle?.geometry?.fontSize ?? 0, 46.22841), 'expected title midway through transform to target location and font size.');
    assertGalleryCondition(label, transformEndTitle?.latex === '\\\\text{That was a transform}' && transformEndTitle?.transform?.x === -270 && transformEndTitle?.transform?.y === 206 && transformEndTitle?.geometry?.fontSize === 42, 'expected title content replaced after transform.');

    const gridCreateMid = visualSample(documentData, 5.5);
    assertGalleryCondition(label, (findRenderedNode(gridCreateMid, 'grid_h4')?.geometry?.drawProgress ?? 0) === 1 && (findRenderedNode(gridCreateMid, 'grid_v7')?.geometry?.drawProgress ?? 1) === 0, 'expected lagged grid creation to have horizontal center drawn before vertical center.');
    assertGalleryCondition(label, approximatelyEqual(findRenderedNode(gridCreateMid, 'gridTitle')?.transform?.opacity ?? 0, 0.282729), 'expected grid title fading in during lagged Create phase.');

    const gridReady = visualSample(documentData, 7.25);
    assertGalleryCondition(label, (findRenderedNode(gridReady, 'grid_v14')?.geometry?.drawProgress ?? 0) === 1 && findRenderedNode(gridReady, 'gridTitle')?.transform?.y === 246, 'expected full grid drawn before grid title slides down.');

    const warpMid = visualSample(documentData, 9.75);
    const warpMidH4 = findRenderedNode(warpMid, 'grid_h4');
    const warpMidV7 = findRenderedNode(warpMid, 'grid_v7');
    const warpMidTitle = findRenderedNode(warpMid, 'gridTitle');
    assertGalleryCondition(label, String(warpMidH4?.geometry?.d ?? '').includes('L -447.1598 9.5075') && String(warpMidV7?.geometry?.d ?? '').includes('L 32.8999 -0.2683'), 'expected nonlinear grid morph halfway through sampled p + [sin(y), sin(x), 0].');
    assertGalleryCondition(label, warpMidTitle?.transform?.opacity === 1 && warpMidTitle?.transform?.x === -227 && warpMidTitle?.transform?.y === 195 && warpMidTitle?.geometry?.fontSize === 50, 'expected grid title halfway toward nonlinear title.');

    const finalWarp = visualSample(documentData, 11.25);
    const finalH0 = findRenderedNode(finalWarp, 'grid_h0');
    const finalV14 = findRenderedNode(finalWarp, 'grid_v14');
    const finalTitle = findRenderedNode(finalWarp, 'gridTitle');
    assertGalleryCondition(label, String(finalH0?.geometry?.d ?? '').startsWith('M -523.584 -225.653 L ') && String(finalV14?.geometry?.d ?? '').startsWith('M 421.416 -314.347 L '), 'expected final warped full-frame grid paths to keep sampled sine topology.');
    assertGalleryCondition(label, String(finalTitle?.latex).includes('non-linear function') && finalTitle?.transform?.x === -184 && finalTitle?.transform?.y === 184 && finalTitle?.geometry?.fontSize === 38, 'expected final nonlinear transform title.');

    const gridStartSvg = svgSampleAt(documentData, 5.5);
    const warpMidSvg = svgSampleAt(documentData, 9.75);
    const finalSvg = svgSampleAt(documentData, 11.25);
    assertGalleryCondition(label, /<g id="grid_h4"[^>]*><path [^>]*stroke="#FFFFFF"[^>]*stroke-dashoffset="0"/u.test(gridStartSvg) && /<g id="grid_v7"[^>]*><path [^>]*stroke="#FFFFFF"[^>]*stroke-dashoffset="1"/u.test(gridStartSvg), 'expected SVG lagged grid draw state at create midpoint.');
    assertGalleryCondition(label, svgGroupPathData(warpMidSvg, 'grid_h4').includes('L -447.1598 9.5075') && svgGroupPathData(warpMidSvg, 'grid_v7').includes('L 32.8999 -0.2683'), 'expected SVG nonlinear grid halfway paths.');
    assertGalleryCondition(label, finalSvg.includes('That was a non-linear function') && svgGroupPathData(finalSvg, 'grid_h0').startsWith('M -523.584 -225.653'), 'expected final SVG warped grid and nonlinear title.');
  }

  if (label.includes('plotting-sin-cos')) {
    const axes = findNode(documentData, 'ax');
    const labels = findNode(documentData, 'axis_labels');
    const sinCurve = findNode(documentData, 'sinCurve');
    const cosCurve = findNode(documentData, 'cosCurve');
    const tauLine = findNode(documentData, 'tauLine');
    const sinLabel = findNode(documentData, 'sinLabel');
    const cosLabel = findNode(documentData, 'cosLabel');
    const tauLabel = findNode(documentData, 'tauLabel');
    const renderedAxisX = renderedNodeAt(documentData, 1, 'ax_x');
    const renderedAxisY = renderedNodeAt(documentData, 1, 'ax_y');
    const renderedTauLine = renderedNodeAt(documentData, 1, 'tauLine');
    const renderedSinLabel = renderedNodeAt(documentData, 1, 'sinLabel');
    const renderedCosLabel = renderedNodeAt(documentData, 1, 'cosLabel');
    const renderedTauLabel = renderedNodeAt(documentData, 1, 'tauLabel');
    assertGalleryCondition(label, axes?.type === 'group', 'expected Axes helper group.');
    assertGalleryCondition(label, axes?.geometry?.xMin === -10 && axes?.geometry?.xMax === 10.3 && axes?.geometry?.yMin === -1.5 && axes?.geometry?.yMax === 1.5, 'expected official sine/cosine axes ranges.');
    assertGalleryCondition(label, approximatelyEqual(axes?.geometry?.width ?? 0, 675) && approximatelyEqual(axes?.geometry?.height ?? 0, 405), 'expected official sine/cosine axes dimensions.');
    assertGalleryCondition(label, approximatelyEqual(axes?.geometry?.originX ?? 0, -4.987685) && axes?.geometry?.originY === 0, 'expected asymmetric axes origin from x_range [-10, 10.3].');
    assertGalleryCondition(label, axes?.children?.length === 34, `expected numbered/ticked axes with 34 children, got ${axes?.children?.length ?? 0}.`);
    assertGalleryCondition(label, axes.children.filter((child) => /^ax:x_tick:/u.test(child.id)).length === 20, 'expected x-axis ticks at every integer except zero.');
    assertGalleryCondition(label, axes.children.filter((child) => /^ax:x_number:/u.test(child.id)).length === 10, 'expected x-axis numbers only at the official even coordinates.');
    assertGalleryCondition(label, axes.children.filter((child) => /^ax:y_tick:/u.test(child.id)).length === 2 && axes.children.every((child) => !/^ax:y_number:/u.test(child.id)), 'expected y-axis ticks without numeric labels.');
    assertGalleryCondition(label, labels?.children?.length === 2 && labels.children.every((child) => child.type === 'math'), 'expected x/y MathTex axis labels.');
    assertGalleryCondition(label, renderedAxisX?.style?.stroke === '#83C167' && renderedAxisY?.style?.stroke === '#83C167' && approximatelyEqual(renderedAxisY?.geometry?.x1 ?? 0, -4.987685), 'expected GREEN axes crossing at Manim c2p origin.');
    assertGalleryCondition(label, sinCurve?.geometry?.fn === 'sin(t)' && sinCurve?.geometry?.range?.join(',') === '-10,10.3', 'expected sine plot with official range.');
    assertGalleryCondition(label, cosCurve?.geometry?.fn === 'cos(t)' && cosCurve?.geometry?.range?.join(',') === '-10,10.3', 'expected cosine plot with official range.');
    assertGalleryCondition(label, approximatelyEqual(sinCurve?.geometry?.scaleX ?? 0, 33.251232) && approximatelyEqual(sinCurve?.geometry?.scaleY ?? 0, 135), 'expected sine plot to use axes coordinate scaling.');
    assertGalleryCondition(label, sinCurve?.style?.stroke === '#58C4DD' && approximatelyEqual(sinCurve?.style?.strokeWidth ?? 0, 4), 'expected BLUE sine curve.');
    assertGalleryCondition(label, cosCurve?.style?.stroke === '#FC6255' && approximatelyEqual(cosCurve?.style?.strokeWidth ?? 0, 4), 'expected RED cosine curve.');
    assertGalleryCondition(label, tauLine?.geometry?.dataLine === true && tauLine.geometry?.axes === 'ax', 'expected x=2pi dataLine tied to axes.');
    assertGalleryCondition(label, tauLine?.geometry?.from === '6.283185,0' && tauLine?.geometry?.to === '6.283185,1', 'expected x=2pi vertical dataLine endpoint.');
    assertGalleryCondition(label, tauLine?.style?.stroke === '#FFFF00' && approximatelyEqual(tauLine?.style?.strokeWidth ?? 0, 4), 'expected YELLOW x=2pi line.');
    assertGalleryCondition(label, approximatelyEqual(renderedTauLine?.geometry?.x1 ?? 0, 203.935954) && approximatelyEqual(renderedTauLine?.geometry?.x2 ?? 0, 203.935954) && renderedTauLine?.geometry?.y1 === 0 && approximatelyEqual(renderedTauLine?.geometry?.y2 ?? 0, -135), 'expected rendered x=2pi vertical line from cosine point to x-axis.');
    assertGalleryCondition(label, [sinLabel, cosLabel, tauLabel].every((node) => node?.geometry?.graphLabel === true), 'expected graph labels attached to plots.');
    assertGalleryCondition(label, sinLabel?.geometry?.plot === 'sinCurve' && sinLabel?.style?.fill === '#58C4DD', 'expected sine label attached to sine curve.');
    assertGalleryCondition(label, cosLabel?.geometry?.plot === 'cosCurve' && cosLabel?.style?.fill === '#FC6255', 'expected cosine label attached to cosine curve.');
    assertGalleryCondition(label, tauLabel?.geometry?.xVal === 6.283185 && tauLabel?.style?.fill === '#ffffff', 'expected x=2pi graph label at the tau coordinate.');
    assertGalleryCondition(label, approximatelyEqual(renderedSinLabel?.transform?.x ?? 0, -356.000005) && approximatelyEqual(renderedSinLabel?.transform?.y ?? 0, -112.00285), 'expected sine graph label at the left sine endpoint.');
    assertGalleryCondition(label, approximatelyEqual(renderedCosLabel?.transform?.x ?? 0, 388.000005) && approximatelyEqual(renderedCosLabel?.transform?.y ?? 0, 86.011566), 'expected cosine graph label shifted to the right of the curve.');
    assertGalleryCondition(label, approximatelyEqual(renderedTauLabel?.transform?.x ?? 0, 245.999888) && approximatelyEqual(renderedTauLabel?.transform?.y ?? 0, -169.999629), 'expected x=2pi label above-right of the tau marker.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 9 && !documentData.timeline.some((op) => op.op === 'animate' || op.op === 'effect'), 'expected static plotting scene with only add-style creation and bindings.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'bindExpr' && op.id === 'tauLine').length === 4, 'expected tauLine endpoint bindings to axes coordinates.');
    const svg = svgSampleAt(documentData, 1);
    assertGalleryCondition(label, svgElementTag(svg, 'ax_y').includes('x1="-4.987685"') && svgElementTag(svg, 'ax_y').includes('stroke="#83C167"'), 'expected SVG y-axis at shifted x-origin in GREEN.');
    assertGalleryCondition(label, svgGroupPathData(svg, 'sinCurve').startsWith('M -332.51232000000005 -73.442849') && svgGroupPathData(svg, 'cosCurve').startsWith('M -332.51232000000005 113.274656'), 'expected SVG sine/cosine plot paths to start at official x_min samples.');
    assertGalleryCondition(label, svgElementTag(svg, 'tauLine').includes('x1="203.935954"') && svgElementTag(svg, 'tauLine').includes('y2="-135"') && svgElementTag(svg, 'tauLine').includes('stroke="#FFFF00"'), 'expected SVG x=2pi vertical yellow line.');
    assertGalleryCondition(label, svgElementTag(svg, 'sinLabel').includes('transform="translate(-356.000005 -112.00285)"') && svgElementTag(svg, 'cosLabel').includes('transform="translate(388.000005 86.011566)"') && svgElementTag(svg, 'tauLabel').includes('transform="translate(245.999888 -169.999629)"'), 'expected SVG graph labels at Manim-derived positions.');
  }

  if (label.includes('arg-min-example')) {
    const axes = findNode(documentData, 'ax');
    const axisLabels = findNode(documentData, 'axis_labels');
    const graph = findNode(documentData, 'graph');
    const dot = findNode(documentData, 'dot');
    const renderedAxisX = renderedNodeAt(documentData, 1, 'ax_x');
    const renderedAxisY = renderedNodeAt(documentData, 1, 'ax_y');
    const renderedXLabel = renderedNodeAt(documentData, 1, 'axis_labels:x');
    const renderedYLabel = renderedNodeAt(documentData, 1, 'axis_labels:y');
    const renderedMinDot = renderedNodeAt(documentData, 1, 'dot');
    assertGalleryCondition(label, axes?.type === 'group' && axes.geometry?.xMin === 0 && axes.geometry?.xMax === 10 && axes.geometry?.yMin === 0 && axes.geometry?.yMax === 100, 'expected official argmin axes ranges.');
    assertGalleryCondition(label, axes?.geometry?.originX === -405 && axes?.geometry?.originY === 202.5 && approximatelyEqual(axes?.geometry?.width ?? 0, 810) && approximatelyEqual(axes?.geometry?.height ?? 0, 405), 'expected Manim default Axes dimensions and lower-left origin.');
    assertGalleryCondition(label, axes?.children?.length === 23, `expected numbered/ticked argmin axes with 23 children, got ${axes?.children?.length ?? 0}.`);
    assertGalleryCondition(label, axes.children.filter((child) => /^ax:x_tick:/u.test(child.id)).length === 11 && axes.children.filter((child) => /^ax:y_tick:/u.test(child.id)).length === 10, 'expected argmin x ticks 0..10 and y ticks 10..100.');
    assertGalleryCondition(label, axes.children.every((child) => !/^ax:[xy]_number:/u.test(child.id)), 'expected argmin axes without numeric tick labels.');
    assertGalleryCondition(label, axisLabels?.children?.length === 2 && axisLabels.children.every((child) => child.type === 'math'), 'expected x and f(x) axis labels.');
    assertGalleryCondition(label, renderedAxisX?.geometry?.x1 === -405 && renderedAxisX.geometry?.x2 === 405 && renderedAxisX.geometry?.y1 === 202.5 && renderedAxisX.style?.stroke === '#FFFFFF', 'expected white x-axis across the lower edge.');
    assertGalleryCondition(label, renderedAxisY?.geometry?.x1 === -405 && renderedAxisY.geometry?.y1 === -202.5 && renderedAxisY.geometry?.y2 === 202.5 && renderedAxisY.style?.stroke === '#FFFFFF', 'expected white y-axis on the left edge.');
    assertGalleryCondition(label, renderedXLabel?.latex === 'x' && renderedXLabel.transform?.x === 425 && renderedXLabel.transform?.y === 182.5, 'expected x axis label at the right end.');
    assertGalleryCondition(label, renderedYLabel?.latex === 'f(x)' && renderedYLabel.transform?.x === -385 && renderedYLabel.transform?.y === -222.5, 'expected f(x) axis label above the y-axis.');
    assertGalleryCondition(label, graph?.geometry?.fn === '2*(t-5)*(t-5)' && graph?.geometry?.range?.join(',') === '0,10', 'expected quadratic graph over 0..10.');
    assertGalleryCondition(label, approximatelyEqual(graph?.geometry?.scaleX ?? 0, 81) && approximatelyEqual(graph?.geometry?.scaleY ?? 0, 4.05), 'expected argmin graph axes coordinate scaling.');
    assertGalleryCondition(label, graph?.style?.stroke === '#C55F73' && approximatelyEqual(graph?.style?.strokeWidth ?? 0, 4), 'expected official graph color.');
    assertGalleryCondition(label, dot?.geometry?.dataDot === true && dot.geometry?.axes === 'ax', 'expected dataDot tied to axes.');
    assertGalleryCondition(label, dot?.geometry?.point === 't,2*(t-5)*(t-5)', 'expected dot to track the animated function point.');
    assertGalleryCondition(label, approximatelyEqual(dot?.geometry?.r ?? 0, 5.4) && dot?.style?.fill === '#FFFFFF' && approximatelyEqual(dot?.style?.strokeWidth ?? -1, 0), 'expected white tracked Dot with Manim default stroke width.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'graph') < documentData.nodes.findIndex((node) => node.id === 'dot'), 'expected moving dot to render above the quadratic graph.');
    assertGalleryCondition(label, approximatelyEqual(renderedMinDot?.transform?.x ?? 0, -2.035176) && approximatelyEqual(renderedMinDot?.transform?.y ?? 0, 202.494886), 'expected rendered dot to land at sampled argmin.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 5 && documentData.timeline.filter((op) => op.op === 'animateValue').length === 1, 'expected static axes/graph plus one ValueTracker animation.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'animateValue' && op.id === 't' && op.from === 0 && approximatelyEqual(op.to, 4.974874372) && (op.t ?? 0) === 0 && op.duration === 1), 'expected t ValueTracker animation to the sampled argmin.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'dot' && op.path === 'transform.x' && op.deps?.includes('t')), 'expected dot x binding to animated t.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'dot' && op.path === 'transform.y' && op.deps?.includes('t')), 'expected dot y binding to animated t.');
    const initialSvg = svgSampleAt(documentData, 0);
    const midSvg = svgSampleAt(documentData, 0.5);
    const minSvg = svgSampleAt(documentData, 1);
    const holdSvg = svgSampleAt(documentData, 2);
    const initialDotTag = svgElementTag(initialSvg, 'dot');
    const midDotTag = svgElementTag(midSvg, 'dot');
    const minDotTag = svgElementTag(minSvg, 'dot');
    const holdDotTag = svgElementTag(holdSvg, 'dot');
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="ax:[xy]_tick:/gu) === 21, 'expected x ticks 0..10 and y ticks 10..100.');
    assertGalleryCondition(label, initialSvg.includes('f(x)') && initialSvg.includes('id="graph"') && initialSvg.includes('stroke="#C55F73"'), 'expected SVG axis label and quadratic graph.');
    assertGalleryCondition(label, svgElementTag(initialSvg, 'ax_x').includes('x1="-405"') && svgElementTag(initialSvg, 'ax_x').includes('y1="202.5"') && svgElementTag(initialSvg, 'ax_y').includes('y1="-202.5"'), 'expected SVG axes at the lower-left Manim origin.');
    assertGalleryCondition(label, svgElementTag(initialSvg, 'axis_labels:x').includes('transform="translate(425 182.5)"') && svgElementTag(initialSvg, 'axis_labels:y').includes('transform="translate(-385 -222.5)"'), 'expected SVG argmin axis labels at Manim-derived endpoints.');
    assertGalleryCondition(label, svgGroupPathData(initialSvg, 'graph').startsWith('M 0 -202.5 C 0.6164383561643835 -201.886376') && svgGroupPathData(initialSvg, 'graph').endsWith('810 -202.5'), 'expected SVG quadratic graph to span 0..10 with sampled parabola path.');
    assertGalleryCondition(label, initialDotTag.includes('transform="translate(-405 0)"') && initialDotTag.includes('r="5.4"'), 'expected initial SVG dot at x=0, f(x)=50.');
    assertGalleryCondition(label, midDotTag.includes('transform="translate(-203.517588 151.364928)"'), 'expected mid-animation SVG dot on the parabola.');
    assertGalleryCondition(label, minDotTag.includes('transform="translate(-2.035176 202.494886)"'), 'expected SVG dot at sampled argmin after one second.');
    assertGalleryCondition(label, holdDotTag.includes('transform="translate(-2.035176 202.494886)"'), 'expected final wait to hold sampled argmin dot position.');
  }

  if (label.includes('graph-area-plot')) {
    const axes = findNode(documentData, 'ax');
    const axisLabels = findNode(documentData, 'axis_labels');
    const xLabel = findNode(documentData, 'axis_labels:x');
    const yLabel = findNode(documentData, 'axis_labels:y');
    const riemann = findNode(documentData, 'riemann');
    const firstRect = findNode(documentData, 'riemann:rect:0');
    const lastRect = findNode(documentData, 'riemann:rect:9');
    const boundedArea = findNode(documentData, 'bounded_area');
    const curve1 = findNode(documentData, 'curve_1');
    const curve2 = findNode(documentData, 'curve_2');
    const line1 = findNode(documentData, 'line_1');
    const line2 = findNode(documentData, 'line_2');
    assertGalleryCondition(label, axes?.type === 'group' && axes.geometry?.xMin === 0 && axes.geometry?.xMax === 5 && axes.geometry?.yMin === 0 && axes.geometry?.yMax === 6, 'expected official graph area axes ranges.');
    assertGalleryCondition(label, approximatelyEqual(axes?.geometry?.width ?? 0, 810) && approximatelyEqual(axes?.geometry?.height ?? 0, 405) && approximatelyEqual(axes?.geometry?.originX ?? 0, -405) && approximatelyEqual(axes?.geometry?.originY ?? 0, 202.5), 'expected graph area axes dimensions and lower-left Manim origin.');
    assertGalleryCondition(label, axes?.children?.length === 16, `expected graph area axes with 16 children, got ${axes?.children?.length ?? 0}.`);
    assertGalleryCondition(label, axisLabels?.children?.length === 2 && axisLabels.children.every((child) => child.type === 'math'), 'expected x/y axis labels.');
    assertGalleryCondition(label, xLabel?.latex === 'x' && approximatelyEqual(xLabel.transform?.x ?? 0, 425) && approximatelyEqual(xLabel.transform?.y ?? 0, 182.5), 'expected rendered x label at Manim-derived x-axis endpoint.');
    assertGalleryCondition(label, yLabel?.latex === 'y' && approximatelyEqual(yLabel.transform?.x ?? 0, -385) && approximatelyEqual(yLabel.transform?.y ?? 0, -222.5), 'expected rendered y label at Manim-derived y-axis endpoint.');
    assertGalleryCondition(label, riemann?.geometry?.dataRiemannRects === true && riemann.geometry?.fn === '4*t-t*t', 'expected Riemann rectangles under the upper curve.');
    assertGalleryCondition(label, approximatelyEqual(riemann?.geometry?.dx ?? 0, 0.03) && riemann?.children?.length === 10, 'expected official Riemann dx and visible rectangle count.');
    assertGalleryCondition(label, approximatelyEqual(firstRect?.geometry?.w ?? 0, 4.86) && approximatelyEqual(firstRect?.geometry?.h ?? 0, 74.925) && approximatelyEqual(firstRect?.transform?.x ?? 0, -353.97) && approximatelyEqual(firstRect?.transform?.y ?? 0, 165.0375), 'expected rendered first Riemann rectangle from left-sampled curve height.');
    assertGalleryCondition(label, approximatelyEqual(lastRect?.geometry?.w ?? 0, 4.86) && approximatelyEqual(lastRect?.geometry?.h ?? 0, 131.96925) && approximatelyEqual(lastRect?.transform?.x ?? 0, -310.23) && approximatelyEqual(lastRect?.transform?.y ?? 0, 136.515375), 'expected rendered final Riemann rectangle from left-sampled curve height.');
    assertGalleryCondition(label, boundedArea?.geometry?.dataArea === true && boundedArea.geometry?.lower === '0.8*t*t-3*t+4' && boundedArea.geometry?.upper === '4*t-t*t', 'expected bounded area between official lower and upper functions.');
    assertGalleryCondition(label, boundedArea?.geometry?.d?.startsWith('M -80.99999999999999 -67.49999999999999 C') && boundedArea.geometry.d.endsWith('-80.99999999999999 121.49999999999997 Z'), 'expected rendered bounded area path to close between sampled upper and lower curves.');
    assertGalleryCondition(label, boundedArea?.style?.fill === '#888888' && approximatelyEqual(boundedArea?.style?.fillOpacity ?? 0, 0.5), 'expected semi-transparent GREY_B bounded area.');
    assertGalleryCondition(label, curve1?.geometry?.fn === '4*t-t*t' && curve1?.style?.stroke === '#58C4DD', 'expected BLUE upper curve.');
    assertGalleryCondition(label, curve2?.geometry?.fn === '0.8*t*t-3*t+4' && curve2?.style?.stroke === '#83C167', 'expected GREEN lower curve.');
    assertGalleryCondition(label, line1?.geometry?.dataLine === true && line1.geometry?.from === '2,0' && line1.geometry?.to === '2,4*2-2*2', 'expected left vertical bound line at x=2.');
    assertGalleryCondition(label, line2?.geometry?.dataLine === true && line2.geometry?.from === '3,0' && line2.geometry?.to === '3,4*3-3*3', 'expected right vertical bound line at x=3.');
    assertGalleryCondition(label, approximatelyEqual(line1?.geometry?.x1 ?? 0, -81) && approximatelyEqual(line1?.geometry?.y2 ?? 0, -67.5) && approximatelyEqual(line2?.geometry?.x1 ?? 0, 81) && approximatelyEqual(line2?.geometry?.y2 ?? 0, 0), 'expected rendered vertical bound lines to land on curve_1 at x=2 and x=3.');
    assertGalleryCondition(label, line1?.style?.stroke === '#FFFF00' && line2?.style?.stroke === '#FFFF00', 'expected YELLOW vertical bound lines.');
    assertGalleryCondition(label, ['ax', 'axis_labels', 'curve_1', 'curve_2', 'line_1', 'line_2', 'riemann', 'bounded_area'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected graph area z-order to follow official self.add(ax, labels, curve_1, curve_2, line_1, line_2, riemann_area, area).');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'bindExpr' && (op.id === 'line_1' || op.id === 'line_2')).length === 8, 'expected bound line endpoints to bind through axes coordinates.');
    const svg = svgSampleAt(documentData, 1);
    const firstRectTag = svgElementTag(svg, 'riemann:rect:0');
    const lastRectTag = svgElementTag(svg, 'riemann:rect:9');
    const line1Tag = svgElementTag(svg, 'line_1');
    const line2Tag = svgElementTag(svg, 'line_2');
    const boundedPath = svgGroupPathData(svg, 'bounded_area');
    const boundedPoints = svgPathPoints(boundedPath);
    const boundedFirst = boundedPoints[0];
    const boundedLast = boundedPoints.at(-1);
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="riemann:rect:/gu) === 10, 'expected all ten Riemann rectangles in SVG.');
    assertGalleryCondition(label, svg.indexOf('id="curve_1"') < svg.indexOf('id="line_1"') && svg.indexOf('id="line_2"') < svg.indexOf('id="riemann"') && svg.indexOf('id="riemann"') < svg.indexOf('id="bounded_area"'), 'expected SVG graph area surfaces to render above curves and vertical markers like official self.add order.');
    assertGalleryCondition(label, svgElementTag(svg, 'axis_labels:x').includes('transform="translate(425 182.5)"') && svgElementTag(svg, 'axis_labels:y').includes('transform="translate(-385 -222.5)"'), 'expected SVG graph area axis labels at axes UR endpoints.');
    assertGalleryCondition(label, firstRectTag.includes('width="4.86"') && firstRectTag.includes('height="74.925"') && firstRectTag.includes('transform="translate(-353.97 165.0375)"') && firstRectTag.includes('fill="#0000FF"') && firstRectTag.includes('fill-opacity="0.5"'), 'expected first Riemann rectangle left-sampled under curve_1.');
    assertGalleryCondition(label, lastRectTag.includes('width="4.86"') && lastRectTag.includes('height="131.96925"') && lastRectTag.includes('transform="translate(-310.23 136.515375)"'), 'expected final Riemann rectangle left-sampled under curve_1.');
    assertGalleryCondition(label, boundedPath.includes(' C ') && boundedPath.includes(' L ') && approximatelyEqual(boundedFirst?.x ?? 0, -81) && approximatelyEqual(boundedFirst?.y ?? 0, -67.5) && approximatelyEqual(boundedLast?.x ?? 0, -81) && approximatelyEqual(boundedLast?.y ?? 0, 121.5) && svg.includes('id="bounded_area"') && svg.includes('fill="#888888"'), 'expected smooth bounded area path between x=2 and x=3.');
    assertGalleryCondition(label, line1Tag.includes('x1="-81"') && line1Tag.includes('y1="202.5"') && line1Tag.includes('x2="-81"') && line1Tag.includes('y2="-67.5"'), 'expected left vertical bound line at x=2 up to curve_1.');
    assertGalleryCondition(label, line2Tag.includes('x1="81"') && line2Tag.includes('y1="202.5"') && line2Tag.includes('x2="81"') && line2Tag.includes('y2="0"'), 'expected right vertical bound line at x=3 up to curve_1.');
    assertGalleryCondition(label, svg.includes('id="curve_1"') && svg.includes('stroke="#58C4DD"') && svg.includes('id="curve_2"') && svg.includes('stroke="#83C167"'), 'expected both bounding curves in SVG.');
  }

  if (label.includes('heat-diagram-plot')) {
    const axes = findNode(documentData, 'ax');
    const labels = findNode(documentData, 'axis_labels');
    const xLabel = findNode(documentData, 'axis_labels:x');
    const yLabel = findNode(documentData, 'axis_labels:y');
    const xZero = findNode(documentData, 'ax:x_number:0');
    const xThirtyFive = findNode(documentData, 'ax:x_number:35');
    const yMinusFive = findNode(documentData, 'ax:y_number:m5');
    const yThirty = findNode(documentData, 'ax:y_number:30');
    const lineGraph = findNode(documentData, 'graph');
    const graphPath = findNode(documentData, 'graph:line_graph');
    const vertices = (lineGraph?.children ?? []).filter((child) => child.id.startsWith('graph:vertex:'));
    assertGalleryCondition(label, axes?.type === 'group' && axes.geometry?.xMin === 0 && axes.geometry?.xMax === 40 && axes.geometry?.yMin === -8 && axes.geometry?.yMax === 32, 'expected heat diagram axes ranges.');
    assertGalleryCondition(label, approximatelyEqual(axes?.geometry?.width ?? 0, 607.5) && approximatelyEqual(axes?.geometry?.height ?? 0, 405), 'expected heat diagram axes dimensions.');
    assertGalleryCondition(label, axes?.geometry?.originX === -303.75 && axes?.geometry?.originY === 121.5, 'expected asymmetric heat diagram axes origin.');
    assertGalleryCondition(label, axes?.children?.length === 34, `expected heat diagram numbered/ticked axes with 34 children, got ${axes?.children?.length ?? 0}.`);
    assertGalleryCondition(label, labels?.children?.length === 2 && labels.children[0]?.geometry?.fontSize === 32 && labels.children[1]?.geometry?.fontSize === 30, 'expected differently sized heat diagram MathTex axis labels.');
    assertGalleryCondition(label, xLabel?.latex === '\\\\Delta Q' && xLabel.transform?.x === 356 && xLabel.transform?.y === 78, 'expected Delta Q label at the x-axis end.');
    assertGalleryCondition(label, yLabel?.latex === 'T[^\\\\circ C]' && yLabel.transform?.x === -238 && yLabel.transform?.y === -245, 'expected temperature label at the y-axis end.');
    assertGalleryCondition(label, xZero?.text === '0' && approximatelyEqual(xZero.transform?.x ?? 0, -303.75) && approximatelyEqual(xThirtyFive?.transform?.x ?? 0, 227.8125) && xThirtyFive?.text === '35', 'expected heat diagram x-axis numbers from 0 through 35 at Manim offsets.');
    assertGalleryCondition(label, yMinusFive?.text === '-5' && approximatelyEqual(yMinusFive.transform?.y ?? 0, 152.125) && yThirty?.text === '30' && approximatelyEqual(yThirty.transform?.y ?? 0, -202.25), 'expected heat diagram y-axis numbers from -5 through 30 at Manim offsets.');
    assertGalleryCondition(label, lineGraph?.geometry?.dataLineGraph === true && lineGraph.geometry?.points === '0,20;8,0;38,0;39,-5', 'expected dataLineGraph through official heat diagram points.');
    assertGalleryCondition(label, lineGraph?.children?.length === 5 && vertices.length === 4, 'expected one polyline and four visible vertices.');
    assertGalleryCondition(label, ['graph:line_graph', 'graph:vertex:0', 'graph:vertex:1', 'graph:vertex:2', 'graph:vertex:3'].every((id, index, ids) => index === 0 || (lineGraph.children ?? []).findIndex((child) => child.id === ids[index - 1]) < (lineGraph.children ?? []).findIndex((child) => child.id === id)), 'expected plot_line_graph child order with vertex dots above the line.');
    assertGalleryCondition(label, ['ax', 'axis_labels', 'graph'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected heat diagram scene z-order to follow official self.add(ax, labels, graph).');
    assertGalleryCondition(label, graphPath?.style?.stroke === '#FFFF00' && approximatelyEqual(graphPath?.style?.strokeWidth ?? 0, 4), 'expected YELLOW heat diagram line.');
    assertGalleryCondition(label, graphPath?.geometry?.d === 'M -303.75 -81 L -182.25 121.5 L 273.375 121.5 L 288.5625 172.125', 'expected rendered heat diagram line path through c2p-converted data points.');
    assertGalleryCondition(label, approximatelyEqual(vertices[0]?.transform?.x ?? 0, -303.75) && approximatelyEqual(vertices[0]?.transform?.y ?? 0, -81) && approximatelyEqual(vertices[3]?.transform?.x ?? 0, 288.5625) && approximatelyEqual(vertices[3]?.transform?.y ?? 0, 172.125), 'expected rendered heat diagram endpoint vertices at source data coordinates.');
    assertGalleryCondition(label, vertices.every((vertex) => approximatelyEqual(vertex.geometry?.r ?? 0, 5.4) && vertex.style?.fill === '#FFFF00' && vertex.style?.stroke === '#FFFF00'), 'expected yellow vertices at each heat diagram point.');
    const svg = svgSampleAt(documentData, 1);
    const graphSvg = svgGroupPathData(svg, 'graph:line_graph');
    const vertexTags = [0, 1, 2, 3].map((index) => svgElementTag(svg, `graph:vertex:${index}`));
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="ax:[xy]_tick:/gu) === 16 && svg.includes('>35<') && svg.includes('>-5<'), 'expected heat diagram SVG ticks and numeric labels.');
    assertGalleryCondition(label, svg.indexOf('id="ax"') < svg.indexOf('id="axis_labels"') && svg.indexOf('id="axis_labels"') < svg.indexOf('id="graph"') && svg.indexOf('id="graph:line_graph"') < svg.indexOf('id="graph:vertex:0"'), 'expected SVG heat diagram order to keep labels/graph above axes and vertex dots above the polyline.');
    assertGalleryCondition(label, svg.includes('\\\\Delta Q') && svg.includes('T[^\\\\circ C]'), 'expected SVG axis labels.');
    assertGalleryCondition(label, svgElementTag(svg, 'axis_labels:x').includes('transform="translate(356 78)"') && svgElementTag(svg, 'axis_labels:y').includes('transform="translate(-238 -245)"'), 'expected SVG heat diagram axis labels at source-derived offsets.');
    assertGalleryCondition(label, graphSvg === 'M -303.75 -81 L -182.25 121.5 L 273.375 121.5 L 288.5625 172.125', 'expected SVG line graph through heat diagram data points.');
    assertGalleryCondition(label, vertexTags[0]?.includes('transform="translate(-303.75 -81)"') && vertexTags[1]?.includes('transform="translate(-182.25 121.5)"'), 'expected first two heat diagram vertices in SVG.');
    assertGalleryCondition(label, vertexTags[2]?.includes('transform="translate(273.375 121.5)"') && vertexTags[3]?.includes('transform="translate(288.5625 172.125)"'), 'expected final two heat diagram vertices in SVG.');
    assertGalleryCondition(label, vertexTags.every((tag) => tag.includes('r="5.4"') && tag.includes('fill="#FFFF00"')), 'expected yellow vertex dots in SVG.');
  }

  if (label.includes('three-d-surface-plot')) {
    const axes = findNode(documentData, 'axes');
    const xAxis = findNode(documentData, 'axes:x:axis');
    const xTick = findNode(documentData, 'axes:x:tick:m1');
    const surface = findNode(documentData, 'gauss');
    const surfaceFaces = surface?.children ?? [];
    const surfaceFills = new Set(surfaceFaces.map((child) => child.style?.fill?.toLowerCase()).filter(Boolean));
    assertGalleryCondition(label, axes?.geometry?.threeDAxes === true, 'expected projected ThreeDAxes helper.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'axes') < documentData.nodes.findIndex((node) => node.id === 'gauss'), 'expected official self.add(axes, gauss_plane) z-order.');
    assertGalleryCondition(label, axes?.transform?.x === 0 && axes?.transform?.y === 0, 'expected ThreeDAxes to stay at the unshifted Manim scene origin.');
    assertGalleryCondition(label, axes?.children?.length === 36, `expected projected default ThreeDAxes with ticks and tips, got ${axes?.children?.length ?? 0} children.`);
    assertGalleryCondition(label, axes?.geometry?.xRange?.join(',') === '-6,6,1', 'expected official default ThreeDAxes xRange.');
    assertGalleryCondition(label, axes?.geometry?.yRange?.join(',') === '-5,5,1', 'expected official default ThreeDAxes yRange.');
    assertGalleryCondition(label, axes?.geometry?.zRange?.join(',') === '-4,4,1', 'expected official default ThreeDAxes zRange.');
    assertGalleryCondition(label, axes?.geometry?.xLength === 10.5 && axes.geometry?.yLength === 10.5 && axes.geometry?.zLength === 6.5, 'expected Manim default ThreeDAxes axis lengths.');
    assertGalleryCondition(label, xAxis?.style?.stroke === '#FFFFFF' && xAxis.style?.strokeWidth === 2, 'expected Manim default white 2px ThreeDAxes strokes.');
    assertGalleryCondition(label, xTick?.style?.strokeWidth === 2 && approximatelyEqual(xTick?.geometry?.x1 ?? 0, -24.397985) && approximatelyEqual(xTick?.geometry?.x2 ?? 0, -32.579284), 'expected Manim default ThreeDAxes tick size and stroke for theta=-30.');
    assertGalleryCondition(label, axes?.geometry?.cameraProjection === 'manim' && axes.geometry?.phi === 75 && axes.geometry?.theta === -30, 'expected ThreeDAxes to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, surface?.geometry?.gaussianSurface === true, 'expected gaussianSurface group gauss.');
    assertGalleryCondition(label, surface?.transform?.x === 0 && surface?.transform?.y === 0, 'expected gaussianSurface to share the unshifted axes placement.');
    assertGalleryCondition(label, surface?.geometry?.uMin === -2 && surface?.geometry?.uMax === 2 && surface?.geometry?.vMin === -2 && surface?.geometry?.vMax === 2, 'expected official u/v range -2..2.');
    assertGalleryCondition(label, surface?.geometry?.resolution === 24 && surface?.geometry?.sigma === 0.4 && surface?.geometry?.scale === 2, 'expected official gaussian resolution, sigma, and scale.');
    assertGalleryCondition(label, surface?.geometry?.mu?.join(',') === '0,0', 'expected official gaussian mu=[0,0].');
    assertGalleryCondition(label, surface?.geometry?.cameraProjection === 'manim' && surface.geometry?.phi === 75 && surface.geometry?.theta === -30, 'expected gaussianSurface to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, surfaceFaces.length === 24 * 24, `expected 576 gaussian surface faces, got ${surfaceFaces.length}.`);
    assertGalleryCondition(label, surfaceFaces.every((face) => face.metadata?.surfaceFace), 'expected gaussian faces to retain source row/column/depth/shade metadata for Manim-style painter ordering.');
    assertGalleryCondition(label, surfaceFaces.every((face, index, faces) => index === 0 || Number(faces[index - 1]?.metadata?.surfaceFace?.depth) <= Number(face.metadata?.surfaceFace?.depth)), 'expected gaussian faces to be serialized in increasing camera-depth order.');
    assertGalleryCondition(label, surface?.geometry?.light?.join(',') === '-7,-9,10', 'expected gaussianSurface to use Manim ThreeDCamera default light source.');
    assertGalleryCondition(label, surfaceFaces.some((face) => face.metadata?.surfaceFace?.row === 12 && face.metadata?.surfaceFace?.col === 12 && Number(face.metadata?.surfaceFace?.height) > 0.5), 'expected gaussian metadata to identify the high center peak.');
    assertGalleryCondition(label, Math.max(...surfaceFaces.map((face) => Number(face.metadata?.surfaceFace?.shade ?? 0))) > 0.2 && Math.min(...surfaceFaces.map((face) => Number(face.metadata?.surfaceFace?.shade ?? 0))) < -0.005, 'expected gaussian metadata to preserve Manim get_shaded_rgb light and shadow deltas.');
    assertGalleryCondition(label, surfaceFaces.every((child) => child.style?.stroke === '#83C167' && approximatelyEqual(child.style?.strokeWidth ?? 0, 0.5)), 'expected green 0.5px surface face strokes.');
    assertGalleryCondition(label, surfaceFaces.every((child) => approximatelyEqual(child.style?.fillOpacity ?? 0, 0.5)), 'expected checkerboard fill opacity 0.5.');
    assertGalleryCondition(label, surfaceFills.has('#ff862f') && surfaceFills.has('#58c4dd'), 'expected official ORANGE/BLUE checkerboard base colors to survive among shaded gaussian faces.');
    assertGalleryCondition(label, surfaceFills.size >= 20, `expected light/normal-shaded checkerboard face colors, got ${surfaceFills.size}.`);
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="gauss:face:/gu) === 24 * 24, 'expected all gaussian mesh faces to serialize into SVG.');
    assertGalleryCondition(label, svg.includes('stroke="#83C167"') && svg.includes('fill-opacity="0.5"'), 'expected SVG gaussian surface strokes and opacity.');
    assertGalleryCondition(label, svg.indexOf('id="axes:x:axis"') < svg.indexOf('id="gauss:face:'), 'expected SVG gaussian surface to render over the axes like self.add(axes, gauss_plane).');
    assertGalleryCondition(label, !/id="(?:highlight|highlight_core|terminator_left|terminator_bottom|gauss_shadow|gauss_rim)"/u.test(svg), 'expected no non-Manim screen-space gaussian highlight or shadow overlays.');
  }

  if (label.includes('three-d-light-source-position')) {
    const axes = findNode(documentData, 'axes');
    const xAxis = findNode(documentData, 'axes:x:axis');
    const xTick = findNode(documentData, 'axes:x:tick:m1');
    const sphere = findNode(documentData, 'sphere');
    const sphereFaces = sphere?.children ?? [];
    const sphereFills = new Set(sphereFaces.map((child) => child.style?.fill?.toLowerCase()).filter(Boolean));
    assertGalleryCondition(label, axes?.geometry?.threeDAxes === true, 'expected projected ThreeDAxes helper.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'axes') < documentData.nodes.findIndex((node) => node.id === 'sphere'), 'expected official self.add(axes, sphere) z-order.');
    assertGalleryCondition(label, axes?.transform?.x === 0 && axes?.transform?.y === 0, 'expected ThreeDAxes to stay at the unshifted Manim scene origin.');
    assertGalleryCondition(label, axes?.children?.length === 36, `expected projected default ThreeDAxes with ticks and tips, got ${axes?.children?.length ?? 0} children.`);
    assertGalleryCondition(label, axes?.geometry?.xRange?.join(',') === '-6,6,1', 'expected official default ThreeDAxes xRange.');
    assertGalleryCondition(label, axes?.geometry?.yRange?.join(',') === '-5,5,1', 'expected official default ThreeDAxes yRange.');
    assertGalleryCondition(label, axes?.geometry?.zRange?.join(',') === '-4,4,1', 'expected official default ThreeDAxes zRange.');
    assertGalleryCondition(label, axes?.geometry?.xLength === 10.5 && axes.geometry?.yLength === 10.5 && axes.geometry?.zLength === 6.5, 'expected Manim default ThreeDAxes axis lengths.');
    assertGalleryCondition(label, xAxis?.style?.stroke === '#FFFFFF' && xAxis.style?.strokeWidth === 2, 'expected Manim default white 2px ThreeDAxes strokes.');
    assertGalleryCondition(label, xTick?.style?.strokeWidth === 2 && approximatelyEqual(xTick?.geometry?.x1 ?? 0, 32.579284) && approximatelyEqual(xTick?.geometry?.x2 ?? 0, 24.397985), 'expected Manim default ThreeDAxes tick size and stroke for theta=30.');
    assertGalleryCondition(label, axes?.geometry?.cameraProjection === 'manim' && axes.geometry?.phi === 75 && axes.geometry?.theta === 30, 'expected ThreeDAxes to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, sphere?.geometry?.sphereSurface === true, 'expected sphereSurface mesh.');
    assertGalleryCondition(label, sphere?.transform?.x === 0 && sphere?.transform?.y === 0, 'expected sphereSurface to share the unshifted axes placement.');
    assertGalleryCondition(label, approximatelyEqual(sphere?.geometry?.uMin ?? 0, -Math.PI / 2) && approximatelyEqual(sphere?.geometry?.uMax ?? 0, Math.PI / 2) && sphere?.geometry?.vMin === 0 && approximatelyEqual(sphere?.geometry?.vMax ?? 0, Math.PI * 2), 'expected full Manim sphere surface parameter range.');
    assertGalleryCondition(label, sphere?.geometry?.uResolution === 15 && sphere?.geometry?.vResolution === 32, 'expected official sphere surface resolution 15x32.');
    assertGalleryCondition(label, approximatelyEqual(sphere?.geometry?.radius ?? 0, 104), 'expected sphere mesh radius near official 1.5 Manim units.');
    assertGalleryCondition(label, approximatelyEqual(sphere?.geometry?.worldRadius ?? 0, 1.5), 'expected official sphere world radius 1.5.');
    assertGalleryCondition(label, sphere?.geometry?.light?.join(',') === '0,0,-3', 'expected light_source.move_to(3*IN) as a positional light source.');
    assertGalleryCondition(label, sphere?.geometry?.cameraProjection === 'manim' && sphere.geometry?.phi === 75 && sphere.geometry?.theta === 30, 'expected sphereSurface to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, sphereFaces.length === 15 * 32, `expected 480 sphere faces, got ${sphereFaces.length}.`);
    assertGalleryCondition(label, sphereFaces.every((face) => face.metadata?.surfaceFace), 'expected sphere faces to retain source row/column/depth metadata for Manim-style painter ordering.');
    assertGalleryCondition(label, sphereFaces.every((face, index, faces) => index === 0 || Number(faces[index - 1]?.metadata?.surfaceFace?.depth) <= Number(face.metadata?.surfaceFace?.depth)), 'expected sphere faces to be serialized in increasing camera-depth order.');
    assertGalleryCondition(label, Math.max(...sphereFaces.map((face) => Number(face.metadata?.surfaceFace?.shade ?? 0))) > 0.4 && Math.min(...sphereFaces.map((face) => Number(face.metadata?.surfaceFace?.shade ?? 0))) < -0.2, 'expected sphere metadata to preserve Manim get_shaded_rgb light and shadow deltas.');
    assertGalleryCondition(label, sphereFaces.every((child) => child.style?.stroke === '#BBBBBB' && approximatelyEqual(child.style?.strokeWidth ?? 0, 0.5)), 'expected LIGHT_GREY 0.5px sphere face strokes.');
    assertGalleryCondition(label, sphereFaces.every((child) => approximatelyEqual(child.style?.fillOpacity ?? 0, 1)), 'expected opaque sphere surface faces.');
    assertGalleryCondition(label, sphereFills.has('#e65a4c') && sphereFills.has('#cf5044'), 'expected official RED_D/RED_E checkerboard base colors to survive among shaded sphere faces.');
    assertGalleryCondition(label, sphereFills.size >= 24, `expected light-shaded checkerboard sphere faces, got ${sphereFills.size}.`);
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 3 && !documentData.timeline.some((op) => op.op === 'animate' || op.op === 'effect'), 'expected static self.add(axes, sphere) scene with no play animations.');
    const svg = svgSampleAt(documentData, 0);
    assertGalleryCondition(label, countSvgOccurrences(svg, /id="sphere:face:/gu) === 15 * 32, 'expected all sphere mesh faces to serialize into SVG.');
    assertGalleryCondition(label, svg.indexOf('id="axes:x:axis"') < svg.indexOf('id="sphere"'), 'expected SVG sphere to render over the axes like self.add(axes, sphere).');
    assertGalleryCondition(label, !/id="(?:highlight|highlight_core|terminator_left|terminator_bottom|sphere_shadow|sphere_rim)"/u.test(svg), 'expected no non-Manim screen-space sphere highlight or shadow overlays.');
  }

  if (label.includes('three-d-camera-rotation')) {
    const axes = findNode(documentData, 'axes');
    const circle = findNode(documentData, 'circle_xy');
    assertGalleryCondition(label, axes?.geometry?.threeDAxes === true, 'expected ThreeDAxes helper.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'circle_xy') < documentData.nodes.findIndex((node) => node.id === 'axes'), 'expected official self.add(circle, axes) z-order.');
    assertGalleryCondition(label, axes?.transform?.x === 0 && axes?.transform?.y === 0 && circle?.transform?.x === 0 && circle?.transform?.y === 0, 'expected circle and ThreeDAxes to stay at the unshifted Manim scene origin.');
    assertGalleryCondition(label, axes?.geometry?.cameraProjection === 'manim' && axes.geometry?.phi === 75 && axes.geometry?.theta === 30, 'expected ThreeDAxes to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, axes?.geometry?.xLength === 10.5 && axes.geometry?.yLength === 10.5 && axes.geometry?.zLength === 6.5, 'expected Manim default ThreeDAxes axis lengths.');
    assertGalleryCondition(label, findNode(documentData, 'axes:x:axis')?.style?.stroke === '#FFFFFF' && findNode(documentData, 'axes:x:axis')?.style?.strokeWidth === 2, 'expected Manim default white 2px ThreeDAxes strokes.');
    assertGalleryCondition(label, findNode(documentData, 'axes:x:tick:m1')?.style?.strokeWidth === 2 && approximatelyEqual(findNode(documentData, 'axes:x:tick:m1')?.geometry?.x1 ?? 0, 32.579284), 'expected Manim default ThreeDAxes tick size and stroke.');
    assertGalleryCondition(label, circle?.geometry?.projectedCircle === true, 'expected projected default Circle(radius=1).');
    assertGalleryCondition(label, circle?.geometry?.cameraProjection === 'manim' && circle.geometry?.phi === 75 && circle.geometry?.theta === 30, 'expected Circle(radius=1) to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, circle?.style?.fill === 'none' && circle.style?.stroke === '#FFFFFF' && circle.style?.strokeWidth === 4, 'expected default Circle() white 4px stroke with no fill.');
    assertGalleryCondition(label, findNode(documentData, 'axes:x:tip')?.type === 'path', 'expected projected x-axis arrow tip.');
    assertGalleryCondition(label, findNode(documentData, 'axes:y:tip')?.type === 'path', 'expected projected y-axis arrow tip.');
    assertGalleryCondition(label, findNode(documentData, 'axes:z:tip')?.type === 'path', 'expected projected z-axis arrow tip.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:x:tick:') === 12, 'expected projected x-axis ticks.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:y:tick:') === 10, 'expected projected y-axis ticks.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:z:tick:') === 8, 'expected projected z-axis ticks.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 3, 'expected static background, circle, and axes creation only.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.t === 0 && op.duration === 1 && op.easing === 'linear').length === 99, 'expected every projected axes, tick, tip, and circle element to move during the ambient camera sweep.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.t === 1 && op.duration === 1 && op.easing === 'easeInOut').length === 99, 'expected every projected axes, tick, tip, and circle element to restore during move_camera.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:x:axis', path: 'geometry.x2', from: -227.042817, to: -260.575741, t: 0, duration: 1, easing: 'linear' }), 'expected one-second ambient theta sweep.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'circle_xy', path: 'geometry.d', t: 0, duration: 1, easing: 'linear' }), 'expected projected circle to move during ambient sweep.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:x:axis', path: 'geometry.x2', from: -260.575741, to: -227.042817, t: 1, duration: 1, easing: 'easeInOut' }), 'expected one-second move_camera restore of theta.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'circle_xy', path: 'geometry.d', t: 1, duration: 1, easing: 'easeInOut' }), 'expected projected circle to restore during move_camera.');
    const initialSvg = svgSampleAt(documentData, 0);
    const sweptSvg = svgSampleAt(documentData, 1);
    const restoredSvg = svgSampleAt(documentData, 2);
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="axes:[xyz]:tick:/gu) === 30, 'expected all camera-projected axis ticks to serialize into SVG.');
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="axes:[xyz]:tip"/gu) === 3 && initialSvg.includes('id="circle_xy"'), 'expected SVG camera-projected axis tips and circle.');
    assertGalleryCondition(label, /id="axes:x:axis"[^>]*x2="-260\.575741"/u.test(sweptSvg), 'expected SVG ambient sweep to reach the camera-projected x-axis endpoint.');
    assertGalleryCondition(label, /id="axes:x:axis"[^>]*x2="-227\.042817"/u.test(restoredSvg), 'expected SVG move_camera restore to return the x-axis endpoint.');
  }

  if (label.includes('three-d-camera-illusion-rotation')) {
    const axes = findNode(documentData, 'axes');
    const circle = findNode(documentData, 'circle_xy');
    assertGalleryCondition(label, axes?.geometry?.threeDAxes === true, 'expected ThreeDAxes helper.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'circle_xy') < documentData.nodes.findIndex((node) => node.id === 'axes'), 'expected official self.add(circle, axes) z-order.');
    assertGalleryCondition(label, axes?.transform?.x === 0 && axes?.transform?.y === 0 && circle?.transform?.x === 0 && circle?.transform?.y === 0, 'expected circle and ThreeDAxes to stay at the unshifted Manim scene origin.');
    assertGalleryCondition(label, axes?.geometry?.cameraProjection === 'manim' && axes.geometry?.phi === 75 && axes.geometry?.theta === 30, 'expected ThreeDAxes to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, axes?.geometry?.xLength === 10.5 && axes.geometry?.yLength === 10.5 && axes.geometry?.zLength === 6.5, 'expected Manim default ThreeDAxes axis lengths.');
    assertGalleryCondition(label, findNode(documentData, 'axes:x:axis')?.style?.stroke === '#FFFFFF' && findNode(documentData, 'axes:x:axis')?.style?.strokeWidth === 2, 'expected Manim default white 2px ThreeDAxes strokes.');
    assertGalleryCondition(label, findNode(documentData, 'axes:x:tick:m1')?.style?.strokeWidth === 2 && approximatelyEqual(findNode(documentData, 'axes:x:tick:m1')?.geometry?.x1 ?? 0, 32.579284), 'expected Manim default ThreeDAxes tick size and stroke.');
    assertGalleryCondition(label, circle?.geometry?.projectedCircle === true, 'expected projected default Circle(radius=1).');
    assertGalleryCondition(label, circle?.geometry?.cameraProjection === 'manim' && circle.geometry?.phi === 75 && circle.geometry?.theta === 30, 'expected Circle(radius=1) to use Manim ThreeDCamera projection.');
    assertGalleryCondition(label, circle?.style?.fill === 'none' && circle.style?.stroke === '#FFFFFF' && circle.style?.strokeWidth === 4, 'expected default Circle() white 4px stroke with no fill.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:x:tick:') === 12, 'expected projected x-axis ticks.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:y:tick:') === 10, 'expected projected y-axis ticks.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'axes:z:tick:') === 8, 'expected projected z-axis ticks.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'create').length === 3, 'expected static background, circle, and axes creation only.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.t === 0 && approximatelyEqual(op.duration ?? 0, Math.PI / 4) && op.easing === 'easeInOut').length === 99, 'expected every projected axes, tick, tip, and circle element to move during the first theta-only illusion segment.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && approximatelyEqual(op.t ?? 0, Math.PI / 4) && approximatelyEqual(op.duration ?? 0, Math.PI / 4) && op.easing === 'easeInOut').length === 118, 'expected projected axes, ticks, tips, and circle to move during the second theta-and-phi illusion segment.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:x:axis', path: 'geometry.x2', from: -227.042817, to: -289.670334, t: 0, duration: 0.785398, easing: 'easeInOut' }), 'expected first illusion theta keyframe from source sine updater.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:z:axis', path: 'geometry.y2', from: -221.20337, to: -221.20337, t: 0, duration: 0.785398, easing: 'easeInOut' }) === false, 'expected first illusion segment to keep phi at its origin.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:x:axis', path: 'geometry.x2', from: -289.670334, to: -222.462984, t: 0.785398, duration: 0.785398, easing: 'easeInOut' }), 'expected second illusion keyframe over PI/2 wait.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'axes:z:axis', path: 'geometry.y2', from: -221.20337, to: -211.725621, t: 0.785398, duration: 0.785398, easing: 'easeInOut' }), 'expected second illusion phi keyframe over PI/2 wait.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'circle_xy', path: 'geometry.d', t: 0, duration: 0.785, easing: 'easeInOut' }), 'expected projected circle to wobble in first illusion segment.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'circle_xy', path: 'geometry.d', t: 0.785, duration: 0.785, easing: 'easeInOut' }), 'expected projected circle to wobble in second illusion segment.');
    const initialSvg = svgSampleAt(documentData, 0);
    const thetaPeakSvg = svgSampleAt(documentData, Math.PI / 4);
    const phiDropSvg = svgSampleAt(documentData, Math.PI / 2);
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="axes:[xyz]:tick:/gu) === 30, 'expected all illusion camera-projected axis ticks to serialize into SVG.');
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="axes:[xyz]:tip"/gu) === 3 && initialSvg.includes('id="circle_xy"'), 'expected SVG illusion axis tips and circle.');
    assertGalleryCondition(label, /id="axes:x:axis"[^>]*x2="-289\.67033[34]"/u.test(thetaPeakSvg), 'expected SVG illusion theta peak to reach the projected x-axis endpoint.');
    assertGalleryCondition(label, /id="axes:z:axis"[^>]*y2="-211\.725621"/u.test(phiDropSvg), 'expected SVG illusion phi drop to move the projected z-axis endpoint.');
  }

  if (label.includes('moving-zoomed-scene-around')) {
    const frame = findNode(documentData, 'frame');
    const zoomBg = findNode(documentData, 'zoom_bg');
    const zoomDisplay = findNode(documentData, 'zoom_display');
    const zoomDisplayContent = findNode(documentData, 'zoom_display_content');
    const zoomDisplayFrame = findNode(documentData, 'zoom_display_frame');
    const zoomSample = findNode(documentData, 'zoom_sample');
    const zoomDot = findNode(documentData, 'zoom_dot');
    const sourcePixels = [
      ['px_00', '#000000', -354.375, -118.125],
      ['px_01', '#646464', -118.125, -118.125],
      ['px_02', '#1E1E1E', 118.125, -118.125],
      ['px_03', '#C8C8C8', 354.375, -118.125],
      ['px_10', '#FFFFFF', -354.375, 118.125],
      ['px_11', '#000000', -118.125, 118.125],
      ['px_12', '#050505', 118.125, 118.125],
      ['px_13', '#212121', 354.375, 118.125],
    ];
    assertGalleryCondition(label, approximatelyEqual(frame?.geometry?.w ?? 0, 121.5) && approximatelyEqual(frame?.geometry?.h ?? 0, 20.25), 'expected zoomed camera frame to match zoom_factor=0.3 and 6x1 display ratio.');
    assertGalleryCondition(label, frame?.style?.stroke === '#9A72AC' && approximatelyEqual(frame?.style?.strokeWidth ?? 0, 3), 'expected purple zoomed camera frame with official stroke width 3.');
    assertGalleryCondition(label, approximatelyEqual(zoomDisplay?.geometry?.w ?? 0, 121.5) && approximatelyEqual(zoomDisplay?.geometry?.h ?? 0, 20.25), 'expected zoom display to pop out from the camera frame geometry.');
    assertGalleryCondition(label, zoomDisplayContent?.type === 'group' && zoomDisplayContent.geometry?.clipTarget === 'zoom_display', 'expected zoomed display content to clip against the zoom display frame.');
    assertGalleryCondition(label, (zoomDisplayContent?.children ?? []).length === 3, 'expected clipped zoomed display content to contain display background, sampled camera crop, and the magnified dot.');
    assertGalleryCondition(label, approximatelyEqual(zoomBg?.geometry?.w ?? 0, 155.25) && approximatelyEqual(zoomBg?.geometry?.h ?? 0, 54), 'expected BackgroundRectangle buff around the collapsed zoom display.');
    assertGalleryCondition(label, zoomDisplayFrame?.style?.stroke === '#FC6255' && approximatelyEqual(zoomDisplayFrame?.style?.strokeWidth ?? 0, 20), 'expected red zoomed display frame with official image_frame_stroke_width=20.');
    assertGalleryCondition(label, countNodesWithPrefix(documentData, 'px_') === 8, 'expected original 2x4 image pixel grid.');
    assertGalleryCondition(label, sourcePixels.every(([id, fill, x, y]) => {
      const pixel = findNode(documentData, id);
      return pixel?.type === 'rect' && pixel.style?.fill === fill && pixel.geometry?.w === 236.25 && pixel.geometry?.h === 236.25 && pixel.transform?.x === x && pixel.transform?.y === y;
    }), 'expected source ImageMobject uint8 pixels [[0,100,30,200],[255,0,5,33]] at image.height=7 placement.');
    assertGalleryCondition(label, zoomSample?.type === 'rect' && zoomSample.style?.fill === '#646464', 'expected zoomed camera crop to sample the single source pixel under Dot().shift(UL*2).');
    assertGalleryCondition(label, zoomDot?.type === 'circle' && approximatelyEqual(zoomDot.geometry?.r ?? 0, 5.4), 'expected zoomed camera crop to include the dot before pop-out.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_display', path: 'geometry.w', from: 121.5, to: 405, t: 1, duration: 1 }), 'expected pop-out to official 6-unit zoom display width.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_sample', path: 'geometry.w', from: 121.5, to: 405, t: 1, duration: 1 }), 'expected sampled zoom crop to scale with the pop-out display.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_dot', path: 'geometry.r', from: 5.4, to: 18, t: 1, duration: 1 }), 'expected dot radius to magnify by the inverse zoom factor.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_bg', path: 'geometry.w', from: 155.25, to: 438.75, t: 1, duration: 1 }), 'expected pop-out BackgroundRectangle to include MED_SMALL_BUFF.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frame_text', path: 'transform.y', from: -16.5, to: -84, t: 0, duration: 1, easing: 'smooth' }), 'expected Frame label to fade in from UP-shifted position during the first play.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_text', path: 'transform.y', from: 17.5, to: -50, t: 2, duration: 1, easing: 'smooth' }), 'expected Zoomed camera label to fade in immediately after the pop-out play.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_text', path: 'transform.opacity', from: 1, to: 0, t: 3, duration: 1 }), 'expected Zoomed camera label to fade out during the anisotropic scale play.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frame', path: 'transform.scaleX', from: 1, to: 0.5, t: 3, duration: 1 }), 'expected anisotropic frame scale x=0.5.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frame', path: 'transform.scaleY', from: 1, to: 1.5, t: 3, duration: 1 }), 'expected anisotropic frame scale y=1.5.');
    assertGalleryCondition(label, !hasAnimation(documentData, { id: 'zoom_bg', path: 'transform.scaleX', from: 1, to: 0.5, t: 3, duration: 1 }), 'expected transparent BackgroundRectangle not to follow the intermediate anisotropic display scale outside UpdateFromFunc.');
    assertGalleryCondition(label, !hasAnimation(documentData, { id: 'zoom_bg', path: 'transform.scale', from: 1, to: 2, t: 5, duration: 1 }), 'expected transparent BackgroundRectangle not to follow ScaleInPlace outside UpdateFromFunc.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_display', path: 'transform.scale', from: 1, to: 2, t: 5, duration: 1 }), 'expected ScaleInPlace(zoomed_display, 2).');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frame', path: 'transform.y', from: -135, to: 33.75, t: 7, duration: 1 }), 'expected frame shift by 2.5*DOWN.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_display', path: 'transform.x', from: 244, to: -135, t: 9, duration: 1 }), 'expected reverse pop-out collapse to shifted frame x.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_display', path: 'transform.y', from: -135, to: 33.75, t: 9, duration: 1 }), 'expected reverse pop-out collapse to shifted frame y.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_display', path: 'transform.scale', from: 2, to: 0.3, t: 9, duration: 1 }), 'expected reverse pop-out to collapse the zoom display back to the frame size.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_sample', path: 'style.fill', from: '#646464', to: '#000000', t: 7, duration: 1 }), 'expected zoom display content to retarget to the bottom-row pixel after frame shift.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'zoom_dot', path: 'transform.opacity', from: 1, to: 0, t: 7, duration: 1 }), 'expected magnified dot to leave the zoomed camera crop after frame shift.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'zoom_display_frame' && op.effect === 'uncreate'), 'expected final Uncreate on zoomed display frame.');
    const initialSvg = svgSampleAt(documentData, 0);
    const poppedSvg = svgSampleAt(documentData, 2);
    const shiftedSvg = svgSampleAt(documentData, 8);
    const collapsedDisplay = renderedNodeAt(documentData, 10, 'zoom_display');
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="px_/gu) === 8, 'expected original image pixels to serialize into initial SVG.');
    assertGalleryCondition(label, poppedSvg.includes('id="zoom_sample"') && poppedSvg.includes('id="zoom_dot"'), 'expected zoomed camera crop and magnified dot to serialize into SVG after pop out.');
    assertGalleryCondition(label, /id="zoom_display_content"[^>]*clip-path=/u.test(poppedSvg), 'expected popped-out zoom display content to serialize with a clip path.');
    assertGalleryCondition(label, /id="zoom_display"[^>]*width="405"/u.test(poppedSvg), 'expected popped-out zoom display SVG width 405.');
    assertGalleryCondition(label, /id="zoom_sample"[^>]*fill="(?:#000000|rgb\(0, 0, 0\))"/u.test(shiftedSvg) && !shiftedSvg.includes('id="zoom_dot"'), 'expected retargeted zoom display crop without the dot in SVG after frame shift.');
    assertGalleryCondition(label, approximatelyEqual(collapsedDisplay?.transform?.scale ?? 0, 0.3) && approximatelyEqual((collapsedDisplay?.geometry?.w ?? 0) * (collapsedDisplay?.transform?.scaleX ?? 1) * (collapsedDisplay?.transform?.scale ?? 1), 60.75), 'expected reverse pop-out endpoint to match the anisotropically scaled zoom frame width.');
  }

  if (label.includes('special-camera')) {
    const axes = findNode(documentData, 'ax');
    const graph = findNode(documentData, 'graph');
    const movingDot = findNode(documentData, 'moving_dot');
    const cameraFrame = findNode(documentData, 'camera_frame');
    assertGalleryCondition(label, axes?.geometry?.width === 810 && axes.geometry?.height === 405, 'expected camera demo axes to match the Manim frame-scaled geometry.');
    assertGalleryCondition(label, graph?.geometry?.fn === 'sin(t)' && approximatelyEqual(graph?.geometry?.scaleX ?? 0, 73.636) && approximatelyEqual(graph?.geometry?.scaleY ?? 0, 36.818), 'expected sampled sine graph with Manim-style coordinate scaling.');
    assertGalleryCondition(label, movingDot?.type === 'circle' && approximatelyEqual(movingDot?.geometry?.r ?? 0, 5.4) && movingDot?.style?.fill === '#ff862f', 'expected orange moving Dot with Manim default radius.');
    assertGalleryCondition(label, cameraFrame?.geometry?.cameraFrame === true && cameraFrame?.type === 'rect' && approximatelyEqual(cameraFrame?.geometry?.w ?? 0, 960) && approximatelyEqual(cameraFrame?.geometry?.h ?? 0, 540), 'expected invisible MovingCamera frame mobject.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera', path: 'camera.target.x', from: 0, to: -331.364, t: 0, duration: 1, easing: 'easeInOut' }), 'expected initial camera pan to the graph start.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera', path: 'camera.target.y', from: 0, to: 165.682, t: 0, duration: 1, easing: 'easeInOut' }), 'expected initial camera pan y to the graph start.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'followCamera' && op.id === 'moving_dot' && op.frameId === 'camera_frame' && op.t === 1 && op.duration === 1), 'expected camera frame mobject to follow the moving dot during path animation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera', path: 'camera.scale', from: 1, to: 2, t: 0, duration: 1, easing: 'easeInOut' }), 'expected camera zoom-in animation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera_frame', path: 'transform.scale', from: 1, to: 0.5, t: 0, duration: 1, easing: 'easeInOut' }), 'expected camera frame mobject to scale down for zoom-in.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera', path: 'camera.target.x', from: 362.643, to: 0, t: 2, duration: 1, easing: 'easeInOut' }), 'expected camera restore from graph end x.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera', path: 'camera.scale', from: 2, to: 1, t: 2, duration: 1, easing: 'easeInOut' }), 'expected camera zoom restore.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'camera_frame', path: 'transform.scale', from: 0.5, to: 1, t: 2, duration: 1, easing: 'easeInOut' }), 'expected camera frame mobject scale restore.');

    const startDot = renderedNodeAt(documentData, 0, 'moving_dot');
    const zoomStart = visualSample(documentData, 1);
    const followMid = visualSample(documentData, 1.5);
    const followEnd = visualSample(documentData, 2);
    const restored = visualSample(documentData, 3);
    const midDot = flattenNodes(followMid.nodes).find((node) => node.id === 'moving_dot');
    const endDot = flattenNodes(followEnd.nodes).find((node) => node.id === 'moving_dot');
    const midFrame = flattenNodes(followMid.nodes).find((node) => node.id === 'camera_frame');
    assertGalleryCondition(label, approximatelyEqual(startDot?.transform?.x ?? 0, -331.364) && approximatelyEqual(startDot?.transform?.y ?? 0, 165.682), 'expected moving dot to remain at the graph start before MoveAlongPath begins.');
    assertGalleryCondition(label, approximatelyEqual(zoomStart.camera?.target?.x ?? 0, -331.364) && approximatelyEqual(zoomStart.camera?.target?.y ?? 0, 165.682) && approximatelyEqual(zoomStart.camera?.scale ?? 0, 2), 'expected camera to finish zooming into the graph start at 1s.');
    assertGalleryCondition(label, approximatelyEqual(midDot?.transform?.x ?? 0, 15.637475) && approximatelyEqual(midDot?.transform?.y ?? 0, 202.5), 'expected moving dot to follow the smooth sine path midpoint by arc length.');
    assertGalleryCondition(label, approximatelyEqual(followMid.camera?.target?.x ?? 0, midDot?.transform?.x ?? 0) && approximatelyEqual(followMid.camera?.target?.y ?? 0, midDot?.transform?.y ?? 0), 'expected camera target to match the moving dot while following.');
    assertGalleryCondition(label, approximatelyEqual(midFrame?.transform?.x ?? 0, midDot?.transform?.x ?? 0) && approximatelyEqual(midFrame?.transform?.y ?? 0, midDot?.transform?.y ?? 0), 'expected invisible camera frame mobject to match the moving dot while following.');
    assertGalleryCondition(label, approximatelyEqual(endDot?.transform?.x ?? 0, 362.63895) && approximatelyEqual(endDot?.transform?.y ?? 0, 165.682), 'expected moving dot to reach the graph end after MoveAlongPath.');
    assertGalleryCondition(label, approximatelyEqual(restored.camera?.target?.x ?? 1, 0) && approximatelyEqual(restored.camera?.target?.y ?? 1, 0) && approximatelyEqual(restored.camera?.scale ?? 0, 1), 'expected camera to restore to the original frame by 3s.');

    const initialSvg = svgSampleAt(documentData, 0);
    const midSvg = followMid.svg.source;
    assertGalleryCondition(label, /<g transform="translate\(480 270\) rotate\(0\) scale\(1\) translate\(0 0\)">/u.test(initialSvg), 'expected initial SVG camera transform to target the scene origin.');
    assertGalleryCondition(label, /id="moving_dot"[^>]*transform="translate\(-331\.364 165\.682\)"/u.test(initialSvg), 'expected initial SVG moving dot at the sine graph start.');
    assertGalleryCondition(label, /<g transform="translate\(480 270\) rotate\(0\) scale\(2\) translate\(-15\.63747[0-9]* -202\.49999[0-9]*\)">/u.test(midSvg), 'expected SVG camera transform to follow the dot at the path midpoint.');
    assertGalleryCondition(label, /id="moving_dot"[^>]*transform="translate\(15\.637475 202\.499998\)"/u.test(midSvg), 'expected SVG moving dot to serialize at the path midpoint.');
  }

  if (label.includes('point-with-trace')) {
    const tracedScene = findNode(documentData, 'traced_scene');
    const trace = findNode(documentData, 'trace');
    const dot = findNode(documentData, 'dot');
    assertGalleryCondition(label, tracedScene?.children?.map((child) => child.id).join(',') === 'trace,dot', 'expected official self.add(path,dot) z-order with dot above its trace.');
    assertGalleryCondition(label, dot?.type === 'circle' && approximatelyEqual(dot?.geometry?.r ?? 0, 5.4) && approximatelyEqual(dot?.style?.strokeWidth ?? -1, 0), 'expected default Dot radius and stroke width for traced point.');
    assertGalleryCondition(label, trace?.style?.stroke === '#FFFFFF' && approximatelyEqual(trace?.style?.strokeWidth ?? 0, 4), 'expected white VMobject trace stroke.');
    assertGalleryCondition(label, trace?.geometry?.tracedTarget === 'dot', 'expected trace to follow dot target history.');
    assertGalleryCondition(label, trace?.geometry?.traceSamples === 361 && trace?.geometry?.traceSampling === 'frame' && trace?.geometry?.traceStart === 0, 'expected frame-sampled trace history from scene start.');
    assertGalleryCondition(label, !documentData.timeline.some((op) => op.op === 'bindPath' && op.id === 'trace'), 'expected target tracedPath, not parametric bindPath fallback.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'animateValue' && String(op.id).startsWith('__rotating_dot') && approximatelyEqual(op.to, Math.PI) && op.t === 0 && op.duration === 2 && op.easing === 'linear'), 'expected Rotating(dot, PI, about=RIGHT) as linear value animation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'dot', path: 'transform.x', from: 135, to: 67.5, t: 4, duration: 1, easing: 'smooth' }), 'expected final left shift from the post-rotation point.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'dot', path: 'transform.y', from: 0, to: -67.5, t: 3, duration: 1, easing: 'smooth' }), 'expected upward shift after one-second hold.');
    const arcPeak = svgPathLastPoint(svgGroupPathData(svgSampleAt(documentData, 1), 'trace'));
    const halfTurn = svgPathLastPoint(svgGroupPathData(svgSampleAt(documentData, 2), 'trace'));
    const upShift = svgPathLastPoint(svgGroupPathData(svgSampleAt(documentData, 4), 'trace'));
    const leftShift = svgPathLastPoint(svgGroupPathData(svgSampleAt(documentData, 5), 'trace'));
    const finalPath = svgGroupPathData(svgSampleAt(documentData, 6), 'trace');
    const finalSvg = svgSampleAt(documentData, 6);
    const finalPoint = svgPathLastPoint(finalPath);
    const finalPoints = svgPathPoints(finalPath);
    assertGalleryCondition(label, arcPeak && approximatelyEqual(arcPeak.x, 67.5) && approximatelyEqual(arcPeak.y, 67.5) && arcPeak.count === 61, 'expected trace to reach the top of the half-rotation arc with 60fps history at 1s.');
    assertGalleryCondition(label, halfTurn && approximatelyEqual(halfTurn.x, 135) && approximatelyEqual(halfTurn.y, 0) && halfTurn.count === 121, 'expected trace to reach the right endpoint after the half rotation with frame history.');
    assertGalleryCondition(label, upShift && approximatelyEqual(upShift.x, 135) && approximatelyEqual(upShift.y, -67.5) && upShift.count === 241, 'expected trace to include the upward smooth shift with frame history.');
    assertGalleryCondition(label, leftShift && approximatelyEqual(leftShift.x, 67.5) && approximatelyEqual(leftShift.y, -67.5) && leftShift.count === 301, 'expected trace to include the final left smooth shift with frame history.');
    assertGalleryCondition(label, finalPoint && approximatelyEqual(finalPoint.x, 67.5) && approximatelyEqual(finalPoint.y, -67.5) && finalPoint.count === 361, 'expected final SVG trace to hold the last point with full 60fps history.');
    assertGalleryCondition(label, finalPath.startsWith('M 0 0 C ') && finalPoints.some((point) => approximatelyEqual(point.x, 135) && approximatelyEqual(point.y, 0)), 'expected final SVG trace to retain origin and post-rotation endpoint as a smooth path.');
    assertGalleryCondition(label, finalPoints.some((point) => approximatelyEqual(point.x, 135) && point.y < -67.3), 'expected final SVG trace to retain the vertical segment after rotation.');
    assertGalleryCondition(label, finalSvg.indexOf('id="trace"') < finalSvg.indexOf('id="dot"'), 'expected SVG trace to render below the dot like Manim self.add(path,dot).');
    assertGalleryCondition(label, /id="trace"[^>]*><path [^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/u.test(finalSvg), 'expected SVG trace to use round VMobject stroke caps and joins.');
  }

  if (label.includes('moving-dots')) {
    const connector = findNode(documentData, 'connector');
    const d1Half = renderedNodeAt(documentData, 0.5, 'd1');
    const d2Half = renderedNodeAt(documentData, 1.5, 'd2');
    const connectorXHalf = renderedNodeAt(documentData, 0.5, 'connector');
    const connectorYHalf = renderedNodeAt(documentData, 1.5, 'connector');
    const finalConnector = renderedNodeAt(documentData, 3, 'connector');
    assertGalleryCondition(label, connector?.geometry?.dynamicLine === true, 'expected dynamicLine connector between tracked dots.');
    assertGalleryCondition(label, ['d1', 'd2', 'connector'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected official self.add(d1,d2,l1) z-order with connector above both dots.');
    assertGalleryCondition(label, connector?.style?.stroke === '#FFFFFF' && approximatelyEqual(connector?.style?.strokeWidth ?? 0, 4), 'expected connector to copy Manim default Line style after become(Line(...)).');
    assertGalleryCondition(label, connector?.style?.strokeLinecap === 'round' && connector?.style?.strokeLinejoin === 'round', 'expected dynamicLine connector to use Manim-like round VMobject stroke caps and joins.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'd1' && op.path === 'transform.x'), 'expected d1 x updater binding.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'd2' && op.path === 'transform.y'), 'expected d2 y updater binding.');
    assertGalleryCondition(label, approximatelyEqual(d1Half?.transform?.x ?? 0, 168.75) && approximatelyEqual(connectorXHalf?.geometry?.x1 ?? 0, 168.75) && approximatelyEqual(connectorXHalf?.geometry?.x2 ?? 0, 39.15), 'expected midpoint x updater to move d1 and connector start together.');
    assertGalleryCondition(label, approximatelyEqual(d2Half?.transform?.y ?? 0, -135) && approximatelyEqual(connectorYHalf?.geometry?.x1 ?? 0, 337.5) && approximatelyEqual(connectorYHalf?.geometry?.y2 ?? 0, -135), 'expected midpoint y updater to move d2 and connector end together.');
    assertGalleryCondition(label, approximatelyEqual(finalConnector?.geometry?.x1 ?? 0, 337.5) && approximatelyEqual(finalConnector?.geometry?.y1 ?? 0, 0) && approximatelyEqual(finalConnector?.geometry?.x2 ?? 0, 39.15) && approximatelyEqual(finalConnector?.geometry?.y2 ?? 0, -270), 'expected final wait to hold the updater-derived connector endpoints.');
    const initialSvg = svgSampleAt(documentData, 0);
    const xMidSvg = svgSampleAt(documentData, 0.5);
    const xShiftSvg = svgSampleAt(documentData, 1);
    const yMidSvg = svgSampleAt(documentData, 1.5);
    const yShiftSvg = svgSampleAt(documentData, 2);
    assertGalleryCondition(label, /id="connector"[^>]*x1="0"[^>]*y1="0"[^>]*x2="39\.15"[^>]*y2="0"[^>]*stroke="#FFFFFF"/u.test(initialSvg), 'expected initial SVG connector between arranged dots with default white Line style.');
    assertGalleryCondition(label, initialSvg.indexOf('id="d1"') < initialSvg.indexOf('id="connector"') && initialSvg.indexOf('id="d2"') < initialSvg.indexOf('id="connector"'), 'expected SVG connector to render above both dots like Manim self.add(d1,d2,l1).');
    assertGalleryCondition(label, /id="connector"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/u.test(initialSvg), 'expected initial SVG connector to render with round caps and joins.');
    assertGalleryCondition(label, /id="d1"[^>]*transform="translate\(168\.75 0\)"/u.test(xMidSvg) && /id="connector"[^>]*x1="168\.75"[^>]*y1="0"[^>]*x2="39\.15"[^>]*y2="0"/u.test(xMidSvg), 'expected SVG midpoint to show d1 and connector following x tracker.');
    assertGalleryCondition(label, /id="connector"[^>]*x1="337\.5"[^>]*y1="0"[^>]*x2="39\.15"[^>]*y2="0"/u.test(xShiftSvg), 'expected SVG connector to follow d1.set_x after x ValueTracker animation.');
    assertGalleryCondition(label, /id="d2"[^>]*transform="translate\(39\.15 -135\)"/u.test(yMidSvg) && /id="connector"[^>]*x1="337\.5"[^>]*y1="0"[^>]*x2="39\.15"[^>]*y2="-135"/u.test(yMidSvg), 'expected SVG midpoint to show d2 and connector following y tracker.');
    assertGalleryCondition(label, /id="connector"[^>]*x1="337\.5"[^>]*y1="0"[^>]*x2="39\.15"[^>]*y2="-270"/u.test(yShiftSvg), 'expected SVG connector to follow d2.set_y after y ValueTracker animation.');
  }

  if (label.includes('moving-group-to-destination')) {
    const dots = findNode(documentData, 'dots');
    const dest = findNode(documentData, 'dest');
    const sourceDots = ['c1', 'c2', 'c3', 'c4'].map((id) => findNode(documentData, id));
    assertGalleryCondition(label, dots?.children?.length === 4, 'expected source VGroup with four dots.');
    assertGalleryCondition(label, dots.children.map((child) => child.id).join(',') === 'c1,c2,c3,c4', 'expected VGroup child order to match the official Dot(LEFT), Dot(ORIGIN), Dot(RIGHT), Dot(2*RIGHT) source order.');
    assertGalleryCondition(label, sourceDots.every((node) => approximatelyEqual(node?.geometry?.r ?? 0, 7.56)), 'expected source group dots scaled by 1.4 from Manim default Dot radius.');
    assertGalleryCondition(label, sourceDots.map((node) => node?.transform?.x).join(',') === '-108,-13.5,81,175.5', 'expected VGroup scale-about-center x positions.');
    assertGalleryCondition(label, findNode(documentData, 'c3')?.style?.fill === '#FC6255', 'expected third moving dot to be RED.');
    assertGalleryCondition(label, approximatelyEqual(dest?.geometry?.r ?? 0, 5.4) && dest.style?.fill === '#F7D96F', 'expected unscaled yellow destination dot.');
    assertGalleryCondition(label, documentData.nodes.findIndex((node) => node.id === 'dots') < documentData.nodes.findIndex((node) => node.id === 'dest'), 'expected official self.add(group, dest) z-order with destination above the moving group.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'dots', path: 'transform.x', from: 0, to: 189, t: 0, duration: 1, easing: 'smooth' }), 'expected group shift x toward destination.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'dots', path: 'transform.y', from: 0, to: -202.5, t: 0, duration: 1, easing: 'smooth' }), 'expected group shift y toward destination.');
    const midDots = renderedNodeAt(documentData, 0.5, 'dots');
    const finalDots = renderedNodeAt(documentData, 1.5, 'dots');
    const finalRedDot = finalDots?.children?.find((child) => child.id === 'c3');
    assertGalleryCondition(label, approximatelyEqual(midDots?.transform?.x ?? 0, 94.5) && approximatelyEqual(midDots?.transform?.y ?? 0, -101.25), 'expected group midpoint to follow the smooth shift halfway to the destination.');
    assertGalleryCondition(label, approximatelyEqual(finalDots?.transform?.x ?? 0, 189) && approximatelyEqual(finalDots?.transform?.y ?? 0, -202.5), 'expected final wait to hold the shifted dot group at the destination.');
    assertGalleryCondition(label, approximatelyEqual((finalDots?.transform?.x ?? 0) + (finalRedDot?.transform?.x ?? 0), dest?.transform?.x ?? 1) && approximatelyEqual((finalDots?.transform?.y ?? 0) + (finalRedDot?.transform?.y ?? 0), dest?.transform?.y ?? 1), 'expected shifted red dot center to overlap the destination dot.');
    const initialSvg = svgSampleAt(documentData, 0);
    const midSvg = svgSampleAt(documentData, 0.5);
    const finalSvg = svgSampleAt(documentData, 1);
    const holdSvg = svgSampleAt(documentData, 1.5);
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /<circle\b/gu) === 5, 'expected four source dots and one destination dot in SVG.');
    assertGalleryCondition(label, initialSvg.indexOf('id="dots"') < initialSvg.indexOf('id="dest"'), 'expected SVG destination dot to render above the moving group.');
    assertGalleryCondition(label, /id="c3"[^>]*r="7\.56"[^>]*transform="translate\(81 0\)"[^>]*fill="#FC6255"/u.test(initialSvg), 'expected initial SVG red source dot radius and position.');
    assertGalleryCondition(label, /id="dest"[^>]*r="5\.4"[^>]*transform="translate\(270 -202\.5\)"[^>]*fill="#F7D96F"/u.test(initialSvg), 'expected initial SVG destination dot radius and position.');
    assertGalleryCondition(label, /id="dots"[^>]*transform="translate\(94\.5 -101\.25\)"/u.test(midSvg) && /id="c3"[^>]*transform="translate\(81 0\)"/u.test(midSvg), 'expected SVG midpoint group shift to carry the red dot halfway toward destination.');
    assertGalleryCondition(label, /id="dots"[^>]*transform="translate\(189 -202\.5\)"/u.test(finalSvg), 'expected final SVG group shift.');
    assertGalleryCondition(label, /id="c3"[^>]*transform="translate\(81 0\)"/u.test(finalSvg) && /id="dest"[^>]*transform="translate\(270 -202\.5\)"/u.test(finalSvg), 'expected final SVG red dot to land on destination through nested group transform.');
    assertGalleryCondition(label, /id="dots"[^>]*transform="translate\(189 -202\.5\)"/u.test(holdSvg), 'expected final SVG wait to hold the shifted group.');
  }

  if (label.includes('rotation-updater')) {
    const reference = findNode(documentData, 'line_reference');
    const moving = findNode(documentData, 'line_moving');
    const rotations = documentData.timeline.filter((op) => op.op === 'animate' && op.id === 'line_moving' && op.path === 'transform.rotation');
    assertGalleryCondition(label, reference?.type === 'line' && reference.geometry?.x2 === -67.5 && reference.style?.stroke === '#FFFFFF', 'expected white reference Line(ORIGIN, LEFT).');
    assertGalleryCondition(label, moving?.type === 'line' && moving.geometry?.x2 === -67.5 && moving.style?.stroke === '#F7D96F', 'expected yellow moving line with Manim YELLOW.');
    assertGalleryCondition(label, rotations.length === 2, 'expected two rotateUpdater wait segments.');
    assertGalleryCondition(label, rotations.some((op) => approximatelyEqual(op.from, 0) && approximatelyEqual(op.to, 114.591559) && op.t === 0 && op.duration === 2 && op.easing === 'linear'), 'expected +1 rad/s rotation over first two seconds.');
    assertGalleryCondition(label, rotations.some((op) => approximatelyEqual(op.from, 114.591559) && approximatelyEqual(op.to, 0) && op.t === 2 && op.duration === 2 && op.easing === 'linear'), 'expected -1 rad/s rotation back to reference.');
    const forwardMid = renderedNodeAt(documentData, 1, 'line_moving');
    const forwardEnd = renderedNodeAt(documentData, 2, 'line_moving');
    const backwardMid = renderedNodeAt(documentData, 3, 'line_moving');
    const holdMoving = renderedNodeAt(documentData, 4.5, 'line_moving');
    const holdReference = renderedNodeAt(documentData, 4.5, 'line_reference');
    assertGalleryCondition(label, approximatelyEqual(forwardMid?.transform?.rotation ?? 0, 57.29578) && approximatelyEqual(forwardEnd?.transform?.rotation ?? 0, 114.591559), 'expected rendered rotation updater to accumulate one and two radians during the forward wait.');
    assertGalleryCondition(label, approximatelyEqual(backwardMid?.transform?.rotation ?? 0, 57.29578) && approximatelyEqual(holdMoving?.transform?.rotation ?? 1, 0), 'expected rendered rotation updater to unwind and hold at zero rotation.');
    assertGalleryCondition(label, holdMoving?.geometry?.x2 === holdReference?.geometry?.x2 && holdMoving?.transform?.rotation === holdReference?.transform?.rotation, 'expected final moving line to overlap the reference line after updater unwinds.');
    const startSvg = svgSampleAt(documentData, 0);
    const forwardMidSvg = svgSampleAt(documentData, 1);
    const forwardEndSvg = svgSampleAt(documentData, 2);
    const backwardMidSvg = svgSampleAt(documentData, 3);
    const restoredSvg = svgSampleAt(documentData, 4);
    const holdSvg = svgSampleAt(documentData, 4.5);
    assertGalleryCondition(label, countSvgOccurrences(startSvg, /<line\b/gu) === 2, 'expected exactly reference and moving lines in SVG.');
    assertGalleryCondition(label, /id="line_reference"[^>]*x2="-67\.5"[^>]*stroke="#FFFFFF"/u.test(startSvg), 'expected SVG reference line to stay horizontal.');
    assertGalleryCondition(label, /id="line_moving"[^>]*x2="-67\.5"[^>]*stroke="#F7D96F"/u.test(startSvg), 'expected SVG moving line starts overlapping reference.');
    assertGalleryCondition(label, /id="line_moving"[^>]*transform="rotate\(57\.29578\)"/u.test(forwardMidSvg), 'expected moving line to rotate by one radian at 1s.');
    assertGalleryCondition(label, /id="line_moving"[^>]*transform="rotate\(114\.591559\)"/u.test(forwardEndSvg), 'expected moving line to reach two radians at 2s.');
    assertGalleryCondition(label, /id="line_moving"[^>]*transform="rotate\(57\.29578\)"/u.test(backwardMidSvg), 'expected moving line to rotate back through one radian at 3s.');
    assertGalleryCondition(label, /id="line_moving"[^>]*x2="-67\.5"[^>]*stroke="#F7D96F"/u.test(restoredSvg) && !/id="line_moving"[^>]*transform=/u.test(restoredSvg), 'expected moving line to return to reference orientation at 4s.');
    assertGalleryCondition(label, /id="line_moving"[^>]*x2="-67\.5"[^>]*stroke="#F7D96F"/u.test(holdSvg) && !/id="line_moving"[^>]*transform=/u.test(holdSvg), 'expected final half-second wait to hold restored orientation.');
  }

  if (label.includes('orbital-dot') || label.includes('orbital_dot')) {
    const orbit = findNode(documentData, 'orbit');
    const dot = findNode(documentData, 'dot');
    const guide = findNode(documentData, 'guide');
    assertGalleryCondition(label, orbit?.type === 'circle' && approximatelyEqual(orbit.geometry?.r ?? 0, 67.5), 'expected one-unit orbit circle.');
    assertGalleryCondition(label, orbit?.style?.stroke === '#58C4DD' && (orbit.transform?.opacity ?? 1) === 1 && orbit.transform?.scale === 0, 'expected GrowFromCenter orbit to start at full opacity and zero scale.');
    assertGalleryCondition(label, dot?.type === 'circle' && approximatelyEqual(dot.geometry?.r ?? 0, 5.4), 'expected default moving dot.');
    assertGalleryCondition(label, guide?.type === 'line' && guide.geometry?.x1 === 202.5 && guide.geometry?.x2 === 337.5, 'expected offset guide line for Rotating phase.');
    assertGalleryCondition(label, ['dot', 'guide', 'orbit'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected source z-order: self.add(dot), self.add(line), then GrowFromCenter(circle).');
    assertGalleryCondition(label, !documentData.timeline.some((op) => op.op === 'animate' && op.id === 'orbit' && op.path === 'transform.opacity'), 'expected GrowFromCenter to avoid fade-in opacity animation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'orbit', path: 'transform.scale', from: 0, to: 1, t: 0, duration: 1, easing: 'smooth' }), 'expected orbit GrowFromCenter scale animation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'dot', path: 'transform.x', from: 0, to: 67.5, t: 1, duration: 1, easing: 'smooth' }), 'expected dot move to circle start.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'animateValue' && String(op.id).startsWith('__moveAlongPath_dot_orbit') && approximatelyEqual(op.to, Math.PI * 2) && op.t === 2 && op.duration === 2), 'expected MoveAlongPath around orbit.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'animateValue' && String(op.id).startsWith('__rotating_dot') && approximatelyEqual(op.to, Math.PI * 2) && op.t === 4 && op.duration === 1.5), 'expected Rotating phase about offset point.');
    const growMidOrbit = renderedNodeAt(documentData, 0.5, 'orbit');
    const shiftMidDot = renderedNodeAt(documentData, 1.5, 'dot');
    const orbitMidDot = renderedNodeAt(documentData, 3, 'dot');
    const rotatingMidDot = renderedNodeAt(documentData, 4.75, 'dot');
    const finalDot = renderedNodeAt(documentData, 6.5, 'dot');
    assertGalleryCondition(label, approximatelyEqual(growMidOrbit?.transform?.scale ?? 0, 0.5) && approximatelyEqual(growMidOrbit?.transform?.opacity ?? 0, 1), 'expected GrowFromCenter midpoint to scale the orbit without fading.');
    assertGalleryCondition(label, approximatelyEqual(shiftMidDot?.transform?.x ?? 0, 33.75) && approximatelyEqual(shiftMidDot?.transform?.y ?? 1, 0), 'expected dot transform midpoint to move halfway to the orbit start.');
    assertGalleryCondition(label, approximatelyEqual(orbitMidDot?.transform?.x ?? 0, -67.5) && approximatelyEqual(orbitMidDot?.transform?.y ?? 1, 0), 'expected MoveAlongPath midpoint to place the dot opposite the start of the orbit.');
    assertGalleryCondition(label, approximatelyEqual(rotatingMidDot?.transform?.x ?? 0, 202.5) && approximatelyEqual(rotatingMidDot?.transform?.y ?? 1, 0) && approximatelyEqual(rotatingMidDot?.transform?.rotation ?? 0, -180), 'expected Rotating midpoint around the offset point to move the dot to the far side.');
    assertGalleryCondition(label, approximatelyEqual(finalDot?.transform?.x ?? 0, 67.5) && approximatelyEqual(finalDot?.transform?.y ?? 1, 0) && approximatelyEqual(finalDot?.transform?.rotation ?? 0, -360), 'expected final wait to hold the completed offset rotation.');
    const growMidSvg = svgSampleAt(documentData, 0.5);
    const shiftMidSvg = svgSampleAt(documentData, 1.5);
    const orbitMidSvg = svgSampleAt(documentData, 3);
    const rotatingMidSvg = svgSampleAt(documentData, 4.75);
    const finalSvg = svgSampleAt(documentData, 6.5);
    assertGalleryCondition(label, growMidSvg.indexOf('id="dot"') < growMidSvg.indexOf('id="guide"') && growMidSvg.indexOf('id="guide"') < growMidSvg.indexOf('id="orbit"'), 'expected SVG grow frame to render the GrowFromCenter circle above the pre-added dot and line.');
    assertGalleryCondition(label, svgElementTag(growMidSvg, 'orbit').includes('scale(0.5 0.5)') && svgElementTag(growMidSvg, 'orbit').includes('opacity="1"'), 'expected SVG orbit midpoint to grow at full opacity.');
    assertGalleryCondition(label, svgElementTag(shiftMidSvg, 'dot').includes('transform="translate(33.75 0)'), 'expected SVG dot halfway to orbit start.');
    assertGalleryCondition(label, svgElementTag(orbitMidSvg, 'dot').includes('transform="translate(-67.5'), 'expected SVG dot opposite the orbit start halfway through MoveAlongPath.');
    assertGalleryCondition(label, svgElementTag(rotatingMidSvg, 'dot').includes('transform="translate(202.5') && svgElementTag(rotatingMidSvg, 'dot').includes('rotate(-180'), 'expected SVG dot halfway through offset Rotating phase.');
    assertGalleryCondition(label, svgElementTag(finalSvg, 'dot').includes('transform="translate(67.5') && svgElementTag(finalSvg, 'dot').includes('rotate(-360'), 'expected final SVG dot to hold completed offset rotation.');
  }

  if (label.includes('moving-angle')) {
    const angle = findNode(documentData, 'a');
    const movingLine = findNode(documentData, 'line_moving');
    const thetaLabel = findNode(documentData, 'tex');
    assertGalleryCondition(label, movingLine?.geometry?.rotationAngle === '-theta', 'expected rotatingLine helper for line_moving updater.');
    assertGalleryCondition(label, angle?.geometry?.angle === true, 'expected Angle helper geometry.');
    assertGalleryCondition(label, approximatelyEqual(angle?.geometry?.radius ?? 0, 33.75) && angle?.transform?.x === -67.5, 'expected Angle radius=0.5 around LEFT rotation center.');
    assertGalleryCondition(label, thetaLabel?.type === 'math' && thetaLabel.latex === '\\\\theta' && thetaLabel.geometry?.fontSize === 48, 'expected theta MathTex label.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'tex' && op.path === 'transform.x'), 'expected theta label x binding.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'tex' && op.path === 'transform.y'), 'expected theta label y binding.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animateValue' && op.id === 'theta').map((op) => `${op.t}:${op.to.toFixed(6)}`).join(',') === '1:0.698132,2:3.141593,3.5:6.108652', 'expected official theta keyframes 110deg -> 40deg -> 180deg -> 350deg.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'tex', path: 'style.fill', from: '#FFFFFF', to: '#FF0000', t: 3, duration: 0.5 }), 'expected theta label color animation to RED over 0.5s.');

    const initialLine = renderedNodeAt(documentData, 0, 'line_moving');
    const narrowLine = renderedNodeAt(documentData, 2, 'line_moving');
    const straightLine = renderedNodeAt(documentData, 3, 'line_moving');
    const finalLine = renderedNodeAt(documentData, 4.5, 'line_moving');
    const initialLabel = renderedNodeAt(documentData, 0, 'tex');
    const narrowLabel = renderedNodeAt(documentData, 2, 'tex');
    const straightLabel = renderedNodeAt(documentData, 3, 'tex');
    const tintLabel = renderedNodeAt(documentData, 3.25, 'tex');
    const redLabel = renderedNodeAt(documentData, 3.5, 'tex');
    const finalLabel = renderedNodeAt(documentData, 4.5, 'tex');
    assertGalleryCondition(label, approximatelyEqual(initialLine?.geometry?.x2 ?? 0, -113.672719) && approximatelyEqual(initialLine?.geometry?.y2 ?? 0, -126.858504), 'expected initial line rotated to 110 degrees about LEFT.');
    assertGalleryCondition(label, approximatelyEqual(narrowLine?.geometry?.x2 ?? 0, 35.916) && approximatelyEqual(narrowLine?.geometry?.y2 ?? 0, -86.776327), 'expected moving line at 40 degrees after first tracker animation.');
    assertGalleryCondition(label, approximatelyEqual(straightLine?.geometry?.x2 ?? 0, -202.5) && approximatelyEqual(straightLine?.geometry?.y2 ?? 0, 0), 'expected moving line to point left at 180 degrees.');
    assertGalleryCondition(label, approximatelyEqual(finalLine?.geometry?.x2 ?? 0, 65.449047) && approximatelyEqual(finalLine?.geometry?.y2 ?? 0, 23.442504), 'expected final moving line at 350 degrees.');
    assertGalleryCondition(label, approximatelyEqual(initialLabel?.transform?.x ?? 0, -36.526872) && approximatelyEqual(initialLabel?.transform?.y ?? 0, -44.23421), 'expected theta label on the initial 110-degree angle bisector.');
    assertGalleryCondition(label, approximatelyEqual(narrowLabel?.transform?.x ?? 0, -16.756598) && approximatelyEqual(narrowLabel?.transform?.y ?? 0, -18.469088), 'expected theta label to follow the 40-degree angle bisector.');
    assertGalleryCondition(label, approximatelyEqual(straightLabel?.transform?.x ?? 0, -67.5) && approximatelyEqual(straightLabel?.transform?.y ?? 0, -54), 'expected theta label at radius 0.8 on the 180-degree angle bisector.');
    assertGalleryCondition(label, tintLabel?.style?.fill === 'rgb(255, 128, 128)' && ['rgb(255, 0, 0)', '#FF0000'].includes(String(redLabel?.style?.fill)), 'expected halfway and final red label colors during set_color animation.');
    assertGalleryCondition(label, approximatelyEqual(finalLabel?.transform?.x ?? 0, -121.294514) && approximatelyEqual(finalLabel?.transform?.y ?? 0, -4.70641), 'expected final theta label on the large-angle bisector.');

    const narrowArcEnd = svgPathLastPoint(svgGroupPathData(svgSampleAt(documentData, 2), 'a'));
    const straightArc = svgGroupPathData(svgSampleAt(documentData, 3), 'a');
    const finalArcSvg = svgSampleAt(documentData, 4.5);
    const finalArcEnd = svgPathLastPoint(svgGroupPathData(finalArcSvg, 'a'));
    assertGalleryCondition(label, narrowArcEnd?.count === 2 && approximatelyEqual(narrowArcEnd.x, 25.854) && approximatelyEqual(narrowArcEnd.y, -21.694082), 'expected 40-degree SVG angle arc endpoint.');
    assertGalleryCondition(label, straightArc.startsWith('M 33.75 0 C ') && straightArc.endsWith(' -33.75 1.3844481424784853e-8'), 'expected smooth 180-degree SVG angle arc from right to left.');
    assertGalleryCondition(label, finalArcEnd?.count === 5 && approximatelyEqual(finalArcEnd.x, 33.237262) && approximatelyEqual(finalArcEnd.y, 5.860626), 'expected final 350-degree SVG angle arc endpoint.');
    assertGalleryCondition(label, /id="a"[^>]*><path [^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/u.test(finalArcSvg), 'expected SVG angle arc to use round VMobject stroke caps and joins.');
  }

  if (label.includes('moving-frame-box') || label.includes('moving_frame_box')) {
    const productRule = findNode(documentData, 'productRule');
    const frameA = findNode(documentData, 'frameA');
    const frameB = findNode(documentData, 'frameB');
    const termAFrameTarget = findNode(documentData, 'termAFrameTarget');
    const termBFrameTarget = findNode(documentData, 'termBFrameTarget');
    assertGalleryCondition(label, productRule?.children?.length === 4, 'expected product rule split into four MathTex terms.');
    assertGalleryCondition(label, ['lhs', 'termA', 'plus', 'termB'].every((id) => findNode(documentData, id)?.type === 'math'), 'expected MathTex term nodes.');
    assertGalleryCondition(label, frameA?.geometry?.shapeMatcher === 'surroundingRect' && frameB?.geometry?.shapeMatcher === 'surroundingRect', 'expected SurroundingRectangle frame targets.');
    assertGalleryCondition(label, termAFrameTarget?.geometry?.w === 166 && termAFrameTarget?.geometry?.h === 76 && termBFrameTarget?.geometry?.w === 166 && termBFrameTarget?.geometry?.h === 76, 'expected declared MathTex part bounds for text[1] and text[3].');
    assertGalleryCondition(label, frameA?.geometry?.w === 180 && frameA?.geometry?.h === 90 && frameB?.geometry?.w === 180 && frameB?.geometry?.h === 90, 'expected SurroundingRectangle dimensions with buff=.1 converted to 7px each side.');
    assertGalleryCondition(label, frameA?.transform?.x === 12 && frameB?.transform?.x === 236, 'expected frame targets centered on official product rule terms.');
    assertGalleryCondition(label, frameA?.style?.stroke === '#ffff00' && frameB?.style?.stroke === '#ffff00', 'expected yellow moving frames.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'productRule' && op.effect === 'write' && op.duration === 2), 'expected Write(productRule) over two seconds.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frameA', path: 'geometry.drawProgress', from: 0, to: 1, t: 2, duration: 1, easing: 'smooth' }), 'expected Create frame around first term.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'frameA', path: 'transform.x', from: 12, to: 236, t: 4, duration: 1, easing: 'smooth' }), 'expected ReplacementTransform frame movement to second term.');
    assertGalleryCondition(label, !documentData.timeline.some((op) => op.op === 'animate' && op.id === 'frameA' && op.path === 'transform.opacity' && op.t === 4 && op.from === 0), 'expected replacement source frame to stay visible when moving to the second term.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'delete' && op.id === 'frameA' && op.t === 5), 'expected source frame deletion after replacement.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'create' && op.node.id === 'frameB' && op.t === 5 && op.node.transform.opacity === 1), 'expected final frameB materialized at the end of ReplacementTransform.');

    const writingSample = visualSample(documentData, 1);
    const earlyWritingSample = visualSample(documentData, 0.5);
    const lateWritingSample = visualSample(documentData, 1.5);
    const completeWritingSample = visualSample(documentData, 2);
    const earlyLhs = findRenderedNode(earlyWritingSample, 'lhs');
    const earlyTermA = findRenderedNode(earlyWritingSample, 'termA');
    const lateTermB = findRenderedNode(lateWritingSample, 'termB');
    const completeTerms = ['lhs', 'termA', 'plus', 'termB'].map((id) => findRenderedNode(completeWritingSample, id));
    const writingTermA = findRenderedNode(writingSample, 'termA');
    const writingPlus = findRenderedNode(writingSample, 'plus');
    const createStartFrame = renderedNodeAt(documentData, 2, 'frameA');
    const createMidFrame = renderedNodeAt(documentData, 2.5, 'frameA');
    const createEndFrame = renderedNodeAt(documentData, 3, 'frameA');
    const replacementStartFrame = renderedNodeAt(documentData, 4, 'frameA');
    const replacementMidFrame = renderedNodeAt(documentData, 4.5, 'frameA');
    const replacementEndFrame = renderedNodeAt(documentData, 5, 'frameB');
    assertGalleryCondition(label, approximatelyEqual(earlyLhs?.geometry?.writeProgress ?? 0, 0.61441) && earlyTermA?.geometry?.writeProgress === 0, 'expected early Write(productRule) to still be revealing the left-hand side.');
    assertGalleryCondition(label, approximatelyEqual(writingTermA?.geometry?.writeProgress ?? 0, 0.508263) && writingPlus?.geometry?.writeProgress === 0, 'expected Write(productRule) to reveal terms in width-paced order.');
    assertGalleryCondition(label, writingPlus?.transform?.x === 124 && approximatelyEqual(lateTermB?.geometry?.writeProgress ?? 0, 0.331386), 'expected late Write(productRule) to reach the final product term after the plus sign.');
    assertGalleryCondition(label, completeTerms.every((node) => node?.geometry?.writeProgress === 1) && completeTerms.map((node) => node?.transform?.x).join(',') === '-185,15,124,236', 'expected product rule terms fully written at official positions before frame creation.');
    assertGalleryCondition(label, createStartFrame?.transform?.opacity === 1 && createStartFrame?.geometry?.drawProgress === 0, 'expected frameA visible but undrawn at Create start.');
    assertGalleryCondition(label, createMidFrame?.transform?.opacity === 1 && createMidFrame?.geometry?.drawProgress === 0.5, 'expected frameA half drawn at Create midpoint.');
    assertGalleryCondition(label, createEndFrame?.transform?.opacity === 1 && createEndFrame?.geometry?.drawProgress === 1, 'expected frameA fully drawn after Create.');
    assertGalleryCondition(label, replacementStartFrame?.transform?.opacity === 1 && replacementStartFrame?.transform?.x === 12, 'expected replacement to start with visible frameA on first term.');
    assertGalleryCondition(label, replacementMidFrame?.transform?.opacity === 1 && replacementMidFrame?.transform?.x === 124, 'expected replacement midpoint centered between the two highlighted terms.');
    assertGalleryCondition(label, replacementEndFrame?.transform?.opacity === 1 && replacementEndFrame?.transform?.x === 236, 'expected replacement to finish as frameB on second term.');

    const createStartSvg = svgSampleAt(documentData, 2);
    const createMidSvg = svgSampleAt(documentData, 2.5);
    const replacementMidSvg = svgSampleAt(documentData, 4.5);
    const finalSvg = svgSampleAt(documentData, 5);
    assertGalleryCondition(label, /id="frameA"[^>]*width="180"[^>]*height="90"[^>]*transform="translate\(12 0\)"[^>]*stroke="#ffff00"[^>]*stroke-dashoffset="1"/u.test(createStartSvg), 'expected SVG frameA to start undrawn around first term.');
    assertGalleryCondition(label, /id="frameA"[^>]*width="180"[^>]*height="90"[^>]*transform="translate\(12 0\)"[^>]*stroke-dashoffset="0\.5"/u.test(createMidSvg), 'expected SVG frameA half draw progress.');
    assertGalleryCondition(label, /id="frameA"[^>]*width="180"[^>]*height="90"[^>]*transform="translate\(124 0\)"[^>]*opacity="1"[^>]*stroke-dashoffset="0"/u.test(replacementMidSvg), 'expected SVG frameA to stay visible while sliding between terms.');
    assertGalleryCondition(label, /id="frameB"[^>]*width="180"[^>]*height="90"[^>]*transform="translate\(236 0\)"[^>]*opacity="1"/u.test(finalSvg) && !finalSvg.includes('id="frameA"'), 'expected final SVG to contain only frameB around second term.');
  }

  if (label.includes('polygon-on-axes')) {
    const axes = findNode(documentData, 'ax');
    const graph = findNode(documentData, 'graph');
    const area = findNode(documentData, 'area');
    const dot = findNode(documentData, 'dot');
    assertGalleryCondition(label, axes?.geometry?.width === 405 && axes.geometry?.height === 405 && axes.geometry?.originX === -202.5 && axes.geometry?.originY === 202.5, 'expected square Axes(x_length=6, y_length=6).');
    assertGalleryCondition(label, graph?.type === 'path' && graph.style?.stroke === '#F4D345' && graph.metadata?.plot?.samples === 220, 'expected unsmoothed 25/x graph in Manim YELLOW_D.');
    assertGalleryCondition(label, area?.geometry?.dataRect === true, 'expected dataRect area tied to axes coordinates.');
    assertGalleryCondition(label, dot?.geometry?.dataDot === true, 'expected dataDot tied to axes coordinates.');
    assertGalleryCondition(label, area?.style?.fill === '#58C4DD' && approximatelyEqual(area.style?.fillOpacity ?? 0, 0.5) && area.style?.stroke === '#FFEA94', 'expected BLUE rectangle fill and YELLOW_B stroke.');
    assertGalleryCondition(label, dot?.geometry?.point === 't,25/t' && approximatelyEqual(dot.geometry?.r ?? 0, 5.4) && approximatelyEqual(dot.style?.strokeWidth ?? -1, 0), 'expected default Dot tracking k/t on the axes.');
    assertGalleryCondition(label, ['ax', 'graph', 'area', 'dot'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected polygon scene z-order to keep the created area above the graph and below the z-indexed dot.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'area'), 'expected area updater bindings.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindExpr' && op.id === 'dot'), 'expected dot updater bindings.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animateValue' && op.id === 't').map((op) => op.to).join(',') === '10,2.5,5', 'expected official ValueTracker keyframes 5 -> 10 -> k/10 -> 5.');
    const growArea = renderedNodeAt(documentData, 1.5, 'area');
    const growDot = renderedNodeAt(documentData, 1.5, 'dot');
    const shrinkArea = renderedNodeAt(documentData, 2.5, 'area');
    const shrinkDot = renderedNodeAt(documentData, 2.5, 'dot');
    const returnArea = renderedNodeAt(documentData, 3.5, 'area');
    const returnDot = renderedNodeAt(documentData, 3.5, 'dot');
    assertGalleryCondition(label, approximatelyEqual(growArea?.geometry?.w ?? 0, 303.75) && approximatelyEqual(growArea?.geometry?.h ?? 0, 135) && approximatelyEqual(growArea?.transform?.x ?? 0, -50.625) && approximatelyEqual(growDot?.transform?.x ?? 0, 101.25) && approximatelyEqual(growDot?.transform?.y ?? 0, 67.5), 'expected midpoint while t grows to place the rectangle and dot on 25/x.');
    assertGalleryCondition(label, approximatelyEqual(shrinkArea?.geometry?.w ?? 0, 253.125) && approximatelyEqual(shrinkArea?.geometry?.h ?? 0, 162) && approximatelyEqual(shrinkArea?.transform?.x ?? 0, -75.9375) && approximatelyEqual(shrinkDot?.transform?.x ?? 0, 50.625) && approximatelyEqual(shrinkDot?.transform?.y ?? 0, 40.5), 'expected midpoint while t shrinks to keep area and dot bound to axes coordinates.');
    assertGalleryCondition(label, approximatelyEqual(returnArea?.geometry?.w ?? 0, 151.875) && approximatelyEqual(returnArea?.geometry?.h ?? 0, 270) && approximatelyEqual(returnArea?.transform?.x ?? 0, -126.5625) && approximatelyEqual(returnDot?.transform?.x ?? 0, -50.625) && approximatelyEqual(returnDot?.transform?.y ?? 0, -67.5), 'expected midpoint while t returns to keep k/t geometry synchronized.');
    const createSvg = svgSampleAt(documentData, 0);
    const initialSvg = svgSampleAt(documentData, 1);
    const wideSvg = svgSampleAt(documentData, 2);
    const tallSvg = svgSampleAt(documentData, 3);
    const finalSvg = svgSampleAt(documentData, 4);
    assertGalleryCondition(label, countSvgOccurrences(initialSvg, /id="ax:[xy]_tick:/gu) === 22, 'expected x/y ticks from 0 through 10.');
    assertGalleryCondition(label, initialSvg.indexOf('id="graph"') < initialSvg.indexOf('id="area"') && initialSvg.indexOf('id="area"') < initialSvg.indexOf('id="dot"'), 'expected SVG order to render polygon above the reciprocal graph but below dot.set_z_index(10).');
    assertGalleryCondition(label, svgGroupPathData(initialSvg, 'graph').startsWith('M 101.25 -405 C') && svgGroupPathData(initialSvg, 'graph').endsWith('405 -101.25') && initialSvg.includes('stroke="#F4D345"'), 'expected SVG reciprocal graph to span x=2.5..10 in Manim YELLOW_D.');
    assertGalleryCondition(label, /id="area"[^>]*width="202\.5"[^>]*height="202\.5"[^>]*transform="translate\(-101\.25 101\.25\)"[^>]*fill-opacity="0"[^>]*stroke-dashoffset="1"/u.test(createSvg), 'expected Create(area) to start with hidden fill and undrawn stroke.');
    assertGalleryCondition(label, /id="area"[^>]*width="202\.5"[^>]*height="202\.5"[^>]*transform="translate\(-101\.25 101\.25\)"[^>]*fill-opacity="0\.5"[^>]*stroke-dashoffset="0"/u.test(initialSvg), 'expected initial 5 by 5 rectangle after Create.');
    assertGalleryCondition(label, /id="dot"[^>]*r="5\.4"[^>]*fill="#FFFFFF"/u.test(initialSvg), 'expected initial dot at graph point (5, 5).');
    assertGalleryCondition(label, /id="area"[^>]*width="405"[^>]*height="101\.25"[^>]*transform="translate\(0 151\.875\)"/u.test(wideSvg), 'expected wide rectangle at t=10.');
    assertGalleryCondition(label, /id="dot"[^>]*transform="translate\(202\.5 101\.25\)"/u.test(wideSvg), 'expected dot at graph point (10, 2.5).');
    assertGalleryCondition(label, /id="area"[^>]*width="101\.25"[^>]*height="405"[^>]*transform="translate\(-151\.875 0\)"/u.test(tallSvg), 'expected tall rectangle at t=k/10.');
    assertGalleryCondition(label, /id="dot"[^>]*transform="translate\(-101\.25 -202\.5\)"/u.test(tallSvg), 'expected dot at graph point (2.5, 10).');
    assertGalleryCondition(label, /id="area"[^>]*width="202\.5"[^>]*height="202\.5"[^>]*transform="translate\(-101\.25 101\.25\)"/u.test(finalSvg) && /id="dot"[^>]*r="5\.4"[^>]*fill="#FFFFFF"/u.test(finalSvg), 'expected final rectangle and dot to return to t=5.');
  }

  if (label.includes('sine-curve-unit-circle')) {
    const unit = findNode(documentData, 'unit');
    const sineCurve = findNode(documentData, 'sine_curve');
    const dot = findNode(documentData, 'dot');
    const originToCircle = findNode(documentData, 'origin_to_circle');
    const dotToCurve = findNode(documentData, 'dot_to_curve');
    assertGalleryCondition(label, unit?.type === 'circle' && approximatelyEqual(unit.geometry?.r ?? 0, 67.5) && unit.transform?.x === -270, 'expected unit circle at left axis origin.');
    assertGalleryCondition(label, sineCurve?.geometry?.tracedPath === true && sineCurve.style?.stroke === '#F4D345', 'expected traced sine curve path.');
    assertGalleryCondition(label, dot?.geometry?.r === 5.4 && dot.style?.fill === '#F7D96F' && approximatelyEqual(dot.style?.strokeWidth ?? -1, 0), 'expected yellow moving Dot with Manim default stroke width.');
    assertGalleryCondition(label, ['dot', 'unit', 'origin_to_circle', 'dot_to_curve', 'sine_curve'].every((id, index, ids) => index === 0 || documentData.nodes.findIndex((node) => node.id === ids[index - 1]) < documentData.nodes.findIndex((node) => node.id === id)), 'expected official self.add(dot) then self.add(orbit, radius line, projection line, curve) z-order.');
    assertGalleryCondition(label, originToCircle?.style?.stroke === '#58C4DD' && dotToCurve?.style?.stroke === '#FFF1B6', 'expected blue radius line and pale vertical projection line.');
    assertGalleryCondition(label, ['pi_label', 'two_pi_label', 'three_pi_label', 'four_pi_label'].every((id) => findNode(documentData, id)?.type === 'math'), 'expected pi labels along sine axis.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'bindPath' && op.id === 'sine_curve' && op.samples === 320 && op.tMaxExpr === 'theta'), 'expected sine curve path bound to theta.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'bindExpr' && ['dot', 'origin_to_circle', 'dot_to_curve'].includes(op.id)).length === 8, 'expected moving dot and projection bindings.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'animateValue' && op.id === 'theta' && approximatelyEqual(op.to, 13.351768778) && op.duration === 8.5 && op.easing === 'linear'), 'expected theta sweep over 4.25pi.');
    assertGalleryCondition(label, findNode(documentData, 'x_axis')?.geometry?.x1 === -405 && findNode(documentData, 'x_axis')?.geometry?.x2 === 405, 'expected x axis from -6 to 6 Manim units.');
    assertGalleryCondition(label, findNode(documentData, 'y_axis')?.transform?.x === -270 && findNode(documentData, 'y_axis')?.geometry?.y1 === -135 && findNode(documentData, 'y_axis')?.geometry?.y2 === 135, 'expected y axis at x=-4 with height 4 Manim units.');
    assertGalleryCondition(label, findNode(documentData, 'pi_label')?.transform?.x === -67.5 && findNode(documentData, 'four_pi_label')?.transform?.x === 337.5, 'expected pi labels at -1, 1, 3, and 5 Manim x positions.');
    assertGalleryCondition(label, ['pi_label', 'two_pi_label', 'three_pi_label', 'four_pi_label'].every((id) => findNode(documentData, id)?.transform?.y === 42), 'expected MathTex labels below the axis via next_to(..., DOWN).');

    const halfTurnDot = renderedNodeAt(documentData, 2, 'dot');
    const halfTurnRadius = renderedNodeAt(documentData, 2, 'origin_to_circle');
    const halfTurnProjection = renderedNodeAt(documentData, 2, 'dot_to_curve');
    assertGalleryCondition(label, approximatelyEqual(halfTurnDot?.transform?.x ?? 0, -337.5) && approximatelyEqual(halfTurnDot?.transform?.y ?? 0, 0), 'expected moving dot at left edge after 2s half-turn.');
    assertGalleryCondition(label, approximatelyEqual(halfTurnRadius?.geometry?.x2 ?? 0, -67.5) && approximatelyEqual(halfTurnRadius?.geometry?.y2 ?? 0, 0), 'expected blue radius line to point left at half-turn.');
    assertGalleryCondition(label, approximatelyEqual(halfTurnProjection?.geometry?.x1 ?? 0, -337.5) && approximatelyEqual(halfTurnProjection?.geometry?.x2 ?? 0, -67.5), 'expected yellow projection line from circle dot to sine trace at half-turn.');

    const fullTurnDot = renderedNodeAt(documentData, 4, 'dot');
    const oneAndHalfTurnDot = renderedNodeAt(documentData, 6, 'dot');
    assertGalleryCondition(label, approximatelyEqual(fullTurnDot?.transform?.x ?? 0, -202.5) && approximatelyEqual(fullTurnDot?.transform?.y ?? 0, 0), 'expected dot back at the circle start after 4s full turn.');
    assertGalleryCondition(label, approximatelyEqual(oneAndHalfTurnDot?.transform?.x ?? 0, -337.5) && approximatelyEqual(oneAndHalfTurnDot?.transform?.y ?? 0, 0), 'expected dot at left edge again after 6s one-and-a-half turns.');

    const finalDot = renderedNodeAt(documentData, 8.5, 'dot');
    const finalRadius = renderedNodeAt(documentData, 8.5, 'origin_to_circle');
    const finalProjection = renderedNodeAt(documentData, 8.5, 'dot_to_curve');
    const finalTrace = renderedNodeAt(documentData, 8.5, 'sine_curve');
    const finalTraceEnd = svgPathLastPoint(finalTrace?.geometry?.d ?? '');
    assertGalleryCondition(label, approximatelyEqual(finalDot?.transform?.x ?? 0, -222.270292) && approximatelyEqual(finalDot?.transform?.y ?? 0, -47.729708), 'expected final dot at 4.25pi around the unit circle.');
    assertGalleryCondition(label, approximatelyEqual(finalRadius?.geometry?.x2 ?? 0, 47.729708) && approximatelyEqual(finalRadius?.geometry?.y2 ?? 0, -47.729708), 'expected final radius line at 45 degrees.');
    assertGalleryCondition(label, approximatelyEqual(finalProjection?.geometry?.x2 ?? 0, 371.25) && approximatelyEqual(finalProjection?.geometry?.y2 ?? 0, -47.729708), 'expected final projection line to end at curve_start + t_offset*4.');
    assertGalleryCondition(label, finalTraceEnd?.count === 22 && approximatelyEqual(finalTraceEnd.x, 371.25) && approximatelyEqual(finalTraceEnd.y, -47.729708), 'expected final sine trace to end at the same 4.25pi projection point.');

    const halfTurnSvg = svgSampleAt(documentData, 2);
    const finalSvg = svgSampleAt(documentData, 8.5);
    const finalSvgTracePath = svgGroupPathData(finalSvg, 'sine_curve');
    assertGalleryCondition(label, /id="dot"[^>]*r="5\.4"[^>]*transform="translate\(-337\.5 0\)"[^>]*fill="#F7D96F"/u.test(halfTurnSvg), 'expected half-turn SVG dot at the left edge of the circle.');
    assertGalleryCondition(label, /id="origin_to_circle"[^>]*x2="-67\.5"[^>]*y2="0"[^>]*stroke="#58C4DD"/u.test(halfTurnSvg), 'expected half-turn SVG blue radius line.');
    assertGalleryCondition(label, /id="dot_to_curve"[^>]*x1="-222\.270292"[^>]*y1="-47\.729708"[^>]*x2="371\.25"[^>]*y2="-47\.729708"[^>]*stroke="#FFF1B6"/u.test(finalSvg), 'expected final SVG projection line to the sine trace.');
    assertGalleryCondition(label, finalSvgTracePath.startsWith('M -202.5 0 C ') && finalSvgTracePath.endsWith(' 371.2500000104585 -47.72970774170837'), 'expected final smooth SVG sine trace path from curve_start to the 4.25pi endpoint.');
    assertGalleryCondition(label, finalSvg.indexOf('id="dot"') < finalSvg.indexOf('id="unit"') && finalSvg.indexOf('id="dot"') < finalSvg.indexOf('id="sine_curve"'), 'expected SVG dot to render below orbit and sine curve like the official add order.');
    assertGalleryCondition(label, /id="sine_curve"[^>]*><path [^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/u.test(finalSvg), 'expected final sine trace to use round VMobject stroke caps and joins.');
  }

  if (label.includes('transform_matching_tex') || label.includes('transform-matching-tex')) {
    const sourceGroup = findNode(documentData, 'eq1WithVariables');
    const variables = findNode(documentData, 'variables');
    const varA = findNode(documentData, 'varA');
    const varB = findNode(documentData, 'varB');
    const varC = findNode(documentData, 'varC');
    const eq1 = findNode(documentData, 'eq1');
    const eq2 = findNode(documentData, 'eq2');
    const eq3 = findNode(documentData, 'eq3');
    assertGalleryCondition(label, sourceGroup?.children?.map((child) => child.id).join(',') === 'eq1,variables', 'expected TransformMatchingTex source group to contain eq1 and the variables row.');
    assertGalleryCondition(label, variables?.children?.map((child) => child.id).join(',') === 'varA,varB,varC' && approximatelyEqual(variables.transform?.y ?? 0, -67.5), 'expected arranged variable row shifted one Manim unit below the equation.');
    assertGalleryCondition(label, approximatelyEqual(varA?.transform?.x ?? 0, -42) && approximatelyEqual(varB?.transform?.x ?? 1, 0) && approximatelyEqual(varC?.transform?.x ?? 0, 42), 'expected a/b/c variable row spacing before matching.');
    assertGalleryCondition(label, [varA, varB, varC].every((node) => node?.geometry?.fontSize === 48 && node.style?.fill === '#ffffff'), 'expected variable MathTex nodes to use default white 48px styling.');
    assertGalleryCondition(label, eq1?.children?.length > 0 && eq2?.children?.length > 0 && eq3?.children?.length > 0, 'expected expanded MathTex token children.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'effect' && op.effect === 'transform').length >= 4, 'expected token transform effects from TransformMatchingTex expansion.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'effect' && (op.effect === 'fadeIn' || op.effect === 'fadeOut')).length >= 5, 'expected token fade effects for unmatched TransformMatchingTex parts.');
    assertGalleryCondition(label, documentData.timeline.filter((op) => op.op === 'animate' && op.path?.startsWith('transform.')).length >= 10, 'expected token transform animations.');
    assertGalleryCondition(label, eq1?.children?.map((child) => child.latex).join(' ') === 'x ^2 + y ^2 = z ^2', 'expected double-braced source equation tokens.');
    assertGalleryCondition(label, eq2?.children?.map((child) => child.latex).join(' ') === 'a ^2 + b ^2 = c ^2', 'expected double-braced first target equation tokens.');
    assertGalleryCondition(label, eq3?.children?.map((child) => child.latex).join(' ') === 'a ^2 = c ^2 - b ^2', 'expected double-braced rearranged equation tokens.');
    assertGalleryCondition(label, ['varA', 'varB', 'varC'].every((id) => documentData.timeline.some((op) => op.op === 'effect' && op.id === id && op.effect === 'transform' && op.t === 0.5 && op.duration === 1)), 'expected top variables to transform into matching equation variables.');
    assertGalleryCondition(label, !['varA', 'varB', 'varC'].some((id) => documentData.timeline.some((op) => op.op === 'effect' && op.id === id && op.effect === 'fadeOut')), 'expected top variables not to fade out when matching target variables exist.');
    assertGalleryCondition(label, ['eq1:tex:0', 'eq1:tex:3', 'eq1:tex:6'].every((id) => documentData.timeline.some((op) => op.op === 'effect' && op.id === id && op.effect === 'fadeOut' && op.t === 0.5)), 'expected x/y/z source variables to fade out.');
    assertGalleryCondition(label, ['eq1:tex:1', 'eq1:tex:2', 'eq1:tex:4', 'eq1:tex:5', 'eq1:tex:7'].every((id) => documentData.timeline.some((op) => op.op === 'effect' && op.id === id && op.effect === 'transform' && op.t === 0.5)), 'expected powers and operators to transform on the first matching pass.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'varA', path: 'transform.x', from: -42, to: -183.6, t: 0.5, duration: 1, easing: 'easeInOut' }), 'expected a variable to move into the first equation slot.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'varA', path: 'transform.y', from: 0, to: 67.5, t: 0.5, duration: 1, easing: 'easeInOut' }), 'expected a variable to move up from the variables group baseline.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'eq2:tex:3', path: 'transform.x', from: -31.44, to: 120.72, t: 2, duration: 1, easing: 'easeInOut' }), 'expected b token to move to the right side in the rearranged equation.');
    assertGalleryCondition(label, hasAnimation(documentData, { id: 'eq2:tex:6', path: 'transform.x', from: 120.72, to: -31.44, t: 2, duration: 1, easing: 'easeInOut' }), 'expected c token to move left in the rearranged equation.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'eq2:tex:2' && op.effect === 'fadeOut' && op.t === 2), 'expected plus sign to fade out on the second matching pass.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'effect' && op.id === 'eq3:tex:5' && op.effect === 'fadeIn' && op.t === 2), 'expected minus sign to fade in on the second matching pass.');
    assertGalleryCondition(label, documentData.timeline.some((op) => op.op === 'delete' && op.id === 'eq2' && approximatelyEqual(op.t, 0.4999)) && documentData.timeline.some((op) => op.op === 'delete' && op.id === 'eq3' && approximatelyEqual(op.t, 1.9999)), 'expected hidden target roots to be removed before token-level matching.');
    assertGalleryCondition(label, ['eq2:tex:0', 'eq2:tex:3', 'eq2:tex:6'].every((id) => documentData.timeline.some((op) => op.op === 'create' && op.node.id === id && op.t === 1.5 && op.node.transform.opacity === 1)), 'expected transformed variable targets to materialize visibly after the first pass.');

    const firstMidA = renderedNodeAt(documentData, 1, 'varA');
    const firstMidSourceX = renderedNodeAt(documentData, 1, 'eq1:tex:0');
    const firstMidPower = renderedNodeAt(documentData, 1, 'eq1:tex:1');
    assertGalleryCondition(label, approximatelyEqual(firstMidA?.transform?.x ?? 0, -112.8) && approximatelyEqual(firstMidA?.transform?.y ?? 0, 33.75) && firstMidA?.transform?.opacity === 1, 'expected variable a halfway from lower label row into equation.');
    assertGalleryCondition(label, firstMidSourceX?.transform?.opacity === 0.5 && firstMidPower?.transform?.opacity === 1, 'expected unmatched source variable to fade while matching power stays visible.');

    const firstCompleteA = renderedNodeAt(documentData, 1.5, 'eq2:tex:0');
    const firstCompleteB = renderedNodeAt(documentData, 1.5, 'eq2:tex:3');
    const firstCompleteC = renderedNodeAt(documentData, 1.5, 'eq2:tex:6');
    assertGalleryCondition(label, approximatelyEqual(firstCompleteA?.transform?.x ?? 0, -183.6) && approximatelyEqual(firstCompleteB?.transform?.x ?? 0, -31.44) && approximatelyEqual(firstCompleteC?.transform?.x ?? 0, 120.72), 'expected first target equation variables to be fully visible in equation slots.');

    const secondMidB = renderedNodeAt(documentData, 2.5, 'eq2:tex:3');
    const secondMidC = renderedNodeAt(documentData, 2.5, 'eq2:tex:6');
    const secondMidPlus = renderedNodeAt(documentData, 2.5, 'eq2:tex:2');
    const secondMidMinus = renderedNodeAt(documentData, 2.5, 'eq3:tex:5');
    assertGalleryCondition(label, approximatelyEqual(secondMidB?.transform?.x ?? 0, 44.64) && approximatelyEqual(secondMidC?.transform?.x ?? 0, 44.64), 'expected b and c to cross at the second transform midpoint.');
    assertGalleryCondition(label, secondMidPlus?.transform?.opacity === 0.5 && secondMidMinus?.transform?.opacity === 0.5, 'expected plus fade-out and minus fade-in to meet halfway.');

    const finalA = renderedNodeAt(documentData, 3, 'eq3:tex:0');
    const finalC = renderedNodeAt(documentData, 3, 'eq3:tex:3');
    const finalB = renderedNodeAt(documentData, 3, 'eq3:tex:6');
    const finalMinus = renderedNodeAt(documentData, 3, 'eq3:tex:5');
    assertGalleryCondition(label, approximatelyEqual(finalA?.transform?.x ?? 0, -183.6) && approximatelyEqual(finalC?.transform?.x ?? 0, -31.44) && approximatelyEqual(finalB?.transform?.x ?? 0, 120.72) && finalMinus?.transform?.opacity === 1, 'expected rearranged final equation token layout.');

    const firstCompleteSvg = svgSampleAt(documentData, 1.5);
    const finalSvg = svgSampleAt(documentData, 3);
    assertGalleryCondition(label, countSvgOccurrences(firstCompleteSvg, /id="eq2:tex:/gu) === 8 && !firstCompleteSvg.includes('id="varA"'), 'expected SVG first target equation to contain eight materialized tokens and no source variables.');
    assertGalleryCondition(label, countSvgOccurrences(finalSvg, /id="eq3:tex:/gu) === 8 && /id="eq3:tex:5"[^>]*>-/u.test(finalSvg), 'expected SVG final equation to contain eight rearranged tokens including minus sign.');
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
  const examplePath = resolve(root, sourceExamplePath);
  const exampleSource = readFileSync(examplePath, 'utf8');
  if (normalizeDslSource(body) !== normalizeDslSource(exampleSource)) {
    throw new Error(`${label}: body is out of sync with ${sourceExamplePath}.`);
  }
}

function checkGallerySourceCoverage(pageSources) {
  const expectedSources = new Set(files.map((file) => `examples/gallery/${file}`));
  const counts = new Map();
  for (const { label, sourceExamplePath } of pageSources) {
    counts.set(sourceExamplePath, [...(counts.get(sourceExamplePath) ?? []), label]);
  }

  for (const source of expectedSources) {
    if (!counts.has(source)) {
      throw new Error(`${source}: gallery DSL source is not referenced by any site gallery page.`);
    }
  }

  for (const [source, labels] of counts) {
    if (!expectedSources.has(source)) {
      throw new Error(`${source}: site gallery page references a source outside examples/gallery.`);
    }
    if (labels.length > 1) {
      throw new Error(`${source}: source_example_path is referenced by multiple gallery pages: ${labels.join(', ')}.`);
    }
  }

  const coveredOfficialAnchors = new Set(
    pageSources
      .map(({ sourceManimUrl }) => manimAnchorFromUrl(sourceManimUrl))
      .filter((anchor) => officialManimExampleAnchors.has(anchor)),
  );
  for (const anchor of officialManimExampleAnchors) {
    if (!coveredOfficialAnchors.has(anchor)) {
      throw new Error(`official Manim example #${anchor} is not covered by any site gallery page.`);
    }
  }
}

function compileSingleNode(source) {
  const documentData = compileTextDsl(`scene width=1280 height=720 fps=60\n${source}\n`);
  if (documentData.nodes.length !== 1) {
    throw new Error(`Expected one node from parity DSL source, got ${documentData.nodes.length}.`);
  }
  return documentData.nodes[0];
}

function pythonSingleNode(source) {
  const output = execFileSync('python3', ['-c', source], {
    cwd: root,
    env: { ...process.env, PYTHONPATH: resolve(root, 'python') },
    encoding: 'utf8',
    maxBuffer: 10_000_000,
  });
  return JSON.parse(output);
}

function styleParity(style) {
  const normalized = {
    fill: style?.fill,
    stroke: style?.stroke,
    strokeWidth: style?.strokeWidth,
  };
  if (style?.fillOpacity !== undefined && style.fillOpacity !== 1 && (style?.fill !== 'none' || style.fillOpacity !== 0)) {
    normalized.fillOpacity = style?.fillOpacity;
  }
  return normalized;
}

function nodeParity(node) {
  return {
    id: node.id,
    type: node.type,
    geometry: parityValue(node.geometry),
    style: styleParity(node.style),
    transform: parityValue(node.transform),
    children: (node.children ?? []).map(nodeParity),
  };
}

function parityValue(value) {
  if (typeof value === 'number') return Number(value.toFixed(12));
  if (Array.isArray(value)) return value.map(parityValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, parityValue(entry)]));
  }
  return value;
}

function assertParity(label, textDslSource, pythonSource) {
  const textNode = nodeParity(compileSingleNode(textDslSource));
  const pythonNode = nodeParity(pythonSingleNode(pythonSource));
  const textJson = JSON.stringify(textNode);
  const pythonJson = JSON.stringify(pythonNode);
  if (textJson !== pythonJson) {
    throw new Error(`${label}: Python DSL helper output differs from Text DSL output.\nText DSL: ${textJson}\nPython:   ${pythonJson}`);
  }
}

function checkPythonHelperParity() {
  assertParity(
    'projectedCircle',
    'projectedCircle circle_xy radius=0.67 xBasis=-56.75,25.5 yBasis=87.75,13.25 fill="none" stroke="#FFFFFF" strokeWidth=4',
    `import json
from fluxion import ProjectedCircle
node = ProjectedCircle(
    id="circle_xy",
    radius=0.67,
    x_basis=(-56.75, 25.5),
    y_basis=(87.75, 13.25),
    style={"fill": "none", "stroke": "#FFFFFF", "strokeWidth": 4},
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'projectedCircle manim camera projection',
    'projectedCircle circle_xy radius=1 phi=75 theta=30 unitScale=108.75 samples=16 fill="none" stroke="#FFFFFF" strokeWidth=4',
    `import json
from fluxion import ProjectedCircle
node = ProjectedCircle(
    id="circle_xy",
    radius=1,
    phi=75,
    theta=30,
    unit_scale=108.75,
    samples=16,
    style={"fill": "none", "stroke": "#FFFFFF", "strokeWidth": 4},
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'threeDAxes',
    'threeDAxes axes xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 includeTips=true',
    `import json
from fluxion import ThreeDAxes
node = ThreeDAxes(
    id="axes",
    x_range=(-6, 6, 1),
    y_range=(-5, 5, 1),
    z_range=(-4, 4, 1),
    include_tips=True,
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'threeDAxes manim camera projection',
    'threeDAxes axes xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xLength=10.5 yLength=10.5 zLength=6.5 phi=75 theta=30 unitScale=108.75 includeTips=true',
    `import json
from fluxion import ThreeDAxes
node = ThreeDAxes(
    id="axes",
    x_range=(-6, 6, 1),
    y_range=(-5, 5, 1),
    z_range=(-4, 4, 1),
    x_length=10.5,
    y_length=10.5,
    z_length=6.5,
    phi=75,
    theta=30,
    unit_scale=108.75,
    include_tips=True,
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'gaussianSurface',
    'gaussianSurface gauss range=-2,2 resolution=4 scale=2 sigma=0.4 mu=0,0 xBasis=63,31 yBasis=-60,30 zBasis=0,-130 fillA="#FF862F" fillB="#58C4DD" stroke="#83C167" fillOpacity=0.5 shade=true shadeStrength=0.18',
    `import json
from fluxion import GaussianSurface
node = GaussianSurface(
    id="gauss",
    resolution=4,
    scale=2,
    sigma=0.4,
    mu=(0, 0),
    x_basis=(63, 31),
    y_basis=(-60, 30),
    z_basis=(0, -130),
    fill_opacity=0.5,
    shade=True,
    shade_strength=0.18,
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'gaussianSurface manim camera projection',
    'gaussianSurface gauss range=-1,1 resolution=2 scale=2 sigma=0.4 mu=0,0 phi=75 theta=30 unitScale=108.75 fillA="#FF862F" fillB="#58C4DD" shade=true',
    `import json
from fluxion import GaussianSurface
node = GaussianSurface(
    id="gauss",
    u_range=(-1, 1),
    v_range=(-1, 1),
    resolution=2,
    scale=2,
    sigma=0.4,
    mu=(0, 0),
    phi=75,
    theta=30,
    unit_scale=108.75,
    shade=True,
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'sphereSurface',
    'sphereSurface sphere radius=104 worldRadius=1.5 xBasis=67.5,0 yBasis=0,12.15 zBasis=0,-67.5 resolution=3,4 fillA="#E65A4C" fillB="#CF5044" stroke="#BBBBBB" strokeWidth=0.5 light=0,0,-3',
    `import json
from fluxion import SphereSurface
node = SphereSurface(
    id="sphere",
    radius=104,
    world_radius=1.5,
    resolution=(3, 4),
    x_basis=(67.5, 0),
    y_basis=(0, 12.15),
    z_basis=(0, -67.5),
    light=(0, 0, -3),
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );

  assertParity(
    'sphereSurface manim camera projection',
    'sphereSurface sphere radius=104 worldRadius=1.5 resolution=2,4 phi=75 theta=30 unitScale=108.75 fillA="#E65A4C" fillB="#CF5044" stroke="#BBBBBB" strokeWidth=0.5 light=0,0,-3',
    `import json
from fluxion import SphereSurface
node = SphereSurface(
    id="sphere",
    radius=104,
    world_radius=1.5,
    resolution=(2, 4),
    phi=75,
    theta=30,
    unit_scale=108.75,
    light=(0, 0, -3),
)
print(json.dumps(node.to_dict(), separators=(",", ":")))`,
  );
}

for (const file of files) {
  const source = readFileSync(resolve(examplesGalleryDir, file), 'utf8');
  compileExample(`examples/gallery/${file}`, source);
}

const pageSources = [];
for (const file of markdownFiles) {
  const label = `site/src/content/gallery/${file}`;
  const { body, frontmatter } = readMarkdown(resolve(siteGalleryDir, file));
  checkMarkdownFrontmatter(label, frontmatter);
  checkGalleryExampleSync(label, frontmatter, body);
  pageSources.push({
    label,
    sourceExamplePath: getFrontmatterValue(frontmatter, 'source_example_path'),
    sourceManimUrl: getFrontmatterValue(frontmatter, 'source_manim_url'),
  });
  compileExample(label, body);
}
checkGallerySourceCoverage(pageSources);
checkPythonHelperParity();

console.log(
  `Compiled ${files.length} example gallery DSL files, checked ${markdownFiles.length} site gallery pages, covered ${officialManimExampleAnchors.size} official Manim examples, and verified Python helper parity successfully.`,
);
