/* =============================================================
   DeepSeek-V4 架构深度剖析 · 多页 UI
   - 数据驱动侧栏（BOOK_TOC）
   - 当前页右栏 TOC（h2 / h3 自动收集）
   - 上一章 / 下一章 翻页
   - 主题切换（持久化 + Mermaid 重渲染）
   - 移动端折叠侧栏
   每个页面 <body> 上需要：
     data-base="" 或 "../"  —— 资源/链接前缀（root 用空，子目录用 ../）
     data-page="ch3"        —— 当前页 id，用来高亮
   ============================================================= */

const BOOK_TOC = [
  {
    section: "前言",
    items: [
      { num: "00", title: "封面 · Cover",                  href: "index.html",     id: "home"     },
      { num: "·",  title: "摘要与全景",                     href: "abstract.html",  id: "abstract" },
      { num: "·",  title: "阅读指南 — 学习路线图",           href: "guide.html",     id: "guide"    }
    ]
  },
  {
    section: "第一部分 · 架构",
    overview: { href: "parts/part1.html", id: "p1" },
    items: [
      { num: "01", title: "演进地图 — V1 到 V4 改了什么",          href: "chapters/ch01.html", id: "ch1"  },
      { num: "02", title: "DeepSeekMoE 与 MTP — V3 留下的两件遗产", href: "chapters/ch02.html", id: "ch2"  },
      { num: "03", title: "mHC — 残差通路的几何护栏",               href: "chapters/ch03.html", id: "ch3"  },
      { num: "04", title: "CSA — 长上下文的快通道",                 href: "chapters/ch04.html", id: "ch4"  },
      { num: "05", title: "HCA — 长上下文的全景镜",                 href: "chapters/ch05.html", id: "ch5"  },
      { num: "06", title: "Muon — 矩阵参数的指南针",                href: "chapters/ch06.html", id: "ch6"  }
    ]
  },
  {
    section: "第二部分 · 基础设施",
    overview: { href: "parts/part2.html", id: "p2" },
    items: [
      { num: "07", title: "MegaMoE — 让 all-to-all 消失",        href: "chapters/ch07.html", id: "ch7"  },
      { num: "08", title: "TileLang — 写给 GPU 的方言",           href: "chapters/ch08.html", id: "ch8"  },
      { num: "09", title: "批不变与确定性 — 训推一致的护身符",      href: "chapters/ch09.html", id: "ch9"  },
      { num: "10", title: "FP4 QAT — 显存的最后一刀",             href: "chapters/ch10.html", id: "ch10" },
      { num: "11", title: "训练框架 — mHC 的工程脚手架",           href: "chapters/ch11.html", id: "ch11" },
      { num: "12", title: "推理框架 — KV 的异构调度",              href: "chapters/ch12.html", id: "ch12" }
    ]
  },
  {
    section: "第三部分 · 预训练",
    overview: { href: "parts/part3.html", id: "p3" },
    items: [
      { num: "13", title: "32T Tokens — 预训练的活水",                  href: "chapters/ch13.html", id: "ch13" },
      { num: "14", title: "Anticipatory + SwiGLU — 长序列的稳定带",      href: "chapters/ch14.html", id: "ch14" },
      { num: "15", title: "Base 评测 — 出厂前的体检",                   href: "chapters/ch15.html", id: "ch15" }
    ]
  },
  {
    section: "第四部分 · 后训练",
    overview: { href: "parts/part4.html", id: "p4" },
    items: [
      { num: "16", title: "Specialist — 多面手的炼成",          href: "chapters/ch16.html", id: "ch16" },
      { num: "17", title: "Tool 接口三件套 — 工具调用的语法",     href: "chapters/ch17.html", id: "ch17" },
      { num: "18", title: "OPD — 多教师 → 单学生的合一",        href: "chapters/ch18.html", id: "ch18" },
      { num: "19", title: "RL / OPD 工程 — 后训练的发动机",      href: "chapters/ch19.html", id: "ch19" },
      { num: "20", title: "DSec — 代码沙箱与安全护城河",         href: "chapters/ch20.html", id: "ch20" }
    ]
  },
  {
    section: "附录",
    items: [
      { num: "A", title: "评测结果 — Benchmark 与真实任务", href: "appendix_a.html", id: "appendix_a" },
      { num: "B", title: "参数速查",                       href: "appendix_b.html", id: "appendix_b" }
    ]
  }
];

