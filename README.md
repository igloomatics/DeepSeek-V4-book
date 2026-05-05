# DeepSeek-V4 架构深度剖析

> 把 56 页技术报告拆成 20 章 + 2 附录，逐条把动机、公式、工程取舍讲透。

[在线阅读](https://igloomatics.github.io/DeepSeek-V4-book/) · [GitHub 仓库](https://github.com/igloomatics/DeepSeek-V4-book) · [DeepSeek-V4 技术报告 PDF](DeepSeek_V4.pdf)

## 这是什么

这不是论文翻译，也不是简介性博客。它是一份**面向"想搞懂为什么这么改"**的中文长文——

- **每章先讲前代为什么不够**，再讲新方案的动机、公式、超参取值与硬件取舍；
- **公式都配"白话翻译"**，符号都列形状与角色；
- **数值演练**把抽象 FLOPs / 字节算成具体数字；
- **每章一到三个交互式 SVG / Canvas 演示**，可拖动参数看输出怎么变；
- **论文原图**按 `§+Figure+页码` 引用，可随时翻原文核对。

## 谁该读

| 读者 | 推荐路线 | 工时 |
| --- | --- | --- |
| 想 5 分钟拿到 V4 全貌 | 摘要 → Ch01 演进地图 → 附录 A | 1 小时 |
| 长上下文 / 注意力研究 | Ch01 → Ch04 CSA → Ch05 HCA → Ch12 推理框架 | 半天 |
| 训练系统 / 优化器 | Ch01 → Ch03 mHC → Ch06 Muon → Ch08-11 基础设施 | 1 天 |
| 后训练 / RLHF / 蒸馏 | Ch01 → Ch16 后训练总览 → Ch18 OPD → Ch19 RL 框架 → Ch20 DSec | 1 天 |

`guide.html` 给出完整路线图与依赖关系图。

## 章节速查

### Part 1 · 架构（6 章）

- **Ch01** 演进地图——V1→V4 改了什么
- **Ch02** 高层架构总览（Transformer Block × L）
- **Ch03** mHC——把残差搬上 Birkhoff 多面体
- **Ch04** CSA——压缩 + 稀疏的二重奏（V4 长上下文命脉）
- **Ch05** HCA——把 m'≫m 个 token 压成一格
- **Ch06** Muon × Hybrid Newton-Schulz 优化器

### Part 2 · 基础设施（6 章）

- **Ch07** MegaMoE——通信完全藏在计算下面
- **Ch08** TileLang——写给 GPU 的方言
- **Ch09** 批不变 + 位级可复现内核库
- **Ch10** FP4 量化感知训练（QAT）
- **Ch11** 训练框架——mHC 的工程脚手架
- **Ch12** 推理框架——KV cache 的盘上池化

### Part 3 · 预训练（3 章）

- **Ch13** 32T tokens 数据 pipeline
- **Ch14** Anticipatory Routing + SwiGLU 钳位（loss spike 止血）
- **Ch15** Base 模型评测

### Part 4 · 后训练（5 章）

- **Ch16** 后训练总览——Specialist + GRM + Tool 接口
- **Ch17** 三档 reasoning effort 与 cold-start RL
- **Ch18** OPD——多教师 → 单学生的 reverse KL 蒸馏
- **Ch19** RL & OPD 基础设施
- **Ch20** DSec——代码沙箱与安全护城河

### 附录

- **附录 A** 评测结果（Codeforces Elo 3206、Putnam 120/120 等）
- **附录 B** 参数速查（L=61、d=7168、384 专家 / 激活 6 …）

## 本地预览

无需构建。打开 `index.html` 即可（推荐用一个静态服务器，避免本地 file:// 协议下的跨域问题）：

```bash
# Python 3
python3 -m http.server 8000
# 然后访问 http://localhost:8000/

# 或 Node.js
npx http-server -p 8000

# 或 VS Code 的 Live Server 插件
```

页面用：

- 原生 HTML / CSS / 一份 `app.js`，无打包工具；
- KaTeX（CDN）渲染数学公式；
- Mermaid（CDN）渲染流程图；
- 论文原图统一放在 `figures/<章节>/` 下。

## 目录结构

```
.
├── index.html              # 封面 + 全书地图
├── abstract.html           # 摘要与全景
├── guide.html              # 阅读指南 / 4 条学习路线
├── chapters/
│   ├── ch01.html – ch20.html
├── parts/
│   └── part1.html – part4.html
├── appendix_a.html         # 评测结果
├── appendix_b.html         # 参数速查
├── figures/                # 论文原图
│   ├── ch02/, ch03/, ...
│   └── README.md           # 配图工作流
├── DeepSeek_V4.pdf         # 技术报告原文
├── styles.css
├── app.js                  # 侧边栏 / 目录 / 主题切换
├── LICENSE                 # MIT
└── README.md
```

## 引用与版权

- **DeepSeek-V4 技术报告 / 模型权重**：归 DeepSeek-AI 所有，依其 LICENSE 使用；
- **本书文字、可视化、配套代码**：MIT License（见 `LICENSE`）。

转载本书任何章节请保留原文链接与作者署名。论文原图为引用使用，版权归原作者所有。

## 反馈

- 内容错误 / 公式错排 / 链接坏掉：欢迎在 GitHub Issue 直接报；
- 读完想补一章 / 加一个交互演示：欢迎 PR；
- 章节间发现互相打架的描述：贴出来一起讨论。

## 致谢

- DeepSeek-AI 团队公开模型权重与技术报告；
- 所有为 mHC、CSA、Muon、TileLang、3FS、EROFS、overlaybd、Firecracker 这些零部件做出贡献的前人——这份剖析能站住，是站在他们肩上。
