---
name: v4-chapter-writing
description: 写或重写 deepseek-v4-book 项目下任意章节（chXX.html / appendix_*.html）时使用。强制"五件套"结构（名词速通卡 + 公式白话翻译 + 数值演练 + 真实 SVG demo + 论文图占位符），杜绝"论文翻译节选"风格。当用户说"写/重写/扩充 chXX"、"用 ch03 的风格补 chYY"、"按那套写法改这章"时触发。
---

# DeepSeek-V4 书章节写作 Skill

## 一句话使命

把"看起来像论文翻译节选"的章节升级为**读得下去的深度笔记** —— 让读者不用回头翻论文就能给同事白板讲清楚。

样板：[chapters/ch03.html](../../../chapters/ch03.html)。

---

## 五件套 Checklist（每章必须全有）

写完后逐条确认，**任何一条缺失都不算合格**：

- [ ] **① 名词速通卡**（章首必有）：把章节标题里的每个术语逐词拆解，包括缩写展开、关键概念定义、一句话定位
- [ ] **② 公式白话翻译**（每条核心公式必有）：公式后跟一个 `callout-info` 的 callout，用步骤化大白话复述这条公式在干嘛
- [ ] **③ 数值演练**（每个抽象量化论断必有）：举一组具体数字（`n_hc=4, d=7168, L=60, ‖B‖=1.05` 等）让读者看到字母对应的真实值
- [ ] **④ 真实 SVG/Canvas demo**（每章至少 1 个，理想 2-3 个）：交互式可视化替代空 `interactive-slot` —— 滑条、步进按钮、动画曲线
- [ ] **⑤ 论文图占位符**（缺真实图就用占位）：用 `fig-placeholder` 块描述要什么图，等用户补图后再替换

---

## 写作骨架（章节结构模板）

```
chapter-title + chapter-sub
├── 名词速通卡（term-card）             ← 必须
├── §1. 前一代怎么做 + 它为什么不够
│     └── 数值演练（numex）             ← 量化前一代痛点
├── §2. V4 怎么改（公式 + 符号表 + 形状）
│     └── 公式白话翻译（callout-info）   ← 必须
│     └── 数值演练 / 形状表附 V4 实际取值
├── §3. 为什么这能解决前面那个问题
│     └── 交互 demo（viz）              ← 必须 ≥1
│     └── 论文图占位（fig-placeholder）  ← 缺图就占位
├── §4. 关键算法细节（参数化 / 投影 / 数值技巧）
│     └── 公式白话翻译
│     └── 交互 demo（若适用）
├── §5. 代价 / 还没解决的问题（trade-off 列表）
└── 一句话总结（callout-info "把整章压成一句话"）
    + Mermaid 流程图（diagram-wrap）
```

每章字数：**1500-2500 字**正文（不含代码 / SVG），SVG 与代码不限。

---

## 各组件的 HTML 模板

### ① 名词速通卡

```html
<div class="term-card">
  <div class="term-eyebrow">名词速通 · 一分钟看懂 {缩写}</div>
  <p class="term-name">{缩写} = {全称英文}（{中译}）</p>
  <p>{一句话用白话说清这是干嘛的，可含 KaTeX}</p>
  <dl>
    <dt>{术语 1}（{英文 / 出处}）</dt>
    <dd>{解释；点出"为什么需要它"和"它的局限"}</dd>
    <dt>{术语 2}</dt>
    <dd>...</dd>
  </dl>
  <div class="term-tagline"><strong>一句话定位：</strong>{用一句话回答"它到底解决了什么"}</div>
</div>
```

**写法要点**：
- 至少 3 个术语（章节标题里出现的全部缩写都要拆）
- `dt` 后面带英文 / 论文作者年份，例如 `Hyper-Connection（HC，Zhu 2025）`
- `term-tagline` 里要回答"如果只能记一句话，是什么"

### ② 公式白话翻译

```html
<div class="math-block">
  $$
  X_{l+1} \;=\; B_l\, X_l \;+\; C_l\,F_l\!\big(A_l X_l\big)
  $$
</div>

<div class="callout callout-info">
  <div class="callout-title">📖 公式白话翻译</div>
  <p>{公式名} 翻成大白话就是 X 步：</p>
  <ol>
    <li><strong>{动作}</strong>：{符号项} —— {直觉解释}；</li>
    <li><strong>{动作}</strong>：{符号项} —— {直觉解释}；</li>
  </ol>
  <p>{一句总结这条公式相比前代多了什么自由度 / 解决了什么}</p>
</div>
```