/* 把 TOC 拍平，方便上一章/下一章；overview 在每个 section 头部 */
const FLAT_TOC = BOOK_TOC.flatMap(s => [
  ...(s.overview ? [{ ...s.overview, num: "·", title: s.section, kind: "overview" }] : []),
  ...s.items
]);

/* DeepSeek 品牌图标（path 取自官方 SVG，使用 currentColor 跟随主题） */
const BRAND_SVG = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="currentColor" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"/>
  </svg>`;

(function () {
  const root = document.documentElement;
  const body = document.body;
  const base = body.dataset.base || "";
  const pageId = body.dataset.page || "";

  /* ---------- Sidebar render ---------- */
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    const brand = `
      <a href="${base}index.html" class="brand" aria-label="返回封面">
        <span class="brand-logo" aria-hidden="true">${BRAND_SVG}</span>
        <span class="brand-meta">
          <span class="brand-title">DeepSeek-V4</span>
          <span class="brand-sub">架构深度剖析</span>
        </span>
      </a>`;

    const sectionsHtml = BOOK_TOC.map(s => {
      const links = s.items.map(it => {
        const href = base + it.href;
        const active = it.id === pageId ? " active" : "";
        return `<a href="${href}" class="side-link${active}">
                  <span class="num">${it.num}</span><span>${it.title}</span>
                </a>`;
      }).join("");
      const head = s.overview
        ? `<a href="${base + s.overview.href}" class="side-section-head is-overview${s.overview.id === pageId ? " active" : ""}" title="目标 + 小结">
             <span class="side-title">${s.section}</span>
             <span class="side-section-arrow" aria-hidden="true">›</span>
           </a>`
        : `<div class="side-section-head"><span class="side-title">${s.section}</span></div>`;
      return `<div class="side-section">
                ${head}
                ${links}
              </div>`;
    }).join("");

    const footer = `
      <div class="side-bottom">
        <div class="side-controls">
          <button id="theme-toggle" class="icon-btn" aria-label="切换主题" title="切换主题">☾</button>
          <a class="gh-btn" href="https://github.com/deepseek-ai" target="_blank" rel="noopener">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            GitHub
          </a>
        </div>
        <div class="side-foot">Igloos</div>
      </div>`;

    sidebar.innerHTML = `${brand}<div class="side-scroll">${sectionsHtml}</div>${footer}`;

    // Auto-scroll active link into view
    requestAnimationFrame(() => {
      const active = sidebar.querySelector(".side-link.active, .side-section-head.active");
      if (active) active.scrollIntoView({ block: "center", behavior: "instant" });
    });
  }

  /* ---------- Theme ---------- */
  const themeBtn = document.getElementById("theme-toggle");
  const setTheme = (t) => {
    root.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.textContent = t === "dark" ? "☀" : "☾";
    try { localStorage.setItem("dsv4-theme", t); } catch (_) {}

    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: t === "dark" ? "dark" : "default",
        fontFamily: "Inter, sans-serif",
        // 关闭 useMaxWidth：让图按自然尺寸渲染、容器横向滚动
        // 否则 LR 流程图会被压成"宽不够、纵向堆叠"的窄长条
        flowchart: { useMaxWidth: false, htmlLabels: true, curve: "basis", nodeSpacing: 40, rankSpacing: 50 },
        sequence: { useMaxWidth: false },
        gantt:    { useMaxWidth: false },
        themeVariables: t === "dark"
          ? { background: "#10151e", primaryColor: "#1a2130", primaryBorderColor: "#71a4e1",
              primaryTextColor: "#e8ecf3", lineColor: "#5b6b85", tertiaryColor: "#0f1115" }
          : { background: "#ffffff", primaryColor: "#f5f6f8", primaryBorderColor: "#71a4e1",
              primaryTextColor: "#1f2532", lineColor: "#9aa1ad" }
      });
      document.querySelectorAll(".mermaid").forEach(el => {
        if (el.dataset.source) el.textContent = el.dataset.source;
        el.removeAttribute("data-processed");
      });
      window.mermaid.run({ querySelector: ".mermaid" });
    }
  };

  document.querySelectorAll(".mermaid").forEach(el => {
    el.dataset.source = el.textContent;
  });

  // ========== 流程图点击放大 ==========
  // 点 .diagram-wrap → 全屏 modal；ESC 或点背景 → 关闭
  let zoomBackdrop = null;
  function closeZoom() {
    document.querySelectorAll(".diagram-zoomed").forEach(el => el.classList.remove("diagram-zoomed"));
    if (zoomBackdrop) { zoomBackdrop.remove(); zoomBackdrop = null; }
    document.documentElement.style.overflow = "";
  }
  document.addEventListener("click", e => {
    const wrap = e.target.closest(".diagram-wrap");
    if (!wrap) return;
    if (wrap.classList.contains("diagram-zoomed")) {
      closeZoom();
    } else {
      closeZoom();  // 关掉其它先
      wrap.classList.add("diagram-zoomed");
      zoomBackdrop = document.createElement("div");
      zoomBackdrop.className = "diagram-zoom-backdrop";
      zoomBackdrop.addEventListener("click", closeZoom);
      document.body.appendChild(zoomBackdrop);
      document.documentElement.style.overflow = "hidden";
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeZoom();
  });

  let saved = "light";
  try { saved = localStorage.getItem("dsv4-theme") || "light"; } catch (_) {}
  setTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme");
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Mobile sidebar ---------- */
  const layout = document.getElementById("layout");
  const hamburger = document.getElementById("hamburger");
  if (hamburger && layout) {
    hamburger.addEventListener("click", () => layout.classList.toggle("opened"));
  }
  document.addEventListener("click", e => {
    const link = e.target.closest(".side-link, .side-section-head.is-overview");
    if (link && window.innerWidth <= 860 && layout) layout.classList.remove("opened");
  });

  /* ---------- Right rail TOC (h2/h3 from current article) ---------- */
  const tocList = document.getElementById("toc-list");
  const article = document.querySelector("main .chapter, main .page-body");
  if (tocList && article) {
    const heads = article.querySelectorAll("h2, h3");
    if (heads.length) {
      heads.forEach((h, i) => {
        if (!h.id) h.id = "h-" + i;
        const cls = h.tagName === "H2" ? "lvl-2" : "lvl-3";
        const li = document.createElement("li");
        li.innerHTML = `<a href="#${h.id}" class="${cls}">${h.textContent}</a>`;
        tocList.appendChild(li);
      });
      const tocLinks = tocList.querySelectorAll("a");
      const onScroll = () => {
        let activeIdx = 0;
        heads.forEach((h, idx) => {
          const r = h.getBoundingClientRect();
          if (r.top <= 96) activeIdx = idx;
        });
        tocLinks.forEach((a, idx) => a.classList.toggle("active", idx === activeIdx));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else {
      tocList.parentElement.style.display = "none";
    }
  }

  /* ---------- Prev / Next ---------- */
  const navMount = document.getElementById("page-nav");
  if (navMount && pageId) {
    const idx = FLAT_TOC.findIndex(it => it.id === pageId);
    const prev = idx > 0 ? FLAT_TOC[idx - 1] : null;
    const next = idx >= 0 && idx < FLAT_TOC.length - 1 ? FLAT_TOC[idx + 1] : null;
    const cell = (it, side) => it
      ? `<a class="page-nav-${side}" href="${base}${it.href}">
           <span class="page-nav-label">${side === "prev" ? "← 上一节" : "下一节 →"}</span>
           <span class="page-nav-title">${it.num !== "·" ? it.num + " · " : ""}${it.title}</span>
         </a>`
      : `<span class="page-nav-${side} page-nav-empty"></span>`;
    navMount.innerHTML = cell(prev, "prev") + cell(next, "next");
  }

  /* ---------- Glossary tooltips ---------- */
  /* 鼠标悬浮显示专有名词的基本释义。每页只高亮每个术语的首次出现。
     在 KaTeX / Mermaid / 标题 / 链接 / 代码块内不会触发，避免视觉与渲染冲突。*/
  const GLOSSARY = {
    /* ===== LLM 基础 ===== */
    "KV cache": "Key-Value 缓存。Transformer 推理时每个 token 已算好的 K/V 张量被存下来供后续 token 复用，避免重复计算；显存占用与上下文长度成正比。",
    "KV Cache": "Key-Value 缓存。Transformer 推理时每个 token 已算好的 K/V 张量被存下来供后续 token 复用；显存占用与上下文长度成正比。",
    "PPL": "Perplexity，困惑度。语言模型在测试集上的几何平均不确定度，PPL = exp(交叉熵)。值越低越好。",
    "FLOPs": "Floating Point Operations，浮点运算次数。衡量模型计算量的标准单位；'每 token FLOPs' 是评估推理算力消耗的核心指标。",
    "FLOPS": "Floating Point Operations per Second，每秒浮点运算次数。算力指标；与 FLOPs（运算次数）的区别在于带时间维度。",
    "FFN": "Feed-Forward Network，前馈网络。Transformer 中位于注意力之后的两层 MLP，通常占模型 2/3 参数量。",
    "tokenizer": "分词器。把原始文本切分成 token id 序列；DeepSeek-V4 使用 152K 词表的 BPE tokenizer。",
    "transformer": "Transformer 架构。基于自注意力 + FFN 堆叠的序列模型，由 Vaswani 2017 提出。",

    /* ===== 注意力家族 ===== */
    "MHA": "Multi-Head Attention，多头注意力。h 个头各自独立计算 QKV 注意力，是原始 Transformer 的方案。",
    "MQA": "Multi-Query Attention。所有头共享同一份 K/V，KV 显存降到 1/h，但表达力损失明显。",
    "GQA": "Grouped Query Attention。每组头共享一份 K/V（介于 MHA 与 MQA 之间），是 LLaMA-2 等模型的事实标准。",
    "MLA": "Multi-head Latent Attention。DeepSeek-V2 提出的 KV 低秩压缩注意力，将 K/V 投影到低维潜变量空间，KV cache 降至原来 ~1/4。",
    "DSA": "DeepSeek Sparse Attention。V3.2 上线的稀疏注意力前身，是 V4 CSA 的祖先。",
    "CSA": "Compressed Sparse Attention。V4 核心注意力之一：每 m=4 个 token 压成一个超 KV，再用 Lightning Indexer 选 top-k=1024 个超 KV。",
    "HCA": "Heavy Compressed Attention。V4 另一注意力分支：每 m'=128 个 token 压成一个重超 KV，对全部重超 KV 做稠密注意力，管全局摘要。",
    "RoPE": "Rotary Position Embedding。通过对 Q/K 做位置相关的旋转矩阵乘法注入相对位置信息，是当前主流 LLM 的位置编码方案。",
    "YaRN": "Yet another RoPE eNhancement。RoPE 频率缩放外推方法，把训练时的位置编码线性 + NTK 插值到更长上下文。",
    "NTK": "Neural Tangent Kernel。这里特指 NTK-aware RoPE 外推，按频率分段调整缩放比例避免高频丢失。",
    "Attention Sink": "Xiao 等 2023 发现的现象：Transformer 倾向于把大量 softmax 注意力分配给前几个 token；V4 用虚拟 sink key 让 softmax 'abstain'。",
    "Lightning Indexer": "V4 CSA 中用来选 top-k 超 KV 的轻量索引网络，使用 ReLU 而非 softmax 来打分。",
    "needle-in-haystack": "长上下文测试方法：在海量无关文本中插入一句关键信息，测模型能否检索到。是评估外推质量的金标准。",

    /* ===== 归一化 / 激活 ===== */
    "RMSNorm": "Root Mean Square Normalization。LayerNorm 的简化版，只用 RMS 不减均值，减少一次均值计算且效果相当。",
    "LayerNorm": "层归一化。对每个样本的特征维做均值方差归一化。",
    "softmax": "把任意实数向量转换为概率分布的函数：σ(x_i) = exp(x_i) / Σⱼ exp(x_j)。",
    "Softplus": "光滑版 ReLU：Softplus(x) = log(1 + e^x)。值域 (0, +∞)，光滑可导且不饱和。",
    "Sigmoid": "S 形函数：σ(x) = 1/(1 + e^{-x})。值域 (0,1)，但 logit 大时严重饱和。",
    "ReLU": "Rectified Linear Unit：max(0, x)。最常用的激活函数。",
    "SwiGLU": "Swish-Gated Linear Unit。LLaMA 系列采用的 FFN 激活：(Swish(xW₁)) ⊙ (xW₃)，比 GeLU/ReLU 略胜。",
    "logit": "softmax 之前的原始打分（log-odds）。模型直接输出 logit，再经 softmax 转概率。",

    /* ===== MoE 家族 ===== */
    "MoE": "Mixture of Experts，混合专家。FFN 层不再是单一稠密网络，而是 N 个并行专家中由路由器选 top-k 个激活，激活参数 ≪ 总参数。",
    "DeepSeekMoE": "DeepSeek 的细粒度 MoE 设计：把大专家切成 N·s 个小专家、增加 1 个 always-on 共享专家、改用 aux-loss-free 负载均衡。",
    "MegaMoE": "V4 的 MoE 训练系统：把专家切成 wave，让 all-to-all 通信完全藏在计算下面。",
    "aux-loss-free": "DeepSeek-V3 的负载均衡方案：给每个专家加一个动态偏置 b_i，按'被分到的 token 数'在线更新；不动主 loss。",
    "all-to-all": "MoE 通信原语：每个 GPU 把不同 token 发给不同 expert 所在 GPU，然后再收回结果。是 MoE 训练的最大通信瓶颈。",
    "top-k": "在 N 个候选中选打分最高的 k 个。MoE 路由、CSA 索引器都用此操作。",
    "Anticipatory Routing": "V4 预训练时的稳定性技术：让路由器预读未来若干步的路由信号，避免长序列内 router 抖动。",
    "SwiGLU Clamping": "V4 预训练时的稳定性技术：对 SwiGLU 激活做钳位，防止长序列内 FFN 激活值爆炸。",

    /* ===== 残差 / mHC ===== */
    "mHC": "manifold-constrained Hyper-Connection。把 Hyper-Connection 的混合矩阵约束在 Birkhoff 多面体上的 V4 残差通路。",
    "Hyper-Connection": "把残差从单通道扩展为 n_hc 个并行通道的混合连接（Z. Zhu 等 2024）。",
    "Birkhoff 多面体": "所有 n×n 双随机矩阵（行和=列和=1，元素 ≥ 0）构成的凸多面体。其顶点恰为置换矩阵，是 mHC 的几何约束空间。",
    "Sinkhorn-Knopp": "把任意非负矩阵交替做行归一化与列归一化，迭代收敛到双随机矩阵；mHC 用 ~20 次迭代投影到 Birkhoff 多面体。",

    /* ===== 优化器 ===== */
    "AdamW": "Adam + 解耦权重衰减。当前 LLM 训练事实标准，但对矩阵参数做逐元素更新，丢失了谱结构信息。",
    "Muon": "矩阵感知优化器。对动量项做极分解取出方向矩阵，让更新方向是奇异值全为 1 的正交矩阵，各方向同步收敛。",
    "Newton-Schulz": "Newton-Schulz 迭代。用 5 次多项式近似计算矩阵的极分解，避免直接做 SVD，是 Muon 的核心数值步骤。",

    /* ===== 训练范式 ===== */
    "MTP": "Multi-Token Prediction。让模型一次同时预测下 1、2、…、D 个 token，提升训练梯度密度并迫使 hidden state 编码更长程信息。",
    "SFT": "Supervised Fine-Tuning，有监督微调。用人工标注的 (prompt, response) 对让预训练模型学习对话/指令格式。",
    "RLHF": "Reinforcement Learning from Human Feedback。从人类反馈学习的 RL 范式：先训奖励模型再用 PPO 等优化策略。",
    "PPO": "Proximal Policy Optimization。RLHF 默认 RL 算法，用 clip 约束策略更新幅度。",
    "GRPO": "Group Relative Policy Optimization。DeepSeek 提出的 RL 算法：用同一 prompt 多次采样的相对优势替代 critic，省掉价值网络。",
    "OPD": "On-Policy Distillation，在线策略蒸馏。V4 后训练核心：学生自采样 rollout、教师对学生 rollout 打全词表 logit、做 reverse KL 蒸馏。",
    "reverse KL": "反向 KL：KL(学生‖教师)。Mode-seeking，让学生聚焦教师高概率区间，避免 forward KL 的'分布抹平'。",
    "KL": "Kullback-Leibler divergence，KL 散度。衡量两个概率分布差异的非对称度量：KL(P‖Q) = Σ P log(P/Q)。",

    /* ===== 量化 ===== */
    "BF16": "Brain Floating Point 16-bit。比 FP16 多 3 个指数位、少 3 个尾数位，动态范围更大，是 LLM 训练事实标准。",
    "FP16": "IEEE 半精度浮点，16 bit。",
    "FP8": "8-bit 浮点。E4M3 / E5M2 两种格式，省一半显存与带宽，DeepSeek-V3 已实战化。",
    "FP4": "4-bit 浮点。比 FP8 再压一半，V4 用 QAT 让权重原生 FP4。",
    "INT8": "8-bit 整型量化，传统部署量化方案。",
    "QAT": "Quantization-Aware Training，量化感知训练。训练时模拟量化误差，让模型适应低精度部署，避免 PTQ 的精度损失。",

    /* ===== 评测 ===== */
    "Codeforces Elo": "Codeforces 在线编程比赛的 Elo 评分体系。Top 选手 ~3500，V4-Pro 拿到 3206。",
    "Putnam-2025": "2025 年 Putnam 数学竞赛。V4-Pro 在该形式化推理基准上拿下 120/120 完美分数。",

    /* ===== V4 系统 ===== */
    "DSec": "DeepSeek Secure。V4 用于代码沙箱与工具调用安全的单集群 10w+ sandbox 平台。",
    "TileLang": "V4 的内核 DSL：用 tile-level 抽象写 GPU kernel，比 Triton 更贴近 NVIDIA 硬件。",
    "Specialist": "Specialist Model。V4 后训练阶段为每个能力域（数学/代码/推理/对话/安全等）训一个专家教师模型，再蒸馏到统一学生。",
    "GRM": "Generative Reward Model，生成式奖励模型。V4 用 GRM 替代标量奖励模型，让 reward 自带链式思考。"
  };

  function applyGlossary() {
    const article = document.querySelector("main .chapter, main .page-body");
    if (!article) return;

    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    if (!terms.length) return;

    const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    /* ASCII（含空格、连字符、点）的术语在两端加 \b 避免匹配单词内部；含中文/特殊字符的术语直接匹配字面 */
    const isAsciiish = s => /^[\x00-\x7F]+$/.test(s);
    const branches = terms.map(t => {
      const e = escape(t);
      return isAsciiish(t) ? "\\b" + e + "\\b" : e;
    });
    const re = new RegExp("(" + branches.join("|") + ")", "g");

    /* 跳过这些容器：避免破坏代码、math、mermaid、标题、链接、面包屑 */
    const SKIP_TAGS = new Set([
      "CODE", "PRE", "SCRIPT", "STYLE",
      "H1", "H2", "H3", "H4", "H5", "H6",
      "A", "ABBR", "BUTTON", "TEXTAREA", "INPUT", "SUMMARY"
    ]);
    const SKIP_CLASSES = [
      "katex", "katex-display", "katex-html",
      "mermaid", "diagram-wrap",
      "gloss", "algo", "interactive-slot",
      "crumb", "chapter-eyebrow", "chapter-title", "chapter-sub", "caption",
      "page-nav", "side-link", "side-section-head", "brand"
    ];

    const shouldSkip = node => {
      let p = node.parentNode;
      while (p && p.nodeType === 1) {
        if (SKIP_TAGS.has(p.tagName)) return true;
        const cn = (typeof p.className === "string") ? p.className
                 : (p.className && p.className.baseVal) || "";
        if (cn) {
          const list = cn.split(/\s+/);
          for (const c of SKIP_CLASSES) if (list.indexOf(c) !== -1) return true;
        }
        if (p === article) break;
        p = p.parentNode;
      }
      return false;
    };

    const seen = new Set();
    const findKey = term => {
      if (GLOSSARY[term]) return term;
      const lo = term.toLowerCase();
      for (const k of terms) if (k.toLowerCase() === lo) return k;
      return term;
    };

    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let cur;
    while ((cur = walker.nextNode())) nodes.push(cur);

    for (const text of nodes) {
      const v = text.nodeValue;
      re.lastIndex = 0;
      if (!re.test(v)) continue;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(v))) {
        if (m.index > last) frag.appendChild(document.createTextNode(v.slice(last, m.index)));
        const term = m[0];
        const key = term.toLowerCase();
        if (seen.has(key)) {
          frag.appendChild(document.createTextNode(term));
        } else {
          seen.add(key);
          const span = document.createElement("span");
          span.className = "gloss";
          span.setAttribute("tabindex", "0");
          span.setAttribute("data-def", GLOSSARY[findKey(term)]);
          span.textContent = term;
          frag.appendChild(span);
        }
        last = m.index + term.length;
      }
      if (last < v.length) frag.appendChild(document.createTextNode(v.slice(last)));
      text.parentNode.replaceChild(frag, text);
    }
  }

  /* 单一全局气泡：fixed 定位 + JS 视口钳位，绕开祖先 overflow 裁剪 */
  function setupGlossaryTooltip() {
    let tip = document.querySelector(".gloss-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "gloss-tip";
      document.body.appendChild(tip);
    }
    let active = null;

    const place = el => {
      const def = el.getAttribute("data-def");
      if (!def) return;
      tip.textContent = def;
      /* 先复位 transform/visibility 以测量实际尺寸 */
      tip.style.left = "0px";
      tip.style.top = "0px";
      tip.classList.add("visible");

      const r = el.getBoundingClientRect();
      const tr = tip.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 10;

      let left = r.left + r.width / 2 - tr.width / 2;
      if (left < margin) left = margin;
      if (left + tr.width > vw - margin) left = vw - margin - tr.width;

      let top = r.top - tr.height - 10;
      if (top < margin) top = r.bottom + 10;
      /* 万一上下都装不下，固定在顶部边距 */
      if (top + tr.height > vh - margin) top = Math.max(margin, vh - margin - tr.height);

      tip.style.left = left + "px";
      tip.style.top = top + "px";
    };

    const show = el => { active = el; place(el); };
    const hide = () => { active = null; tip.classList.remove("visible"); };

    document.addEventListener("mouseover", e => {
      const t = e.target.closest && e.target.closest(".gloss");
      if (t && t !== active) show(t);
    });
    document.addEventListener("mouseout", e => {
      const t = e.target.closest && e.target.closest(".gloss");
      if (!t) return;
      const to = e.relatedTarget;
      if (to && to.closest && to.closest(".gloss") === t) return;
      hide();
    });
    document.addEventListener("focusin", e => {
      const t = e.target.closest && e.target.closest(".gloss");
      if (t) show(t);
    });
    document.addEventListener("focusout", e => {
      const t = e.target.closest && e.target.closest(".gloss");
      if (t) hide();
    });
    window.addEventListener("scroll", () => { if (active) hide(); }, { passive: true });
    window.addEventListener("resize", () => { if (active) hide(); });
  }

  /* 等 KaTeX / Mermaid 渲染完再扫描，避免破坏数学排版 */
  function bootGlossary() {
    applyGlossary();
    setupGlossaryTooltip();
  }
  if (document.readyState === "complete") {
    setTimeout(bootGlossary, 0);
  } else {
    window.addEventListener("load", () => setTimeout(bootGlossary, 50));
  }
})();
