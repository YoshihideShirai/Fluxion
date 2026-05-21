# Text DSL 移植ギャップ管理（暫定）

## 目的

この文書は、Text DSL の移植・拡張時に発生した不足機能を記録し、実装判断を遅延可能にするための運用メモである。

- 命令カタログの正は `site/src/content/docs/en/reference/text-dsl.md` とする。
- 本文書では「未実装/差分/互換方針」を管理し、仕様そのものは英語リファレンスに追従する。

## 参照元（SoT）

- Source of Truth: `site/src/content/docs/en/reference/text-dsl.md`
- 翻訳・展開対象: `site/src/content/docs/reference/text-dsl.md`（日本語）

---

## ギャップ記録テンプレート

不足機能を追加する場合は、以下4観点を必ず埋める。

1. **構文**: DSL上の表記と最小例
2. **IR**: `fluxion.schema.json` と JSON 出力への影響
3. **runtime実装**: 再生時挙動（タイミング、補間、副作用）
4. **互換方針**: 既存DSL/既存IR/既存ランタイムとの後方互換

推奨フォーマット:

```md
## <feature-name>
- status: proposal | planned | implemented
- syntax: <DSLの最小構文>
- ir: <追加/変更フィールド、バージョニング要否>
- runtime: <挙動と制約>
- compatibility:
  - backward: <yes/no + 理由>
  - fallback: <旧runtimeでの劣化動作>
- notes: <実装判断メモ>
```

---

## 拡張時の同時更新ルール（必須）

Text DSL に新しい命令・構文・意味論を追加する場合、**最低限** 次を同一PRで更新する。

1. `web/src/dsl/compiler.ts`（構文解析・AST/IR変換）
2. `schemas/fluxion.schema.json`（IRスキーマ）
3. `web/src/runtime/*`（再生挙動）
4. `site/src/content/docs/en/reference/text-dsl.md` と `site/src/content/docs/reference/text-dsl.md`（日英仕様）

補足:

- 仕様だけ先行し、実装が追随しない状態を禁止する。
- 実装だけ先行し、日英ドキュメントが欠落する状態を禁止する。
- 互換破壊の可能性がある場合は schema の変更理由と移行方針をPR本文に明記する。

---

## 提案キュー（status=proposal）

> 実需要が発生するまでは実装しない。ここでは候補と設計論点のみ管理する。

### proposal: axis / graph 補助構文

- status: `proposal`
- 構文（案）:
  - `axes ax xRange=-5,5 yRange=-3,3 at 640,360`
  - `plot g1 fn="sin(x)" range=-5,5 samples=200`
- IR:
  - 軸ノードの導入または既存 `group + line + text` 展開方針の明確化
  - 関数プロットを `path` にコンパイルする規約定義
- runtime実装:
  - 目盛り・ラベル生成の責務を compiler で持つか runtime で持つか
  - 高サンプル時の描画コスト管理
- 互換方針:
  - 初期は `path/line/text` への静的展開で後方互換を維持

### proposal: カメラ制御の高級プリミティブ

- status: `proposal`
- 構文（案）:
  - `play CameraMoveTo(640,360, zoom=1.4) duration=1.2s`
  - `play CameraFrame(targetNode, padding=40) duration=1.0s`
- IR:
  - グローバルview transformの明示ノード/トラック追加
  - 既存オブジェクト変換と分離した補間チャネル
- runtime実装:
  - camera transform 適用順序（scene -> camera -> node）
  - 既存の hit testing / overlays への影響整理
- 互換方針:
  - 非対応runtimeでは no-op ではなく警告+フォールバック（固定カメラ）

### proposal: 複合トランジション

- status: `proposal`
- 構文（案）:
  - `play MorphIn(node, from=left, blur=8) duration=0.8s`
  - `play CrossFade(a, b) duration=1.0s`
- IR:
  - `effect` の拡張とパラメータスキーマ化
  - 複数プロパティ同時補間の宣言規約
- runtime実装:
  - effect combinator（fade + move + blur など）の順序定義
  - easing の単一適用/個別適用ルール
- 互換方針:
  - 未対応effectは `FadeIn/FadeOut/Transform` へ段階的フォールバック

---

## Gallery追加ルール

新命令を導入したら、**命令ごとに最小DSLサンプルを gallery へ1件追加**する。

- 目的: 命令の実用性を可視化し、回帰検証の実例を残す。
- 最小要件:
  - 命令単体の最短ケース（副作用の少ない構成）
  - 期待挙動が視認できること
  - 可能なら既存命令との差分が分かること
- 推奨命名:
  - `<command>-minimal`（例: `camera-move-minimal`）