**写法要点**：
- 标题永远带 `📖 公式白话翻译`（emoji 让眼睛快速定位）
- 拆成有序列表，每步对应公式里的一个组成部分
- 末尾一句话点睛"为什么这么写"

### ③ 数值演练

```html
<div class="numex">
  <span class="numex-tag">数值演练</span>
  假设 {场景前提}。则
  $${公式或量化推导}$$
  深度 $L=60$ 时 ${比率} \approx 1.05^{60} \approx \mathbf{18\times}$。
  也就是说，{白话总结这个数字意味着什么}。
</div>
```

或者用于"具体例子"型：

```html
<div class="numex">
  <span class="numex-tag">具体例子</span>
  一个合法的 $4\times 4$ 双随机矩阵：
  $$ M = \begin{pmatrix}...\end{pmatrix} $$
  每行加起来 $=1$，每列加起来 $=1$，谱范数 $\approx 0.91$。
  反例：{展示一个不合法的}。
</div>
```

**写法要点**：
- `numex-tag` 用"数值演练" / "具体例子" / "反例对照"
- 末尾必须有"也就是说，..." 的白话总结

### ④ 真实 SVG/Canvas demo

```html
<div class="viz" id="viz-{slug}">
  <div class="viz-head">
    <div class="viz-title">Demo · {简短描述}</div>
    <span class="viz-tag">交互</span>
  </div>
  <svg viewBox="0 0 720 320" id="{slug}-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- 静态背景 / 网格 / 坐标轴文字 -->
    <!-- 动态元素留 id 让 JS 操控 -->
    <path id="{slug}-line-A" d="" fill="none" stroke="#dc2626" stroke-width="2"/>
  </svg>
  <div class="viz-controls">
    <label>{参数名}
      <input type="range" id="{slug}-slider" min="..." max="..." step="..." value="..." style="width:200px">
    </label>
    <span class="viz-readout" id="{slug}-readout">…</span>
  </div>
  <p class="viz-caption">
    {操作提示}。<strong>{要观察的关键现象}</strong> —— {这个现象对应论文的什么论断}。
  </p>
</div>
```

JS 写在文件最后 `</body>` 前的内联 `<script>` 块（**不要**塞进 `app.js`，章节专用脚本本地化）：

```html
<script>
/* ---------- Viz: {slug} ---------- */
(function () {
  var slider = document.getElementById('{slug}-slider');
  // ...
  function update() { /* 重画 SVG */ }
  slider.addEventListener('input', update);
  update();
})();
</script>
```

### ⑤ 论文图占位符

```html
<div class="fig-placeholder">
  <div class="fig-tag">论文图占位</div>
  <p class="fig-want">需要：{具体到 figure 编号和内容；不要写"一张相关的图"}</p>
  <p class="fig-source">来源：{论文+图号}（待补）</p>
</div>
```

**写法要点**：
- `.fig-want` 必须明确到"X 论文 Figure Y 的 Z 现象"
- 不要超过两句话；用户照这个准备图

---

## SVG demo 设计原则

什么时候做 demo，做哪个不做哪个：

| 场景 | 做什么 demo | 不做什么 |
|---|---|---|
| 公式有<strong>可调参数</strong>且参数变化决定结果 | 滑条 + 实时重画曲线 | 静态截图 |
| 算法是<strong>迭代过程</strong>（Sinkhorn、PageRank、扩散） | 步进按钮 + 中间状态可视化 | 只画最终结果 |
| 概念是<strong>几何 / 拓扑</strong>（流形、注意力 mask、KV cache 布局） | 静态 SVG + 颜色编码 | 文字描述 |
| 时序 / 因果（Interleaved Thinking、流水线调度） | 横向时间轴 + 多 swimlane | mermaid 替代不够 |
| 概念已经<strong>足够直觉</strong>（softmax、点积） | 不做 | 不需要 demo |

