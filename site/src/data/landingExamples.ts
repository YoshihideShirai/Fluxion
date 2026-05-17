export type LandingLocale = 'ja' | 'en';

export type LocalizedText = Record<LandingLocale, string>;

export interface TextDslCommandExample {
  key: string;
  command: string;
  description: LocalizedText;
  referencePurpose: LocalizedText;
  minimalExample: string;
  source: string;
}

export const heroTextDslExample = `scene width=1280 height=720 fps=60
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
circle c1 r=48 at 220,360 fill="#38bdf8"

at 0s:
  show title
  show c1

animate c1.x from 220 to 640 duration=1.5s easing=easeInOut`;

export const commandDemoSource = `scene width=1280 height=720 fps=60

text title "DSL command demo" at 640,90 size=36 fill="#e2e8f0"
math eq "f(x)=x^2" at 640,155 size=34 fill="#bae6fd"
circle dot r=34 at 260,420 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect target w=120 h=88 at 820,420 fill="#f97316" opacity=0.85
line axis x1=-320 y1=0 x2=320 y2=0 at 640,540 stroke="#94a3b8" strokeWidth=3
group intro title eq

at 0s:
  show axis
  hide target
  play Write(intro) duration=1s
  play FadeIn(dot) duration=0.8s

wait 0.4s
set dot.fill to "#22c55e"
animate dot.x from 260 to 820 duration=1.4s easing=easeInOut
play Transform(dot, target) duration=1.2s easing=easeOut
play FadeOut(intro) duration=0.8s`;

