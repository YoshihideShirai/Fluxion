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
path spark d="M 0 -52 L 14 -14 L 52 0 L 14 14 L 0 52 L -14 14 L -52 0 L -14 -14 Z" at 640,510 fill="#facc15" stroke="#fef08a" strokeWidth=3
text caption "Values, expressions, camera moves, groups, and math-token transforms in one scene." at 640,646 size=22 fill="#cbd5e1"

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
  animate spark.opacity from 1 to 0.35 start=6.6s duration=0.6s easing=easeOut
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
    minimalExample: 'circle dot r=34 at -380,-20 fill="#38bdf8"',
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
    minimalExample: 'rect target w=120 h=88 at 180,-20 fill="#f97316"',
    source: 'scene width=640 height=360 fps=60\nrect card w=220 h=120 at 320,180 fill="#f97316" opacity=0.85',
  },
  {
    key: 'triangle',
    command: 'triangle',
    description: {
      ja: '幅と高さを指定して三角形を描きます。',
      en: 'Draw a triangle with width and height.',
    },
    referencePurpose: {
      ja: 'Triangle node declaration',
      en: 'Triangle node declaration',
    },
    minimalExample: 'triangle t1 w=120 h=104 at 0,0 fill="#ef4444"',
    source: 'scene width=640 height=360 fps=60\ntriangle tri w=220 h=190 at 320,180 fill="#ef4444" stroke="#7f1d1d" strokeWidth=6',
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
    minimalExample: 'line axis x1=-50 y1=0 x2=50 y2=0 at 0,-160 stroke="#e2e8f0"',
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
    minimalExample: 'path curve d="M 0 0 C 40 80 80 80 120 0" at 0,-20 fill="none" stroke="#38bdf8"',
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
    minimalExample: 'text title "Fluxion" at 0,240 size=32 fill="#e2e8f0"',
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
    minimalExample: 'math equation "e^{i\\pi}+1=0" at 0,160 size=36 renderer=katex',
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
    key: 'surroundingRect',
    command: 'surroundingRect',
    description: {
      ja: '対象 node の周囲に枠用の矩形を作ります。',
      en: 'Create a rectangular frame around a target node.',
    },
    referencePurpose: {
      ja: 'Target-bounds rectangle declaration',
      en: 'Target-bounds rectangle declaration',
    },
    minimalExample: 'surroundingRect frame target=equation buff=10 stroke="#fbbf24"',
    source: 'scene width=640 height=360 fps=60\nmath equation "f(x)g(x)" at 320,180 size=44 w=220 h=80 fill="#e2e8f0"\nsurroundingRect frame target=equation buff=12 stroke="#fbbf24" strokeWidth=5',
  },
  {
    key: 'axes',
    command: 'axes',
    description: {
      ja: '座標軸ガイドをまとめて生成します。',
      en: 'Generate a coordinate-axes helper group.',
    },
    referencePurpose: {
      ja: 'Axes helper declaration',
      en: 'Axes helper declaration',
    },
    minimalExample: 'axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=700 height=300 xRange=-4,4 yRange=-2,2 stroke="#94a3b8" strokeWidth=3',
  },
  {
    key: 'plot',
    command: 'plot',
    description: {
      ja: '関数式から path をサンプリングして描画します。',
      en: 'Sample a function expression into a plot path.',
    },
    referencePurpose: {
      ja: 'Function plot path declaration',
      en: 'Function plot path declaration',
    },
    minimalExample: 'plot curve fn=sin(t) range=-3.14,3.14 scaleX=80 scaleY=60',
    source: 'scene width=960 height=540 fps=60\nplot curve fn=sin(t) range=-3.14,3.14 scaleX=90 scaleY=70 at 480,270 stroke="#38bdf8" strokeWidth=5 fill="none"',
  },
  {
    key: 'dataPolygon',
    command: 'dataPolygon',
    description: {
      ja: 'axes のデータ座標から polygon path を生成します。',
      en: 'Generate a polygon path from axes data coordinates.',
    },
    referencePurpose: {
      ja: 'Axes data-coordinate polygon helper',
      en: 'Axes data-coordinate polygon helper',
    },
    minimalExample: 'dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=700 height=300 xRange=-4,4 yRange=-2,2 stroke="#94a3b8" strokeWidth=3\ndataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5 fill="#22d3ee" opacity=0.25 stroke="#22d3ee" strokeWidth=4',
  },
  {
    key: 'arrow',
    command: 'arrow',
    description: {
      ja: 'shaft と tip を持つ矢印を生成します。',
      en: 'Generate an arrow with a shaft and tip.',
    },
    referencePurpose: {
      ja: 'Arrow helper declaration',
      en: 'Arrow helper declaration',
    },
    minimalExample: 'arrow vec x1=0 y1=0 x2=190 y2=80',
    source: 'scene width=640 height=360 fps=60\narrow vec x1=120 y1=220 x2=500 y2=120 stroke="#22d3ee" fill="#22d3ee" strokeWidth=8 tipLength=32 tipWidth=30',
  },
  {
    key: 'angle',
    command: 'angle',
    description: {
      ja: 'value tracker に追従する角度の円弧を生成します。',
      en: 'Generate an angle arc that follows a value tracker.',
    },
    referencePurpose: {
      ja: 'Updating angle arc helper',
      en: 'Updating angle arc helper',
    },
    minimalExample: 'angle arc radius=60 from=0 to=theta samples=72',
    source: 'scene width=640 height=360 fps=60\nvalue theta = 0\nangle arc radius=72 from=0 to=theta samples=72 at 320,180 stroke="#f59e0b" strokeWidth=6\nanimate theta from 0 to 2.4 duration=1.5s easing=easeInOut',
  },
  {
    key: 'tracedPath',
    command: 'tracedPath',
    description: {
      ja: 'パラメトリックな移動軌跡を path として生成します。',
      en: 'Generate a parametric motion trace as a path.',
    },
    referencePurpose: {
      ja: 'Updating trace path helper',
      en: 'Updating trace path helper',
    },
    minimalExample: 'tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta',
    source: 'scene width=640 height=360 fps=60\nvalue theta = 0\ntracedPath trace x=96*cos(t) y=96*sin(t) from=0 to=theta samples=96 at 320,180 stroke="#22d3ee" strokeWidth=5\ncircle dot r=16 at 416,180 fill="#38bdf8"\nset dot.x to expr="320 + 96 * cos(theta)"\nset dot.y to expr="180 + 96 * sin(theta)"\nanimate theta from 0 to 6.283 duration=2s easing=linear',
  },
  {
    key: 'arrange',
    command: 'arrange',
    description: {
      ja: 'group の子要素を等間隔で自動配置します。',
      en: 'Auto-layout group children with equal spacing.',
    },
    referencePurpose: {
      ja: 'Group auto-layout sugar',
      en: 'Group auto-layout sugar',
    },
    minimalExample: 'arrange dots direction=horizontal gap=20',
    source: 'scene width=640 height=360 fps=60\ncircle d1 r=22 at 0,0 fill="#38bdf8"\ncircle d2 r=22 at 0,0 fill="#f97316"\ncircle d3 r=22 at 0,0 fill="#22c55e"\ngroup dots d1 d2 d3\narrange dots direction=horizontal gap=40\nset dots.x to 320\nset dots.y to 180',
  },
  {
    key: 'nextTo',
    command: 'nextTo',
    description: {
      ja: '指定した対象の近くに node を相対配置します。',
      en: 'Position a node relative to another node.',
    },
    referencePurpose: {
      ja: 'Relative placement sugar',
      en: 'Relative placement sugar',
    },
    minimalExample: 'nextTo label dot direction=right buff=12',
    source: 'scene width=640 height=360 fps=60\ncircle dot r=28 at 280,180 fill="#38bdf8"\ntext label "nextTo" at 0,0 size=30 fill="#e2e8f0"\nnextTo label dot direction=right buff=24',
  },
  {
    key: 'cameraFrame',
    command: 'cameraFrame',
    description: {
      ja: 'カメラフレームの初期位置とズームを設定します。',
      en: 'Set the initial camera frame position and zoom.',
    },
    referencePurpose: {
      ja: 'Camera frame declaration',
      en: 'Camera frame declaration',
    },
    minimalExample: 'cameraFrame at 0,0 scale=1',
    source: 'scene width=640 height=360 fps=60\ncameraFrame at 0,0 scale=1\ncircle dot r=42 at 0,0 fill="#38bdf8"',
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
    key: 'animateFrame',
    command: 'animateFrame',
    description: {
      ja: 'カメラフレームを移動・ズームします。',
      en: 'Move and zoom the camera frame.',
    },
    referencePurpose: {
      ja: 'Interpolate the camera frame',
      en: 'Interpolate the camera frame',
    },
    minimalExample: 'animateFrame to 120,40 scale=1.4 duration=1s',
    source: 'scene width=640 height=360 fps=60\ncameraFrame at 0,0 scale=1\ncircle dot r=42 at 120,40 fill="#38bdf8"\nanimateFrame to 120,40 scale=1.4 duration=1s easing=easeInOut',
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
