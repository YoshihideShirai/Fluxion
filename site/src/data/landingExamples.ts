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
camera at 0,0 scale=1
value theta = 0

path orbit d="M -170 0 C -170 -94 -94 -170 0 -170 C 94 -170 170 -94 170 0 C 170 94 94 170 0 170 C -94 170 -170 94 -170 0" at 640,390 fill="none" stroke="#38bdf8" strokeWidth=4 opacity=0.55
text title "Fluxion Motion Lab" at 640,118 size=42 fill="#e2e8f0"
math equation "x^2+y^2=r^2" at 640,200 size=38 fill="#bae6fd" renderer=katex
circle dot r=38 at 470,390 fill="#38bdf8" stroke="#0f172a" strokeWidth=5
rect target w=190 h=104 at 960,390 fill="#f97316" stroke="#fed7aa" strokeWidth=4

at 0s:
  hide target
  play AnimationGroup(Write(title), FadeIn(equation), FadeIn(orbit), FadeIn(dot), lagRatio=0.16) duration=1.4s easing=easeOut

animate theta from 0 to 6.283 duration=2.4s easing=linear
set dot.x to expr="640 + 170 * cos(theta)"
set dot.y to expr="390 + 170 * sin(theta)"
animate camera.x from 0 to -24 duration=2.4s easing=easeInOut
play Transform(dot, target) duration=1s easing=easeInOut`;

export const commandDemoSource = `scene width=1280 height=720 fps=60
camera at 0,0 scale=1

value theta = 0
value pulse = 0

rect backdrop w=1280 h=720 at 640,360 fill="#020617"
path orbit d="M -170 0 C -170 -94 -94 -170 0 -170 C 94 -170 170 -94 170 0 C 170 94 94 170 0 170 C -94 170 -170 94 -170 0" at 640,390 fill="none" stroke="#1e3a8a" strokeWidth=5 opacity=0.5
line axis x1=-460 y1=0 x2=460 y2=0 at 640,390 stroke="#475569" strokeWidth=2 opacity=0.65
text title "Fluxion command demo" at 640,92 size=42 fill="#e2e8f0"
text subtitle "Text DSL → scene graph → timeline playback" at 640,146 size=23 fill="#94a3b8"
math equation "x^2+y^2=r^2" at 640,222 size=38 fill="#bae6fd" renderer=katex expandTokens=true
math equation2 "x^2+y^2=R^2" at 640,222 size=38 fill="#fef3c7" renderer=katex expandTokens=true
circle dot r=34 at 470,390 fill="#38bdf8" stroke="#0f172a" strokeWidth=5
circle halo r=56 at 470,390 fill="#38bdf8" stroke="#7dd3fc" strokeWidth=2 opacity=0.18
rect card w=230 h=112 at 1000,390 fill="#f97316" stroke="#fed7aa" strokeWidth=4 opacity=0.9
text cardLabel "morph target" at 1000,390 size=26 fill="#111827"
path spark d="M 0 -52 L 14 -14 L 52 0 L 14 14 L 0 52 L -14 14 L -52 0 L -14 -14 Z" at 640,510 fill="#facc15" stroke="#fef08a" strokeWidth=3 opacity=0
text caption "Values, expressions, camera moves, groups, and math-token transforms in one scene." at 640,646 size=22 fill="#cbd5e1" opacity=0

group cardGroup card cardLabel
group hero title subtitle equation
group heroNext title subtitle equation2

at 0s:
  show backdrop
  show axis
  play AnimationGroup(FadeIn(orbit), Write(hero), FadeIn(dot), FadeIn(halo), lagRatio=0.18) duration=1.6s easing=easeOut

wait 0.2s
animate theta from 0 to 6.283 duration=2.8s easing=linear
animate pulse from 0 to 6.283 duration=2.8s easing=linear
set dot.x to expr="640 + 170 * cos(theta)"
set dot.y to expr="390 + 170 * sin(theta)"
set halo.x to expr="640 + 170 * cos(theta)"
set halo.y to expr="390 + 170 * sin(theta)"
set halo.scale to expr="1.0 + 0.22 * sin(pulse)"
animate camera.x from 0 to -28 duration=2.8s easing=easeInOut
animate camera.y from 0 to 18 duration=2.8s easing=easeInOut

wait 0.2s
play TransformMatchingTex(equation, equation2) duration=1.2s easing=easeInOut
play FadeIn(cardGroup) duration=0.6s easing=easeOut
play Transform(dot, card) duration=1.25s easing=easeInOut
animate halo.opacity from 0.18 to 0 start=5.8s duration=0.8s easing=easeOut

at 6.2s:
  play FadeIn(spark) duration=0.4s easing=easeOut
  animate spark.rotation from 0 to 180 duration=1s easing=linear
  animate spark.scale from 0.8 to 1.45 duration=1s easing=easeOut
  animate spark.opacity from 1 to 0.35 duration=1s easing=easeOut
  play FadeIn(caption) duration=0.8s easing=easeOut`;

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
