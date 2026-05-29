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
    minimalExample: 'axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2 xNumbers=-4,0,4',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=700 height=300 xRange=-4,4 yRange=-2,2 stroke="#94a3b8" strokeWidth=3 xTicks=-4,-2,0,2,4 yTicks=-2,-1,0,1,2',
  },
  {
    key: 'numberPlane',
    command: 'numberPlane',
    description: {
      ja: 'Manim NumberPlane 風の背景グリッドを生成します。',
      en: 'Generate a Manim NumberPlane-style background grid.',
    },
    referencePurpose: {
      ja: 'NumberPlane grid helper',
      en: 'NumberPlane grid helper',
    },
    minimalExample: 'numberPlane plane xRange=-7,7 yRange=-4,4 unit=60',
    source: 'scene width=960 height=540 fps=60\nnumberPlane plane at 480,270 xRange=-7,7 yRange=-4,4 unit=60',
  },
  {
    key: 'axisLabels',
    command: 'axisLabels',
    description: {
      ja: 'Axes helper の軸端に Manim 風の数式ラベルを生成します。',
      en: 'Generate Manim-style math labels at an axes helper endpoint.',
    },
    referencePurpose: {
      ja: 'Axes label helper',
      en: 'Axes label helper',
    },
    minimalExample: 'axisLabels labels axes=ax x="x" y="f(x)"',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=700 height=300 xRange=-4,4 yRange=-2,2 stroke="#94a3b8" strokeWidth=3\naxisLabels labels axes=ax x="x" y="f(x)" size=28 fill="#e2e8f0"',
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
    key: 'graphLabel',
    command: 'graphLabel',
    description: {
      ja: 'Plot helper の曲線上の点から Manim 風の数式ラベルを配置します。',
      en: 'Place a Manim-style math label from a point on a plot helper.',
    },
    referencePurpose: {
      ja: 'Plot graph label helper',
      en: 'Plot graph label helper',
    },
    minimalExample: 'graphLabel label plot=curve label="\\sin(x)" xVal=1.57 direction=up',
    source: 'scene width=960 height=540 fps=60\nplot curve fn=sin(t) range=-3.14,3.14 scaleX=90 scaleY=70 at 480,270 stroke="#38bdf8" strokeWidth=5 fill="none"\ngraphLabel label plot=curve label="\\sin(x)" xVal=1.57 direction=up fill="#38bdf8"',
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
    key: 'dataRect',
    command: 'dataRect',
    description: {
      ja: 'axes のデータ座標から更新可能な矩形を生成します。',
      en: 'Generate an updatable rectangle from axes data coordinates.',
    },
    referencePurpose: {
      ja: 'Axes data-coordinate rectangle helper',
      en: 'Axes data-coordinate rectangle helper',
    },
    minimalExample: 'dataRect area axes=ax from=0,0 to=t,25/t',
    source: 'scene width=960 height=540 fps=60\nvalue t = 5\naxes ax at 480,270 width=480 height=360 xRange=0,10 yRange=0,10 stroke="#94a3b8" strokeWidth=3\ndataRect area axes=ax from=0,0 to=t,25/t fill="#58C4DD" fillOpacity=0.5 stroke="#F7D45A"\nanimate t from 5 to 8 duration=1s',
  },
  {
    key: 'dataDot',
    command: 'dataDot',
    description: {
      ja: 'axes のデータ座標から更新可能な dot を生成します。',
      en: 'Generate an updatable dot from axes data coordinates.',
    },
    referencePurpose: {
      ja: 'Axes data-coordinate dot helper',
      en: 'Axes data-coordinate dot helper',
    },
    minimalExample: 'dataDot dot axes=ax point=t,25/t',
    source: 'scene width=960 height=540 fps=60\nvalue t = 5\naxes ax at 480,270 width=480 height=360 xRange=0,10 yRange=0,10 stroke="#94a3b8" strokeWidth=3\ndataDot dot axes=ax point=t,25/t r=10 fill="#ffffff"\nanimate t from 5 to 8 duration=1s',
  },
  {
    key: 'dataLine',
    command: 'dataLine',
    description: {
      ja: 'axes のデータ座標から線分を生成します。',
      en: 'Generate a line segment from axes data coordinates.',
    },
    referencePurpose: {
      ja: 'Axes data-coordinate line helper',
      en: 'Axes data-coordinate line helper',
    },
    minimalExample: 'dataLine marker axes=ax from=2,0 to=2,4',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=500 height=330 xRange=0,5 yRange=0,6 stroke="#94a3b8" strokeWidth=3\ndataLine marker axes=ax from=2,0 to=2,4 stroke="#FFFF00" strokeWidth=5',
  },
  {
    key: 'dynamicLine',
    command: 'dynamicLine',
    description: {
      ja: '式に追従する line endpoint を生成します。',
      en: 'Generate line endpoints that follow expressions.',
    },
    referencePurpose: {
      ja: 'Expression-bound line helper',
      en: 'Expression-bound line helper',
    },
    minimalExample: 'dynamicLine connector x1=60*x y1=0 x2=72 y2=-60*y',
    source: 'scene width=640 height=360 fps=60\nvalue x = 0\nvalue y = 0\ndynamicLine connector x1=80+60*x y1=180 x2=360 y2=180-60*y stroke="#FC6255" strokeWidth=5\ncircle d1 r=10 at 80,180 fill="#58C4DD"\ncircle d2 r=10 at 360,180 fill="#83C167"\nalways d1.x = expr=80+60*x\nalways d2.y = expr=180-60*y\nanimate x from 0 to 2 duration=1s easing=smooth\nanimate y from 0 to 2 duration=1s easing=smooth',
  },
  {
    key: 'dataArea',
    command: 'dataArea',
    description: {
      ja: '2つの関数の間の領域を axes 座標で生成します。',
      en: 'Generate the area between two functions in axes coordinates.',
    },
    referencePurpose: {
      ja: 'Axes bounded area helper',
      en: 'Axes bounded area helper',
    },
    minimalExample: 'dataArea area axes=ax lower=t upper=2*t range=1,2',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=500 height=330 xRange=0,5 yRange=0,6 stroke="#94a3b8" strokeWidth=3\ndataArea area axes=ax lower=t upper=2*t range=1,2 samples=32 fill="#888888" fillOpacity=0.5',
  },
  {
    key: 'dataRiemannRects',
    command: 'dataRiemannRects',
    description: {
      ja: '関数のリーマン矩形を axes 座標で生成します。',
      en: 'Generate Riemann rectangles for a function in axes coordinates.',
    },
    referencePurpose: {
      ja: 'Axes Riemann rectangles helper',
      en: 'Axes Riemann rectangles helper',
    },
    minimalExample: 'dataRiemannRects bars axes=ax fn=4*t-t*t range=0.3,0.6 dx=0.03',
    source: 'scene width=960 height=540 fps=60\naxes ax at 480,270 width=500 height=330 xRange=0,5 yRange=0,6 stroke="#94a3b8" strokeWidth=3\ndataRiemannRects bars axes=ax fn=4*t-t*t range=0.3,0.6 dx=0.03 fill="#0000FF" fillOpacity=0.5',
  },
  {
    key: 'gaussianSurface',
    command: 'gaussianSurface',
    description: {
      ja: 'Gaussian Surface を投影済み checkerboard mesh として生成します。',
      en: 'Generate a projected checkerboard Gaussian surface mesh.',
    },
    referencePurpose: {
      ja: 'Projected Gaussian surface helper',
      en: 'Projected Gaussian surface helper',
    },
    minimalExample: 'gaussianSurface surface range=-2,2 resolution=24 scale=2',
    source: 'scene width=960 height=540 fps=60\ngaussianSurface surface at 480,270 range=-2,2 resolution=12 scale=2 sigma=0.4 fillA="#FF862F" fillB="#58C4DD" stroke="#83C167" fillOpacity=0.5',
  },
  {
    key: 'sphereSurface',
    command: 'sphereSurface',
    description: {
      ja: '球面 Surface を投影済み checkerboard mesh として生成します。',
      en: 'Generate a projected checkerboard sphere surface mesh.',
    },
    referencePurpose: {
      ja: 'Projected sphere surface helper',
      en: 'Projected sphere surface helper',
    },
    minimalExample: 'sphereSurface sphere radius=104 resolution=15,32',
    source: 'scene width=640 height=360 fps=60\nsphereSurface sphere at 320,180 radius=104 resolution=15,32 fillA="#E65A4C" fillB="#CF5044" light=0,-0.35,1\ncircle rim r=104 at 320,180 fill="none" stroke="#4D0E0F" strokeWidth=2',
  },
  {
    key: 'threeDAxes',
    command: 'threeDAxes',
    description: {
      ja: 'ThreeDAxes を投影済み line/tick/tip 群として生成します。',
      en: 'Generate projected ThreeDAxes lines, ticks, and tips.',
    },
    referencePurpose: {
      ja: 'Projected ThreeDAxes helper',
      en: 'Projected ThreeDAxes helper',
    },
    minimalExample: 'threeDAxes axes xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1',
    source: 'scene width=640 height=360 fps=60\nthreeDAxes axes at 320,190 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 includeTips=true stroke="#ffffff"',
  },
  {
    key: 'projectedCircle',
    command: 'projectedCircle',
    description: {
      ja: 'XY 平面の円を投影済み cubic path として生成します。',
      en: 'Generate an XY-plane circle as a projected cubic path.',
    },
    referencePurpose: {
      ja: 'Projected XY-plane circle helper',
      en: 'Projected XY-plane circle helper',
    },
    minimalExample: 'projectedCircle circle radius=1 xBasis=-56.75,25.5 yBasis=87.75,13.25',
    source: 'scene width=640 height=360 fps=60\nprojectedCircle circle at 320,180 radius=1 xBasis=-56.75,25.5 yBasis=87.75,13.25 fill="none" stroke="#ffffff" strokeWidth=4',
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
    key: 'rotatingLine',
    command: 'rotatingLine',
    description: {
      ja: '基準線を指定点まわりに回転させる line helper です。',
      en: 'Generate a line by rotating a reference segment around a point.',
    },
    referencePurpose: {
      ja: 'About-point rotating line helper',
      en: 'About-point rotating line helper',
    },
    minimalExample: 'rotatingLine arm x1=-120 y1=0 x2=120 y2=0 about=-120,0 angle=-theta',
    source: 'scene width=640 height=360 fps=60\nvalue theta = 0\nline base x1=200 y1=180 x2=440 y2=180 stroke="#64748b" strokeWidth=4\nrotatingLine arm x1=200 y1=180 x2=440 y2=180 about=200,180 angle=-theta stroke="#f59e0b" strokeWidth=6\nanimate theta from 0 to 2.4 duration=1.5s easing=easeInOut',
  },
  {
    key: 'rotateUpdater',
    command: 'rotateUpdater',
    description: {
      ja: 'dt ベースの回転 updater を累積 rotation animation に展開します。',
      en: 'Expand a dt-based rotation updater into cumulative rotation animation.',
    },
    referencePurpose: {
      ja: 'dt rotation updater expansion',
      en: 'dt rotation updater expansion',
    },
    minimalExample: 'rotateUpdater arm rate=1 duration=2s',
    source: 'scene width=640 height=360 fps=60\nline arm x1=320 y1=180 x2=140 y2=180 stroke="#FFFF00" strokeWidth=8\nrotateUpdater arm rate=1 duration=2s\nrotateUpdater arm rate=-1 duration=2s',
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
    key: 'followCamera',
    command: 'followCamera',
    description: {
      ja: 'カメラターゲットを動く node に追従させます。',
      en: 'Keep the camera target attached to a moving node.',
    },
    referencePurpose: {
      ja: 'Keep camera target on a moving node',
      en: 'Keep camera target on a moving node',
    },
    minimalExample: 'followCamera dot start=1s duration=2s',
    source: 'scene width=640 height=360 fps=60\ncamera mode=target target=0,0 scale=1\ncircle dot r=30 at -180,0 fill="#ff862f"\nline path x1=-180 y1=0 x2=180 y2=0 stroke="#94a3b8"\nanimate dot.x from -180 to 180 start=1s duration=2s easing=linear\nfollowCamera dot start=1s duration=2s\nanimate camera.scale from 1 to 1.5 start=1s duration=0.8s easing=easeInOut',
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
