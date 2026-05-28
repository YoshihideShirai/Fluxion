---
title: ThreeDCameraRotation
description: "Manim Example: `ThreeDCameraRotation` (`#threedcamerarotation`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedcamerarotation
source_example_path: examples/gallery/three-d-camera-rotation.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D camera はネイティブな runtime カメラとしては未実装のため、Manim `ThreeDCamera` 投影済みの `ThreeDAxes` と `Circle` 子要素を theta sweep として補間し、`begin_ambient_camera_rotation` / `move_camera` の見た目を近似している。"
    layer: runtime
    impact: medium
    workaround: "公式の `set_camera_orientation(phi=75°, theta=30°)` と `begin_ambient_camera_rotation(rate=0.1)` に合わせ、`threeDAxes` / `projectedCircle` の Manim camera 投影を使って 1秒分の theta 変化を axes/circle/tick の座標補間へ展開する。"
    closure_condition: "3D座標系/カメラ回転（phi/theta/gamma）を runtime でネイティブ実装する。"
    fidelity_upgrade_condition: "Manim の `begin_ambient_camera_rotation` と `move_camera` を同等パラメータで再現できる時。"
category: Manim Stable Examples
status: ported
priority: high
gap_id: GAP-028
order: 75
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

threeDAxes axes at 0,28 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 phi=75 theta=30 unitScale=67.5 includeTips=true
projectedCircle circle_xy radius=1 at 0,28 phi=75 theta=30 unitScale=67.5 samples=96 fill="none" stroke="#FFFFFF" strokeWidth=4

