# Figures · 论文图资源仓库

每一章用到的真实论文图、外部示意图都存这里。Claude 写章节时只放 `<div class="fig-placeholder">` 占位符；你按规范把图扔进对应子目录后说一句"图齐了"，Claude 会自动把占位符替换成 `<figure>...</figure>`。

## 目录结构

```
figures/
├── ch03/
│   ├── 01-mhc-vs-hc-loss.png        # 序号-语义短名.png
│   ├── 02-activation-norm-depth61.png
│   └── source.md                     # 可选：每张图来源 / 论文页码 / 备注
├── ch04/
│   └── 01-csa-attention-pattern.png
└── ...
```

## 命名规范

- **子目录** = `ch{两位章号}/`，例如 `ch03/`、`ch17/`、`appendix_a/`
- **文件名** = `{两位序号}-{kebab-case 语义名}.{png|jpg|svg|gif}`
  - 序号：按章节里 `fig-placeholder` 自上而下出现的顺序，01 / 02 / 03 …
  - 语义名：英文小写中划线连接，例如 `mhc-vs-hc-loss`、`sinkhorn-convergence`、`activation-heatmap`
  - 格式：静态优先 PNG/SVG；动图用 GIF；矢量图用 SVG（更清晰、更小）

## source.md（可选，强烈建议）

每章子目录可放一个 `source.md`，记录：

```markdown
## 01-mhc-vs-hc-loss.png
- 来源：Xie 2026《Manifold-constrained Hyper-Connection》Figure 4
- 页码：p. 7
- 内容：HC vs mHC 训练 loss 在深度 61 的对比
- 替换占位符：ch03.html §4 后的 fig-placeholder（"mHC vs HC loss 对比"）
```

## 工作流

1. **Claude 写章节** → 章节 HTML 中留 `<div class="fig-placeholder">`，每个占位符的 `.fig-want` 描述要什么图、`.fig-source` 指向论文出处
2. **你准备图** → 按命名规范扔到对应子目录
3. **你说"ch03 图齐了"** → Claude 用 Read 工具看图，按 `.fig-want` 的描述匹配占位符，替换成 `<figure>...<img src="../figures/ch03/01-...png" alt="..."><figcaption>...</figcaption></figure>`
4. **若有疑义** → Claude 反过来贴出"我打算把 fig X 放到 placeholder Y"让你确认

## 当前已知需要的图

### ch03（mHC）

- `01-` · mHC 论文中"双随机矩阵 = 置换矩阵凸组合"的几何示意图，**或** V4 论文中 mHC vs HC 的训练 loss 曲线对比图（深度 61 实验）
- `02-` · V4 论文中"激活 / 梯度范数随层数变化"的对比图（标准 Pre-norm vs mHC 在深度 61）

后续章节铺开后会陆续追加到这一节。
