import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
const dataPath = resolve(siteRoot, 'src/data/landingExamples.ts');
const docPaths = [
  resolve(siteRoot, 'src/content/docs/reference/text-dsl.md'),
  resolve(siteRoot, 'src/content/docs/en/reference/text-dsl.md'),
];

const dataSource = readFileSync(dataPath, 'utf8');
const examplesBlock = dataSource.match(/export const textDslCommandExamples:[\s\S]*?= \[([\s\S]*?)\];\n\nexport const getLandingCommandExamples/);
if (!examplesBlock) {
  throw new Error(`Could not find textDslCommandExamples in ${dataPath}`);
}

const expected = [...examplesBlock[1].matchAll(/command: '([^']+)'[\s\S]*?minimalExample: '([^']+)'/g)].map((match) => ({
  command: match[1],
  minimalExample: match[2].replaceAll('\\\\', '\\'),
}));

if (expected.length === 0) {
  throw new Error(`No command examples found in ${dataPath}`);
}

for (const docPath of docPaths) {
  const doc = readFileSync(docPath, 'utf8');
  const referenceBlock = doc.match(/## Command quick reference\n\n([\s\S]*?)\n\n## Playground demo/);
  if (!referenceBlock) {
    throw new Error(`Could not find Command quick reference table in ${docPath}`);
  }
  const actual = [...referenceBlock[1].matchAll(/^\| `([^`]+)` \| .*? \| `([^`]+)` \|$/gm)].map((match) => ({
    command: match[1],
    minimalExample: match[2],
  }));
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  if (actualJson !== expectedJson) {
    throw new Error(`Text DSL command reference is out of sync in ${docPath}\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
  }
}

console.log(`Text DSL command references match ${expected.length} centralized examples.`);