**实施要点**：
- SVG 优先，Canvas 仅在像素级动画必要时用
- viewBox 统一 `720 × N`（响应式）
- 颜色：累积/危险用 `#dc2626`，正常/安全用 `#16a34a`，主体强调用 `accent` `#71a4e1`，背景 `#fafbfd`
- 字体：JetBrains Mono 用于数字 / 矩阵元素，Inter 用于注解
- log scale 必须标 `log scale` 在轴标
- `<input type="range">` 永远配 `<span class="viz-readout">` 实时显示当前值
- 按钮多个时给"重置"和"一键跑完"两个

---

## 论文图工作流

1. 写章节时：每个真该用图却没有图的位置 → 放 `<div class="fig-placeholder">`
2. 工作流细节见 [figures/README.md](../../../figures/README.md)
3. 用户准备好图 → Claude 用 Read 看图 → 按 `.fig-want` 描述匹配占位符 → 替换成：

```html
<figure class="paper-fig">
  <img src="../figures/ch{NN}/{filename}" alt="{短描述}">
  <figcaption>图 {N-N} · {图说，含来源}</figcaption>
</figure>
```

> 备注：当前 styles.css 没有 `.paper-fig` 类，按需追加（保持与 `<figure><img><figcaption>` 默认样式协调即可，参考 `.diagram-wrap` 样式）。

---

## 反例对照（这些写法当场拒绝）

| 反例 | 为什么不合格 | 正确做法 |
|---|---|---|
| `<h3>2. Foo</h3><p>Foo 是把 X 改成 Y...</p>` 直接开讲，没有名词卡 | 读者第一次看到 Foo 就懵 | 章首必有 term-card 拆词 |
| 公式后只跟 "其中 X 是 ...，Y 是 ..." 的逐字段说明 | 读者拼不出整体意思 | 加 `📖 公式白话翻译` callout，按动作步骤复述 |
| `<div class="interactive-slot">预留位：滑条 + 曲线</div>` | 占位符不是 demo | 必须真做 SVG/Canvas，slot 这个类已经废弃 |
| "实测 loss 改善明显" 没有具体数字 | 论断浮空 | 数值演练块给 `1.05^60 ≈ 18×` 这种锚点 |
| 全章只有 mermaid 一张图 | 视觉枯燥 | 至少配 1 个交互 demo + 必要时 fig-placeholder |
| 把章节专用 JS 塞进 `app.js` | 全局污染、加载顺序问题 | 章节 HTML 末尾内联 `<script>` 块 |
| 在 callout 里只重复"前面已经讲过的话" | 凑字数 | callout 必须给新角度（直觉、对比、反例） |

---

## 项目特定背景

- **CSS 类**（已就位，直接用）：`term-card`, `term-eyebrow`, `term-name`, `term-tagline`, `numex`, `numex-tag`, `fig-placeholder`, `fig-tag`, `fig-want`, `fig-source`, `viz`, `viz-head`, `viz-title`, `viz-tag`, `viz-controls`, `viz-btn`, `viz-readout`, `viz-caption`, `callout`, `callout-info`, `callout-warn`, `callout-good`, `math-block`, `config-table`, `diagram-wrap`, `caption`
- **数学渲染**：KaTeX auto-render，行内 `$...$`，行间 `$$...$$`，`<head>` 已 import
- **流程图**：Mermaid `<div class="mermaid">...</div>`，highlight 用 `classDef key fill:#71a4e1,stroke:#71a4e1,color:#fff`
- **章节脚本**：内联在 `</body>` 前；用 IIFE 隔离作用域；用 `getElementById` 防止与 app.js 冲突
- **侧边栏 / TOC**：由 app.js 自动从 `<h3 id="...">` 生成，章内 h3 必须带 `id` 属性
- **章节序号**：h3 用 "1.", "2.", ... 不带章号前缀（已统一）

---

## 完工自检脚本（写完跑一下）

```bash
# 检查五件套是否齐
grep -c "term-card\|callout-title.*白话翻译\|numex-tag\|<svg.*viewBox\|fig-placeholder" chapters/chXX.html
# 期待 ≥ 5（每件套至少 1 次）

# 检查没有遗留的废弃 interactive-slot
grep -c "interactive-slot" chapters/chXX.html
# 必须 = 0

# 检查 h3 都带 id
grep -c '<h3 id=' chapters/chXX.html
# 应该 = h3 总数
```