animate axes:x:axis.x1 from 161.876341 to 191.464519 duration=1s easing=linear
animate axes:x:axis.y1 from -72.567178 to -68.887541 duration=1s easing=linear
animate axes:x:axis.x2 from -270.344199 to -309.251053 duration=1s easing=linear
animate axes:x:axis.y2 from 121.191989 to 111.266278 duration=1s easing=linear
animate axes:x:tick:m6.x1 from 165.96699 to 194.849987 duration=1s easing=linear
animate axes:x:tick:m6.y1 from -63.442125 to -59.478045 duration=1s easing=linear
animate axes:x:tick:m6.x2 from 157.785691 to 188.079051 duration=1s easing=linear
animate axes:x:tick:m6.y2 from -81.692231 to -78.297036 duration=1s easing=linear
animate axes:x:tick:m5.x1 from 143.653913 to 168.169432 duration=1s easing=linear
animate axes:x:tick:m5.y1 from -53.439447 to -49.878576 duration=1s easing=linear
animate axes:x:tick:m5.x2 from 135.472614 to 161.398496 duration=1s easing=linear
animate axes:x:tick:m5.y2 from -71.689552 to -68.697567 duration=1s easing=linear
animate axes:x:tick:m4.x1 from 119.74183 to 139.68041 duration=1s easing=linear
animate axes:x:tick:m4.y1 from -42.719953 to -39.628433 duration=1s easing=linear
animate axes:x:tick:m4.x2 from 111.560531 to 132.909474 duration=1s easing=linear
animate axes:x:tick:m4.y2 from -60.970059 to -58.447424 duration=1s easing=linear
animate axes:x:tick:m3.x1 from 94.05247 to 109.192596 duration=1s easing=linear
animate axes:x:tick:m3.y1 from -31.203728 to -28.659139 duration=1s easing=linear
animate axes:x:tick:m3.x2 from 85.871171 to 102.42166 duration=1s easing=linear
animate axes:x:tick:m3.y2 from -49.453834 to -47.47813 duration=1s easing=linear
animate axes:x:tick:m2.x1 from 66.38004 to 76.487991 duration=1s easing=linear
animate axes:x:tick:m2.y1 from -18.798517 to -16.89226 duration=1s easing=linear
animate axes:x:tick:m2.x2 from 58.198742 to 69.717055 duration=1s easing=linear
animate axes:x:tick:m2.y2 from -37.048623 to -35.711251 duration=1s easing=linear
animate axes:x:tick:m1.x1 from 36.4857 to 41.315697 duration=1s easing=linear
animate axes:x:tick:m1.y1 from -5.397251 to -4.237525 duration=1s easing=linear
animate axes:x:tick:m1.x2 from 28.304401 to 34.544761 duration=1s easing=linear
animate axes:x:tick:m1.y2 from -23.647357 to -23.056516 duration=1s easing=linear
animate axes:x:tick:1.x1 from -31.132591 to -37.640316 duration=1s easing=linear
animate axes:x:tick:1.y1 from 24.9152 to 24.170274 duration=1s easing=linear
animate axes:x:tick:1.x2 from -39.31389 to -44.411252 duration=1s easing=linear
animate axes:x:tick:1.y2 from 6.665094 to 5.351283 duration=1s easing=linear
animate axes:x:tick:2.x1 from -69.571292 to -82.156727 duration=1s easing=linear
animate axes:x:tick:2.y1 from 42.146798 to 40.186955 duration=1s easing=linear
animate axes:x:tick:2.x2 from -77.752591 to -88.927663 duration=1s easing=linear
animate axes:x:tick:2.y2 from 23.896692 to 21.367964 duration=1s easing=linear
animate axes:x:tick:3.x1 from -111.686811 to -130.629052 duration=1s easing=linear
animate axes:x:tick:3.y1 from 61.026668 to 57.626945 duration=1s easing=linear
animate axes:x:tick:3.x2 from -119.868109 to -137.399988 duration=1s easing=linear
animate axes:x:tick:3.y2 from 42.776563 to 38.807953 duration=1s easing=linear
animate axes:x:tick:4.x1 from -158.033199 to -183.609119 duration=1s easing=linear
animate axes:x:tick:4.y1 from 81.803186 to 76.688787 duration=1s easing=linear
animate axes:x:tick:4.x2 from -166.214498 to -190.380055 duration=1s easing=linear
animate axes:x:tick:4.y2 from 63.55308 to 57.869796 duration=1s easing=linear
animate axes:x:tick:5.x1 from -209.281716 to -241.756396 duration=1s easing=linear
animate axes:x:tick:5.y1 from 104.777268 to 97.609754 duration=1s easing=linear
animate axes:x:tick:5.x2 from -217.463015 to -248.527332 duration=1s easing=linear
animate axes:x:tick:5.y2 from 86.527162 to 78.790763 duration=1s easing=linear
animate axes:x:tick:6.x1 from -266.25355 to -305.865585 duration=1s easing=linear
animate axes:x:tick:6.y1 from 130.317042 to 120.675774 duration=1s easing=linear
animate axes:x:tick:6.x2 from -274.434848 to -312.636521 duration=1s easing=linear
animate axes:x:tick:6.y2 from 112.066936 to 101.856783 duration=1s easing=linear
animate axes:x:tip.d from "M -270.344199 121.191989 L -256.782558 107.441283 L -251.05565 120.216357 Z" to "M -309.251053 111.266278 L -294.683788 98.585789 L -289.944133 111.759083 Z" duration=1s easing=linear
animate axes:y:axis.x1 from -260.794996 to -240.116336 duration=1s easing=linear
animate axes:y:axis.y1 from -38.970399 to -44.705586 duration=1s easing=linear
animate axes:y:axis.x2 from 332.420235 to 318.953969 duration=1s easing=linear
animate axes:y:axis.y2 from 49.673305 to 59.383815 duration=1s easing=linear
animate axes:y:tick:m5.x1 from -259.317112 to -238.285959 duration=1s easing=linear
animate axes:y:tick:m5.y1 from -48.86059 to -54.536645 duration=1s easing=linear
animate axes:y:tick:m5.x2 from -262.27288 to -241.946712 duration=1s easing=linear
animate axes:y:tick:m5.y2 from -29.080209 to -34.874527 duration=1s easing=linear
animate axes:y:tick:m4.x1 from -211.752502 to -195.131099 duration=1s easing=linear
animate axes:y:tick:m4.y1 from -41.753046 to -46.501943 duration=1s easing=linear
animate axes:y:tick:m4.x2 from -214.708269 to -198.791851 duration=1s easing=linear
animate axes:y:tick:m4.y2 from -21.972665 to -26.839824 duration=1s easing=linear
animate axes:y:tick:m3.x1 from -162.045874 to -149.731925 duration=1s easing=linear
animate axes:y:tick:m3.y1 from -34.325422 to -38.049387 duration=1s easing=linear
animate axes:y:tick:m3.x2 from -165.001641 to -153.392678 duration=1s easing=linear
animate axes:y:tick:m3.y2 from -14.545042 to -18.387269 duration=1s easing=linear
animate axes:y:tick:m2.x1 from -110.049201 to -101.908687 duration=1s easing=linear
animate axes:y:tick:m2.y1 from -26.555598 to -29.145512 duration=1s easing=linear
animate axes:y:tick:m2.x2 from -113.004969 to -105.56944 duration=1s easing=linear
animate axes:y:tick:m2.y2 from -6.775218 to -9.483394 duration=1s easing=linear
animate axes:y:tick:m1.x1 from -55.600494 to -51.461912 duration=1s easing=linear
animate axes:y:tick:m1.y1 from -18.419369 to -19.753179 duration=1s easing=linear
animate axes:y:tick:m1.x2 from -58.556261 to -55.122664 duration=1s easing=linear
animate axes:y:tick:m1.y2 from 1.361011 to -0.09106 duration=1s easing=linear
animate axes:y:tick:1.x1 from 61.381151 to 58.215921 duration=1s easing=linear
animate axes:y:tick:1.y1 from -0.93889 to 0.666972 duration=1s easing=linear
animate axes:y:tick:1.x2 from 58.425384 to 54.555169 duration=1s easing=linear
animate axes:y:tick:1.y2 from 18.84149 to 20.329091 duration=1s easing=linear
animate axes:y:tick:2.x1 from 124.324341 to 117.972087 duration=1s easing=linear
animate axes:y:tick:2.y1 from 8.466663 to 11.792556 duration=1s easing=linear
animate axes:y:tick:2.x2 from 121.368574 to 114.311334 duration=1s easing=linear
animate axes:y:tick:2.y2 from 28.247044 to 31.454674 duration=1s easing=linear
animate axes:y:tick:3.x1 from 190.54488 to 181.410419 duration=1s easing=linear
animate axes:y:tick:3.y1 from 18.361949 to 23.603697 duration=1s easing=linear
animate axes:y:tick:3.x2 from 187.589113 to 177.749666 duration=1s easing=linear
animate axes:y:tick:3.y2 from 38.142329 to 43.265815 duration=1s easing=linear
animate axes:y:tick:4.x1 from 260.305578 to 248.882078 duration=1s easing=linear
animate axes:y:tick:4.y1 from 28.786237 to 36.165775 duration=1s easing=linear
animate axes:y:tick:4.x2 from 257.349811 to 245.221326 duration=1s easing=linear
animate axes:y:tick:4.y2 from 48.566617 to 55.827893 duration=1s easing=linear
animate axes:y:tick:5.x1 from 333.898119 to 320.784345 duration=1s easing=linear
animate axes:y:tick:5.y1 from 39.783115 to 49.552756 duration=1s easing=linear
animate axes:y:tick:5.x2 from 330.942351 to 317.123592 duration=1s easing=linear
animate axes:y:tick:5.y2 from 59.563495 to 69.214874 duration=1s easing=linear
animate axes:y:tip.d from "M 332.420235 49.673305 L 313.583374 53.936247 L 315.652411 40.089981 Z" to "M 318.953969 59.383815 L 299.976799 62.970879 L 302.539326 49.207396 Z" duration=1s easing=linear
animate circle_xy.d from "M -35.223241 15.790147 L -31.206203 16.378048 L -27.037546 16.89426 L -22.737 17.335969 L -18.325166 17.700751 L -13.823387 17.986593 L -9.25361 18.19191 L -4.638241 18.31556 L 0 18.356853 L 4.638241 18.31556 L 9.25361 18.19191 L 13.823387 17.986593 L 18.325166 17.700751 L 22.737 17.335969 L 27.037546 16.89426 L 31.206203 16.378048 L 35.223241 15.790147 L 39.069917 15.133735 L 42.728586 14.412333 L 46.182789 13.629768 L 49.417341 12.790149 L 52.418396 11.897834 L 55.173502 10.957393 L 57.671643 9.973582 L 59.903268 8.9513 L 61.860302 7.895566 L 63.536156 6.81148 L 64.925712 5.704193 L 66.02531 4.578879 L 66.832714 3.440702 L 67.347079 2.294796 L 67.568909 1.146232 L 67.5 0 L 67.14339 -1.139014 L 66.503296 -2.266045 L 65.585055 -3.37647 L 64.395055 -4.46582 L 62.940672 -5.529793 L 61.2302 -6.564267 L 59.27279 -7.565308 L 57.078378 -8.529179 L 54.657626 -9.452345 L 52.02186 -10.331481 L 49.183005 -11.163471 L 46.153535 -11.945414 L 42.946412 -12.674627 L 39.575038 -13.348642 L 36.053206 -13.965212 L 32.395051 -14.522304 L 28.61501 -15.018104 L 24.727779 -15.451016 L 20.748278 -15.819656 L 16.691611 -16.122858 L 12.573034 -16.359669 L 8.407921 -16.529348 L 4.211736 -16.631367 L 0 -16.665408 L -4.211736 -16.631367 L -8.407921 -16.529348 L -12.573034 -16.359669 L -16.691611 -16.122858 L -20.748278 -15.819656 L -24.727779 -15.451016 L -28.61501 -15.018104 L -32.395051 -14.522304 L -36.053206 -13.965212 L -39.575038 -13.348642 L -42.946412 -12.674627 L -46.153535 -11.945414 L -49.183005 -11.163471 L -52.02186 -10.331481 L -54.657626 -9.452345 L -57.078378 -8.529179 L -59.27279 -7.565308 L -61.2302 -6.564267 L -62.940672 -5.529793 L -64.395055 -4.46582 L -65.585055 -3.37647 L -66.503296 -2.266045 L -67.14339 -1.139014 L -67.5 0 L -67.568909 1.146232 L -67.347079 2.294796 L -66.832714 3.440702 L -66.02531 4.578879 L -64.925712 5.704193 L -63.536156 6.81148 L -61.860302 7.895566 L -59.903268 8.9513 L -57.671643 9.973582 L -55.173502 10.957393 L -52.418396 11.897834 L -49.417341 12.790149 L -46.182789 13.629768 L -42.728586 14.412333 L -39.069917 15.133735 Z" to "M -41.025784 14.760778 L -37.276229 15.451957 L -33.346854 16.076442 L -29.255836 16.630873 L -25.022398 17.112238 L -20.666696 17.517906 L -16.209698 17.845645 L -11.67305 18.09364 L -7.078934 18.260516 L -2.449923 18.345343 L 2.191172 18.347646 L 6.821459 18.267414 L 11.418119 18.105095 L 15.958561 17.861591 L 20.420577 17.538257 L 24.782488 17.13688 L 29.023284 16.659671 L 33.122761 16.10924 L 37.06164 15.488576 L 40.821684 14.801024 L 44.385796 14.05025 L 47.738111 13.240222 L 50.864068 12.375168 L 53.750472 11.45955 L 56.385545 10.498031 L 58.75896 9.495439 L 60.861863 8.456733 L 62.686879 7.386974 L 64.228116 6.291291 L 65.481148 5.174848 L 66.442989 4.042819 L 67.112068 2.900357 L 67.488181 1.752568 L 67.572448 0.604489 L 67.367259 -0.538936 L 66.876218 -1.672878 L 66.104076 -2.792637 L 65.056677 -3.893659 L 63.740881 -4.971553 L 62.164508 -6.022102 L 60.336264 -7.04127 L 58.265678 -8.025216 L 55.963037 -8.970298 L 53.439325 -9.873079 L 50.706158 -10.730331 L 47.775726 -11.539041 L 44.66074 -12.296411 L 41.374377 -12.999859 L 37.930229 -13.64702 L 34.342256 -14.23575 L 30.624741 -14.764118 L 26.792249 -15.230413 L 22.859585 -15.633141 L 18.841761 -15.971019 L 14.753956 -16.242983 L 10.611487 -16.44818 L 6.429773 -16.585968 L 2.22431 -16.65592 L -1.989364 -16.657819 L -6.195695 -16.591659 L -10.379142 -16.457645 L -14.524207 -16.256193 L -18.615465 -15.987933 L -22.637594 -15.653704 L -26.575404 -15.254562 L -30.413876 -14.791775 L -34.138189 -14.266826 L -37.733766 -13.681414 L -41.186307 -13.037457 L -44.481832 -12.337089 L -47.606727 -11.58266 L -50.547792 -10.776742 L -53.292288 -9.922119 L -55.827994 -9.021795 L -58.14326 -8.078984 L -60.227066 -7.097112 L -62.069085 -6.079809 L -63.659744 -5.030906 L -64.990287 -3.954427 L -66.052847 -2.854581 L -66.840504 -1.735749 L -67.34736 -0.602476 L -67.568598 0.540547 L -67.500549 1.688496 L -67.140756 2.836433 L -66.488024 3.979326 L -65.542483 5.112072 L -64.305627 6.22952 L -62.780361 7.326498 L -60.971031 8.397838 L -58.883448 9.43841 L -56.524901 10.443148 L -53.904163 11.407086 L -51.03148 12.325388 L -47.91855 13.193382 L -44.57849 14.006593 Z" duration=1s easing=linear
animate axes:x:axis.x1 from 191.464519 to 161.876341 start=1s duration=1s easing=easeInOut
animate axes:x:axis.y1 from -68.887541 to -72.567178 start=1s duration=1s easing=easeInOut
animate axes:x:axis.x2 from -309.251053 to -270.344199 start=1s duration=1s easing=easeInOut
animate axes:x:axis.y2 from 111.266278 to 121.191989 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m6.x1 from 194.849987 to 165.96699 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m6.y1 from -59.478045 to -63.442125 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m6.x2 from 188.079051 to 157.785691 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m6.y2 from -78.297036 to -81.692231 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m5.x1 from 168.169432 to 143.653913 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m5.y1 from -49.878576 to -53.439447 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m5.x2 from 161.398496 to 135.472614 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m5.y2 from -68.697567 to -71.689552 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m4.x1 from 139.68041 to 119.74183 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m4.y1 from -39.628433 to -42.719953 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m4.x2 from 132.909474 to 111.560531 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m4.y2 from -58.447424 to -60.970059 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m3.x1 from 109.192596 to 94.05247 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m3.y1 from -28.659139 to -31.203728 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m3.x2 from 102.42166 to 85.871171 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m3.y2 from -47.47813 to -49.453834 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m2.x1 from 76.487991 to 66.38004 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m2.y1 from -16.89226 to -18.798517 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m2.x2 from 69.717055 to 58.198742 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m2.y2 from -35.711251 to -37.048623 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m1.x1 from 41.315697 to 36.4857 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m1.y1 from -4.237525 to -5.397251 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m1.x2 from 34.544761 to 28.304401 start=1s duration=1s easing=easeInOut
animate axes:x:tick:m1.y2 from -23.056516 to -23.647357 start=1s duration=1s easing=easeInOut
animate axes:x:tick:1.x1 from -37.640316 to -31.132591 start=1s duration=1s easing=easeInOut
animate axes:x:tick:1.y1 from 24.170274 to 24.9152 start=1s duration=1s easing=easeInOut
animate axes:x:tick:1.x2 from -44.411252 to -39.31389 start=1s duration=1s easing=easeInOut
animate axes:x:tick:1.y2 from 5.351283 to 6.665094 start=1s duration=1s easing=easeInOut
animate axes:x:tick:2.x1 from -82.156727 to -69.571292 start=1s duration=1s easing=easeInOut
animate axes:x:tick:2.y1 from 40.186955 to 42.146798 start=1s duration=1s easing=easeInOut
animate axes:x:tick:2.x2 from -88.927663 to -77.752591 start=1s duration=1s easing=easeInOut
animate axes:x:tick:2.y2 from 21.367964 to 23.896692 start=1s duration=1s easing=easeInOut
animate axes:x:tick:3.x1 from -130.629052 to -111.686811 start=1s duration=1s easing=easeInOut
animate axes:x:tick:3.y1 from 57.626945 to 61.026668 start=1s duration=1s easing=easeInOut
animate axes:x:tick:3.x2 from -137.399988 to -119.868109 start=1s duration=1s easing=easeInOut
animate axes:x:tick:3.y2 from 38.807953 to 42.776563 start=1s duration=1s easing=easeInOut
animate axes:x:tick:4.x1 from -183.609119 to -158.033199 start=1s duration=1s easing=easeInOut
animate axes:x:tick:4.y1 from 76.688787 to 81.803186 start=1s duration=1s easing=easeInOut
animate axes:x:tick:4.x2 from -190.380055 to -166.214498 start=1s duration=1s easing=easeInOut
animate axes:x:tick:4.y2 from 57.869796 to 63.55308 start=1s duration=1s easing=easeInOut
animate axes:x:tick:5.x1 from -241.756396 to -209.281716 start=1s duration=1s easing=easeInOut
animate axes:x:tick:5.y1 from 97.609754 to 104.777268 start=1s duration=1s easing=easeInOut
animate axes:x:tick:5.x2 from -248.527332 to -217.463015 start=1s duration=1s easing=easeInOut
animate axes:x:tick:5.y2 from 78.790763 to 86.527162 start=1s duration=1s easing=easeInOut
animate axes:x:tick:6.x1 from -305.865585 to -266.25355 start=1s duration=1s easing=easeInOut
animate axes:x:tick:6.y1 from 120.675774 to 130.317042 start=1s duration=1s easing=easeInOut
animate axes:x:tick:6.x2 from -312.636521 to -274.434848 start=1s duration=1s easing=easeInOut
animate axes:x:tick:6.y2 from 101.856783 to 112.066936 start=1s duration=1s easing=easeInOut
animate axes:x:tip.d from "M -309.251053 111.266278 L -294.683788 98.585789 L -289.944133 111.759083 Z" to "M -270.344199 121.191989 L -256.782558 107.441283 L -251.05565 120.216357 Z" start=1s duration=1s easing=easeInOut
animate axes:y:axis.x1 from -240.116336 to -260.794996 start=1s duration=1s easing=easeInOut
animate axes:y:axis.y1 from -44.705586 to -38.970399 start=1s duration=1s easing=easeInOut
animate axes:y:axis.x2 from 318.953969 to 332.420235 start=1s duration=1s easing=easeInOut
animate axes:y:axis.y2 from 59.383815 to 49.673305 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m5.x1 from -238.285959 to -259.317112 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m5.y1 from -54.536645 to -48.86059 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m5.x2 from -241.946712 to -262.27288 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m5.y2 from -34.874527 to -29.080209 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m4.x1 from -195.131099 to -211.752502 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m4.y1 from -46.501943 to -41.753046 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m4.x2 from -198.791851 to -214.708269 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m4.y2 from -26.839824 to -21.972665 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m3.x1 from -149.731925 to -162.045874 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m3.y1 from -38.049387 to -34.325422 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m3.x2 from -153.392678 to -165.001641 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m3.y2 from -18.387269 to -14.545042 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m2.x1 from -101.908687 to -110.049201 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m2.y1 from -29.145512 to -26.555598 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m2.x2 from -105.56944 to -113.004969 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m2.y2 from -9.483394 to -6.775218 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m1.x1 from -51.461912 to -55.600494 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m1.y1 from -19.753179 to -18.419369 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m1.x2 from -55.122664 to -58.556261 start=1s duration=1s easing=easeInOut
animate axes:y:tick:m1.y2 from -0.09106 to 1.361011 start=1s duration=1s easing=easeInOut
animate axes:y:tick:1.x1 from 58.215921 to 61.381151 start=1s duration=1s easing=easeInOut
animate axes:y:tick:1.y1 from 0.666972 to -0.93889 start=1s duration=1s easing=easeInOut
animate axes:y:tick:1.x2 from 54.555169 to 58.425384 start=1s duration=1s easing=easeInOut
animate axes:y:tick:1.y2 from 20.329091 to 18.84149 start=1s duration=1s easing=easeInOut
animate axes:y:tick:2.x1 from 117.972087 to 124.324341 start=1s duration=1s easing=easeInOut
animate axes:y:tick:2.y1 from 11.792556 to 8.466663 start=1s duration=1s easing=easeInOut
animate axes:y:tick:2.x2 from 114.311334 to 121.368574 start=1s duration=1s easing=easeInOut
animate axes:y:tick:2.y2 from 31.454674 to 28.247044 start=1s duration=1s easing=easeInOut
animate axes:y:tick:3.x1 from 181.410419 to 190.54488 start=1s duration=1s easing=easeInOut
animate axes:y:tick:3.y1 from 23.603697 to 18.361949 start=1s duration=1s easing=easeInOut
animate axes:y:tick:3.x2 from 177.749666 to 187.589113 start=1s duration=1s easing=easeInOut
animate axes:y:tick:3.y2 from 43.265815 to 38.142329 start=1s duration=1s easing=easeInOut
animate axes:y:tick:4.x1 from 248.882078 to 260.305578 start=1s duration=1s easing=easeInOut
animate axes:y:tick:4.y1 from 36.165775 to 28.786237 start=1s duration=1s easing=easeInOut
animate axes:y:tick:4.x2 from 245.221326 to 257.349811 start=1s duration=1s easing=easeInOut
animate axes:y:tick:4.y2 from 55.827893 to 48.566617 start=1s duration=1s easing=easeInOut
animate axes:y:tick:5.x1 from 320.784345 to 333.898119 start=1s duration=1s easing=easeInOut
animate axes:y:tick:5.y1 from 49.552756 to 39.783115 start=1s duration=1s easing=easeInOut
animate axes:y:tick:5.x2 from 317.123592 to 330.942351 start=1s duration=1s easing=easeInOut
animate axes:y:tick:5.y2 from 69.214874 to 59.563495 start=1s duration=1s easing=easeInOut
animate axes:y:tip.d from "M 318.953969 59.383815 L 299.976799 62.970879 L 302.539326 49.207396 Z" to "M 332.420235 49.673305 L 313.583374 53.936247 L 315.652411 40.089981 Z" start=1s duration=1s easing=easeInOut
animate circle_xy.d from "M -41.025784 14.760778 L -37.276229 15.451957 L -33.346854 16.076442 L -29.255836 16.630873 L -25.022398 17.112238 L -20.666696 17.517906 L -16.209698 17.845645 L -11.67305 18.09364 L -7.078934 18.260516 L -2.449923 18.345343 L 2.191172 18.347646 L 6.821459 18.267414 L 11.418119 18.105095 L 15.958561 17.861591 L 20.420577 17.538257 L 24.782488 17.13688 L 29.023284 16.659671 L 33.122761 16.10924 L 37.06164 15.488576 L 40.821684 14.801024 L 44.385796 14.05025 L 47.738111 13.240222 L 50.864068 12.375168 L 53.750472 11.45955 L 56.385545 10.498031 L 58.75896 9.495439 L 60.861863 8.456733 L 62.686879 7.386974 L 64.228116 6.291291 L 65.481148 5.174848 L 66.442989 4.042819 L 67.112068 2.900357 L 67.488181 1.752568 L 67.572448 0.604489 L 67.367259 -0.538936 L 66.876218 -1.672878 L 66.104076 -2.792637 L 65.056677 -3.893659 L 63.740881 -4.971553 L 62.164508 -6.022102 L 60.336264 -7.04127 L 58.265678 -8.025216 L 55.963037 -8.970298 L 53.439325 -9.873079 L 50.706158 -10.730331 L 47.775726 -11.539041 L 44.66074 -12.296411 L 41.374377 -12.999859 L 37.930229 -13.64702 L 34.342256 -14.23575 L 30.624741 -14.764118 L 26.792249 -15.230413 L 22.859585 -15.633141 L 18.841761 -15.971019 L 14.753956 -16.242983 L 10.611487 -16.44818 L 6.429773 -16.585968 L 2.22431 -16.65592 L -1.989364 -16.657819 L -6.195695 -16.591659 L -10.379142 -16.457645 L -14.524207 -16.256193 L -18.615465 -15.987933 L -22.637594 -15.653704 L -26.575404 -15.254562 L -30.413876 -14.791775 L -34.138189 -14.266826 L -37.733766 -13.681414 L -41.186307 -13.037457 L -44.481832 -12.337089 L -47.606727 -11.58266 L -50.547792 -10.776742 L -53.292288 -9.922119 L -55.827994 -9.021795 L -58.14326 -8.078984 L -60.227066 -7.097112 L -62.069085 -6.079809 L -63.659744 -5.030906 L -64.990287 -3.954427 L -66.052847 -2.854581 L -66.840504 -1.735749 L -67.34736 -0.602476 L -67.568598 0.540547 L -67.500549 1.688496 L -67.140756 2.836433 L -66.488024 3.979326 L -65.542483 5.112072 L -64.305627 6.22952 L -62.780361 7.326498 L -60.971031 8.397838 L -58.883448 9.43841 L -56.524901 10.443148 L -53.904163 11.407086 L -51.03148 12.325388 L -47.91855 13.193382 L -44.57849 14.006593 Z" to "M -35.223241 15.790147 L -31.206203 16.378048 L -27.037546 16.89426 L -22.737 17.335969 L -18.325166 17.700751 L -13.823387 17.986593 L -9.25361 18.19191 L -4.638241 18.31556 L 0 18.356853 L 4.638241 18.31556 L 9.25361 18.19191 L 13.823387 17.986593 L 18.325166 17.700751 L 22.737 17.335969 L 27.037546 16.89426 L 31.206203 16.378048 L 35.223241 15.790147 L 39.069917 15.133735 L 42.728586 14.412333 L 46.182789 13.629768 L 49.417341 12.790149 L 52.418396 11.897834 L 55.173502 10.957393 L 57.671643 9.973582 L 59.903268 8.9513 L 61.860302 7.895566 L 63.536156 6.81148 L 64.925712 5.704193 L 66.02531 4.578879 L 66.832714 3.440702 L 67.347079 2.294796 L 67.568909 1.146232 L 67.5 0 L 67.14339 -1.139014 L 66.503296 -2.266045 L 65.585055 -3.37647 L 64.395055 -4.46582 L 62.940672 -5.529793 L 61.2302 -6.564267 L 59.27279 -7.565308 L 57.078378 -8.529179 L 54.657626 -9.452345 L 52.02186 -10.331481 L 49.183005 -11.163471 L 46.153535 -11.945414 L 42.946412 -12.674627 L 39.575038 -13.348642 L 36.053206 -13.965212 L 32.395051 -14.522304 L 28.61501 -15.018104 L 24.727779 -15.451016 L 20.748278 -15.819656 L 16.691611 -16.122858 L 12.573034 -16.359669 L 8.407921 -16.529348 L 4.211736 -16.631367 L 0 -16.665408 L -4.211736 -16.631367 L -8.407921 -16.529348 L -12.573034 -16.359669 L -16.691611 -16.122858 L -20.748278 -15.819656 L -24.727779 -15.451016 L -28.61501 -15.018104 L -32.395051 -14.522304 L -36.053206 -13.965212 L -39.575038 -13.348642 L -42.946412 -12.674627 L -46.153535 -11.945414 L -49.183005 -11.163471 L -52.02186 -10.331481 L -54.657626 -9.452345 L -57.078378 -8.529179 L -59.27279 -7.565308 L -61.2302 -6.564267 L -62.940672 -5.529793 L -64.395055 -4.46582 L -65.585055 -3.37647 L -66.503296 -2.266045 L -67.14339 -1.139014 L -67.5 0 L -67.568909 1.146232 L -67.347079 2.294796 L -66.832714 3.440702 L -66.02531 4.578879 L -64.925712 5.704193 L -63.536156 6.81148 L -61.860302 7.895566 L -59.903268 8.9513 L -57.671643 9.973582 L -55.173502 10.957393 L -52.418396 11.897834 L -49.417341 12.790149 L -46.182789 13.629768 L -42.728586 14.412333 L -39.069917 15.133735 Z" start=1s duration=1s easing=easeInOut
at 2s:
  wait 1s