export const textDslCommandExamples: TextDslCommandExample[] = [
  {
    key: 'scene',
    command: 'scene',
    description: {
      ja: 'キャンバスのサイズと FPS を変えます。',
      en: 'Configure canvas size and fps.',
    },
    referencePurpose: {
      ja: 'Canvas size and fps',
      en: 'Canvas size and fps',
    },
    minimalExample: 'scene width=1280 height=720 fps=60',
    source: 'scene width=960 height=540 fps=30\ntext label "960x540 / 30fps" at 480,270 size=42 fill="#e2e8f0"',
  },
  {
    key: 'circle',
    command: 'circle',
    description: {
      ja: '半径と色を指定して円を描きます。',
      en: 'Draw a circle with radius and colors.',
    },
    referencePurpose: {
      ja: 'Circle node declaration',
      en: 'Circle node declaration',
    },
    minimalExample: 'circle dot r=34 at 260,420 fill="#38bdf8"',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=58 at 320,180 fill="#38bdf8" stroke="#0f172a" strokeWidth=6',
  },
  {
    key: 'rect',
    command: 'rect',
    description: {
      ja: '幅・高さ・不透明度を指定して矩形を描きます。',
      en: 'Draw a rectangle with width, height, and opacity.',
    },
    referencePurpose: {
      ja: 'Rectangle node declaration',
      en: 'Rectangle node declaration',
    },
    minimalExample: 'rect target w=120 h=88 at 820,420 fill="#f97316"',
    source: 'scene width=640 height=360 fps=60\nrect card w=220 h=120 at 320,180 fill="#f97316" opacity=0.85',
  },
  {
    key: 'line',
    command: 'line',
    description: {
      ja: '始点・終点を持つ線分を描きます。',
      en: 'Draw a line segment with start and end points.',
    },
    referencePurpose: {
      ja: 'Line node declaration',
      en: 'Line node declaration',
    },
    minimalExample: 'line axis x1=-50 y1=0 x2=50 y2=0 at 640,520 stroke="#e2e8f0"',
    source: 'scene width=640 height=360 fps=60\nline axis x1=-220 y1=0 x2=220 y2=0 at 320,180 stroke="#e2e8f0" strokeWidth=8',
  },
  {
    key: 'path',
    command: 'path',
    description: {
      ja: 'SVG path data で曲線や任意形状を描きます。',
      en: 'Draw curves and arbitrary shapes with SVG path data.',
    },
    referencePurpose: {
      ja: 'Path node declaration',
      en: 'Path node declaration',
    },
    minimalExample: 'path curve d="M 0 0 C 40 80 80 80 120 0" at 640,420 fill="none" stroke="#38bdf8"',
    source: 'scene width=640 height=360 fps=60\npath curve d="M 80 220 C 180 60 460 60 560 220" fill="none" stroke="#38bdf8" strokeWidth=8',
  },
  {
    key: 'text',
    command: 'text',
    description: {
      ja: '文字列を配置し、サイズと色を指定します。',
      en: 'Place text with size and color.',
    },
    referencePurpose: {
      ja: 'Text label node declaration',
      en: 'Text label node declaration',
    },
    minimalExample: 'text title "Fluxion" at 640,120 size=32 fill="#e2e8f0"',
    source: 'scene width=640 height=360 fps=60\ntext title "Hello Text DSL" at 320,180 size=42 fill="#e2e8f0"',
  },
  {
    key: 'math',
    command: 'math',
    description: {
      ja: 'LaTeX 文字列を数式 node として配置します。',
      en: 'Place a LaTeX string as a math node.',
    },
    referencePurpose: {
      ja: 'Math equation node declaration',
      en: 'Math equation node declaration',
    },
    minimalExample: 'math equation "e^{i\\pi}+1=0" at 640,200 size=36 renderer=katex',
    source: 'scene width=640 height=360 fps=60\nmath formula "e^{i\\pi}+1=0" at 320,180 size=44 fill="#bae6fd" renderer=katex',
  },
  {
    key: 'group',
    command: 'group',
    description: {
      ja: '複数 node をまとめて表示・アニメーションします。',
      en: 'Group multiple nodes for display and animation.',
    },
    referencePurpose: {
      ja: 'Grouped node declaration',
      en: 'Grouped node declaration',
    },
    minimalExample: 'group intro title equation',
    source: 'scene width=640 height=360 fps=60\ntext label "Grouped" at 320,130 size=34 fill="#e2e8f0"\ncircle dot r=36 at 320,220 fill="#38bdf8"\ngroup badge label dot\nplay FadeIn(badge) duration=1s',
  },
  {
    key: 'at',
    command: 'at',
    description: {
      ja: 'ブロック内の命令を指定時刻から開始します。',
      en: 'Start an indented block at a fixed time.',
    },
    referencePurpose: {
      ja: 'Start an indented block at a fixed time',
      en: 'Start an indented block at a fixed time',
    },
    minimalExample: 'at 0s:',
    source: 'scene width=640 height=360 fps=60\ncircle early r=36 at 240,180 fill="#38bdf8"\ncircle late r=36 at 400,180 fill="#f97316" opacity=0\nat 1s:\n  set late.opacity to 1',
  },
  {
    key: 'show-hide',
    command: 'show / hide',
    description: {
      ja: 'timeline 上で node を出現・削除します。',
      en: 'Create or delete a node on the timeline.',
    },
    referencePurpose: {
      ja: 'Create or delete a node on the timeline',
      en: 'Create or delete a node on the timeline',
    },
    minimalExample: 'show dot',
    source: 'scene width=640 height=360 fps=60\ncircle blink r=54 at 320,180 fill="#22c55e"\nat 0s:\n  show blink\nat 1s:\n  hide blink',
  },
  {
    key: 'value',
    command: 'value',
    description: {
      ja: 'scalar tracker を宣言し、式や animation から参照します。',
      en: 'Declare a scalar tracker for expressions and animation.',
    },
    referencePurpose: {
      ja: 'Declare a scalar tracker',
      en: 'Declare a scalar tracker',
    },
    minimalExample: 'value theta = 0',
    source: 'scene width=640 height=360 fps=60\nvalue theta = 0\ncircle dot r=36 at 320,180 fill="#38bdf8"\nanimate theta from 0 to 6.28 duration=2s easing=linear\nset dot.x to expr="320 + 100 * cos(theta)"',
  },
  {
    key: 'set',
    command: 'set',
    description: {
      ja: '指定 property に即時値を適用します。',
      en: 'Apply an immediate value to a property.',
    },
    referencePurpose: {
      ja: 'Apply an immediate property value or dependent expression',
      en: 'Apply an immediate property value or dependent expression',
    },
    minimalExample: 'set dot.x to expr="320 + 100 * cos(theta)"',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=54 at 320,180 fill="#38bdf8"\nat 1s:\n  set dot.fill to "#22c55e"',
  },
  {
    key: 'animate',
    command: 'animate',
    description: {
      ja: 'property を from / to / duration で補間します。',
      en: 'Interpolate a property with from / to / duration.',
    },
    referencePurpose: {
      ja: 'Interpolate one property or scalar tracker',
      en: 'Interpolate one property or scalar tracker',
    },
    minimalExample: 'animate theta from 0 to 6.28 duration=2s',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=42 at 160,180 fill="#38bdf8"\nanimate dot.x from 160 to 480 duration=1.5s easing=easeInOut',
  },
  {
    key: 'play',
    command: 'play',
    description: {
      ja: 'FadeIn や Transform などの primitive を再生します。',
      en: 'Run primitives such as FadeIn and Transform.',
    },
    referencePurpose: {
      ja: 'Run Manim-like primitives',
      en: 'Run Manim-like primitives',
    },
    minimalExample: 'play FadeIn(dot) duration=0.8s',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=42 at 180,180 fill="#38bdf8"\nrect target w=110 h=90 at 460,180 fill="#f97316"\nat 0s:\n  hide target\nplay FadeIn(dot) duration=0.7s\nplay Transform(dot, target) duration=1s easing=easeOut',
  },
  {
    key: 'wait',
    command: 'wait',
    description: {
      ja: 'current time を進め、次の animation 開始を遅らせます。',
      en: 'Advance the current time cursor before the next animation.',
    },
    referencePurpose: {
      ja: 'Advance the current time cursor',
      en: 'Advance the current time cursor',
    },
    minimalExample: 'wait 0.4s',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=42 at 160,180 fill="#38bdf8"\nplay FadeIn(dot) duration=0.7s\nwait 0.8s\nanimate dot.x from 160 to 480 duration=1s easing=easeInOut',
  },
];

export const getLandingCommandExamples = (locale: LandingLocale) =>
  textDslCommandExamples.map((example) => ({
    key: example.key,
    command: example.command,
    description: example.description[locale],
    source: example.source,
  }));

export const getTextDslCommandReference = (locale: LandingLocale) =>
  textDslCommandExamples.map((example) => ({
    command: example.command,
    purpose: example.referencePurpose[locale],
    minimalExample: example.minimalExample,
  }));
