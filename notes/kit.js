/* 움직이는 그림 공용 틀 — 바이브코딩 IT 기본지식 (2026-10-18)
   한 파일, 두 모드.
   · 시청자 모드: 「설명 따라 보기」(▶ 재생 · 단계 넘기기) + 「직접 해 보기」(조작). GitHub Pages.
   · 영상 모드: window.__VIDEO__ = {anim, beats:[단계별 시작 초], pal, sec, lec} 가 페이지보다 먼저 있으면
     1920×1080 화면에 그 애니메이션 하나만 그리고, window.__seek(초)로 그 순간의 화면을 만든다.
     렌더러(제작도구/it_anim_render.js)가 프레임마다 __seek 를 부르므로 내레이션 길이와 움직임이 정확히 맞는다.
   애니메이션 정의 IT.define({
     id, fig, title, sec, view:[w, h], blank:{상태}, rest:단계번호,
     steps:[{tag, say, set:{바뀌는 상태}, dur:전환초}],
     layout(state, t) → {도형 id: 도형},   // t = 초(반복 움직임용). 같은 state·t 면 늘 같은 그림
     sandbox:{init, derive?, controls:[{id, label(s), act(s, now), off?(s)}], status(s)}
   })
   도형: {type:'rect'|'circle'|'text'|'line'|'path', z:층(0~5), op, 숫자 값은 보간, 글자·색·d 는 중간에 바뀜,
         from:{…} 나타날 때 시작 모습, to:{…} 사라질 때 끝 모습}. 색은 토큰 이름("hw")이나 "#hex"/"none". */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (p) => { p = clamp(p, 0, 1); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  const lerp = (a, b, p) => a + (b - a) * p;
  const NUM = ["x", "y", "w", "h", "rx", "r", "cx", "cy", "x1", "y1", "x2", "y2", "op", "size", "sw", "rot", "sc", "off", "len", "draw"];
  const DISC = ["text", "fill", "stroke", "d", "anchor", "weight", "font", "dash", "mark", "cls", "href"];
  const DEFS = {}; const ORDER = [];
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;

  function el(tag, attrs) { const n = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function col(c) { if (c == null) return null; if (c === "none" || c === "transparent" || c[0] === "#" || c.startsWith("rgb")) return c; return `var(--${c})`; }

  const DEF0 = { sc: 1, rot: 0, op: 1, draw: 1, off: 0 };   // 한쪽에만 있는 값은 기본값으로 돌아간다(from:{sc:.5} → 끝은 1)
  function interp(a, b, p) {
    const o = Object.assign({}, b);
    for (const k of NUM) if (k in a || k in b) o[k] = lerp(k in a ? a[k] : (k in DEF0 ? DEF0[k] : b[k]), k in b ? b[k] : (k in DEF0 ? DEF0[k] : a[k]), p);
    for (const k of DISC) if (k in a || k in b) o[k] = p < 0.5 ? (k in a ? a[k] : b[k]) : (k in b ? b[k] : a[k]);
    if (b.type === "dot") {   // 길을 따라가는 점: 길이 바뀌면 새 길의 처음(u=0)부터 출발
      if (a.pid !== b.pid) { o.path = b.path; o.pid = b.pid; o.u = lerp(0, b.u == null ? 1 : b.u, p); }
      else o.u = lerp(a.u == null ? 1 : a.u, b.u == null ? 1 : b.u, p);
    }
    return o;
  }
  /* 꺾은선 도우미: 점 목록 → path d · 길이 · u(0~1) 위치 */
  function poly(pts) { return pts.map((q, i) => (i ? "L" : "M") + q[0] + "," + q[1]).join(" "); }
  function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function pat(pts, u) {
    const L = plen(pts) * clamp(u, 0, 1); let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + d >= L) { const f = d ? (L - acc) / d : 0; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; }
      acc += d;
    }
    return pts[pts.length - 1];
  }
  function blend(A, B, p) {
    if (p >= 1) { const o = {}; for (const id in B) o[id] = B[id]; return o; }
    if (p <= 0) { const o = {}; for (const id in A) o[id] = A[id]; return o; }
    const out = {}; const ids = new Set([...Object.keys(A), ...Object.keys(B)]);
    for (const id of ids) {
      const a = A[id], b = B[id]; const lag = (b && b.lag) || (a && a.lag) || 0;
      const p0 = p; p = lag ? clamp((p0 - lag) / (1 - lag), 0, 1) : p0;
      if (a && b && a.type === b.type) out[id] = interp(a, b, p);
      else if (b) { const f = Object.assign({}, b, b.from || {}); if (!(b.from && "op" in b.from)) f.op = 0; out[id] = interp(f, b, p); }
      else if (a) { const t = Object.assign({}, a, a.to || {}); if (!(a.to && "op" in a.to)) t.op = 0; out[id] = interp(a, t, p); }
      p = p0;
    }
    return out;
  }

  class Scene {
    constructor(svg, view) {
      this.svg = svg; this.nodes = new Map(); this.layers = []; this.pre = `k${++uid}`;
      svg.setAttribute("viewBox", `0 0 ${view[0]} ${view[1]}`);
      const defs = el("defs");
      for (const c of ["hw", "sw", "hot", "ink", "muted", "alert"]) {
        const m = el("marker", { id: `${this.pre}-ah-${c}`, viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
        const pth = el("path", { d: "M0,0 L10,5 L0,10 z" }); pth.style.fill = col(c); m.appendChild(pth); defs.appendChild(m);
      }
      svg.appendChild(defs);
      for (let i = 0; i < 6; i++) { const g = el("g"); svg.appendChild(g); this.layers.push(g); }
    }
    make(s) { const n = el(s.type === "dot" ? "circle" : s.type); n._t = s.type; return n; }
    apply(n, s) {
      const t = s.type; const op = s.op == null ? 1 : clamp(s.op, 0, 1);
      n.style.opacity = op < 0.002 ? 0 : op; n.style.display = op < 0.002 ? "none" : "";
      if (t === "dot") { const q = pat(s.path || [[0, 0]], s.u == null ? 1 : s.u); n.setAttribute("cx", q[0]); n.setAttribute("cy", q[1]); n.setAttribute("r", Math.max(0, s.r || 10)); }
      else if (t === "image") { n.setAttribute("x", s.x); n.setAttribute("y", s.y); n.setAttribute("width", s.w); n.setAttribute("height", s.h); if (n._href !== s.href) { n.setAttributeNS("http://www.w3.org/1999/xlink", "href", s.href); n.setAttribute("href", s.href); n._href = s.href; } n.setAttribute("preserveAspectRatio", "xMidYMid meet"); }
      else if (t === "rect") { n.setAttribute("x", s.x); n.setAttribute("y", s.y); n.setAttribute("width", Math.max(0, s.w)); n.setAttribute("height", Math.max(0, s.h)); n.setAttribute("rx", s.rx || 0); }
      else if (t === "circle") { n.setAttribute("cx", s.cx); n.setAttribute("cy", s.cy); n.setAttribute("r", Math.max(0, s.r)); }
      else if (t === "line") { n.setAttribute("x1", s.x1); n.setAttribute("y1", s.y1); n.setAttribute("x2", s.x2); n.setAttribute("y2", s.y2); }
      else if (t === "path") { if (n._d !== s.d) { n.setAttribute("d", s.d); n._d = s.d; } }
      else if (t === "text") {
        n.setAttribute("x", s.x); n.setAttribute("y", s.y);
        n.setAttribute("text-anchor", s.anchor || "start");
        n.style.fontSize = (s.size || 24) + "px"; n.style.fontWeight = s.weight || 500;
        n.setAttribute("class", (s.font === "mono" ? "t-mono" : "t-sans") + (s.cls ? " " + s.cls : ""));
        const txt = s.text == null ? "" : String(s.text);
        if (n._txt !== txt) {
          n._txt = txt; while (n.firstChild) n.removeChild(n.firstChild);
          const lines = txt.split("\n");
          lines.forEach((ln, i) => { const ts = el("tspan", { x: s.x, dy: i ? "1.25em" : "0" }); ts.textContent = ln; n.appendChild(ts); });
        } else if (n.firstChild && n.firstChild.getAttribute && n.firstChild.getAttribute("x") != String(s.x)) {
          for (const ts of n.childNodes) ts.setAttribute("x", s.x);
        }
      }
      n.style.fill = t === "line" ? "none" : (col(s.fill) || (t === "text" ? "var(--fg)" : "none"));
      n.style.stroke = col(s.stroke) || "none";
      n.style.strokeWidth = s.sw == null ? 0 : s.sw;
      if (s.draw != null && s.len) { n.style.strokeDasharray = `${s.len} ${s.len}`; n.style.strokeDashoffset = s.len * (1 - clamp(s.draw, 0, 1)); }
      else { n.style.strokeDasharray = s.dash || ""; n.style.strokeDashoffset = s.off || 0; }
      n.style.strokeLinecap = "round"; n.style.strokeLinejoin = "round";
      if (s.mark) n.setAttribute("marker-end", `url(#${this.pre}-ah-${s.mark})`); else n.removeAttribute("marker-end");
      const rot = s.rot || 0, sc = s.sc == null ? 1 : s.sc;
      if (rot || sc !== 1) {
        const cx = t === "rect" ? s.x + s.w / 2 : t === "circle" ? s.cx : s.ox != null ? s.ox : s.x;
        const cy = t === "rect" ? s.y + s.h / 2 : t === "circle" ? s.cy : s.oy != null ? s.oy : s.y;
        n.setAttribute("transform", `translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(${-cx} ${-cy})`);
      } else n.removeAttribute("transform");
    }
    draw(specs) {
      const seen = new Set();
      for (const id in specs) {
        const s = specs[id]; if (!s) continue; seen.add(id);
        let n = this.nodes.get(id);
        if (!n || n._t !== s.type) { if (n) n.remove(); n = this.make(s); this.nodes.set(id, n); }
        const layer = this.layers[clamp(s.z || 0, 0, 5)];
        if (n.parentNode !== layer) layer.appendChild(n);
        this.apply(n, s);
      }
      for (const [id, n] of this.nodes) if (!seen.has(id)) { n.remove(); this.nodes.delete(id); }
    }
  }

  function states(def) {
    const out = []; let s = Object.assign({}, def.blank);
    for (const st of def.steps) { s = Object.assign({}, s, st.set); out.push(s); }
    return out;
  }
  function stepDur(st) { return Math.max(3.4, 0.095 * (st.say || "").length + 1.4); }

  /* ── 시청자 모드 ───────────────────────────────── */
  class Player {
    constructor(def, root) {
      this.def = def; this.root = root; this.S = states(def); this.k = def.rest != null ? def.rest : def.steps.length - 1;
      this.mode = "steps"; this.playing = false; this.vis = true;
      const svg = root.querySelector("svg.stage"); this.scene = new Scene(svg, def.view);
      this.cur = this.def.layout(this.S[this.k], 0); this.from = this.cur; this.t0 = -1e9; this.tdur = 1;
      this.sb = def.sandbox ? Object.assign({}, def.sandbox.init) : null;
      this.buildUI(); this.show(this.k, true);
    }
    buildUI() {
      const r = this.root, d = this.def;
      this.capN = r.querySelector(".cap-n"); this.capT = r.querySelector(".cap-t");
      const dots = r.querySelector(".dots");
      this.dots = d.steps.map((st, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "dot"; b.textContent = i + 1;
        b.setAttribute("aria-label", `${i + 1}단계 · ${st.tag}`); b.title = st.tag; b.addEventListener("click", () => { this.stop(); this.go(i); });
        dots.appendChild(b); return b;
      });
      r.querySelector(".b-prev").addEventListener("click", () => { this.stop(); this.go(Math.max(0, this.k - 1)); });
      r.querySelector(".b-next").addEventListener("click", () => { this.stop(); this.go(Math.min(d.steps.length - 1, this.k + 1)); });
      this.bPlay = r.querySelector(".b-play"); this.bPlay.addEventListener("click", () => (this.playing ? this.stop() : this.play()));
      r.querySelector(".b-reset").addEventListener("click", () => { this.stop(); this.go(0); this.play(); });
      this.tabs = r.querySelectorAll(".tab");
      this.tabs.forEach((t) => t.addEventListener("click", () => this.setMode(t.dataset.mode)));
      this.panSteps = r.querySelector(".pane-steps"); this.panSb = r.querySelector(".pane-sb");
      if (this.sb && this.panSb) {
        const box = this.panSb.querySelector(".sb-btns"); this.sbBtns = [];
        for (const c of d.sandbox.controls) {
          const b = document.createElement("button"); b.type = "button"; b.className = "sbb"; b.id = `${d.id}-${c.id}`;
          b.addEventListener("click", () => { const now = this.now(); this.sb = c.act(Object.assign({}, this.sb), now); this.sb._at = now; this.morph(this.layoutSb(now), 0.85); this.renderSbUI(); });
          box.appendChild(b); this.sbBtns.push([c, b]);
        }
        this.sbStatus = this.panSb.querySelector(".sb-status"); this.renderSbUI();
      }
      r.addEventListener("keydown", (e) => {
        if (this.mode !== "steps" || e.target.closest("input")) return;
        if (e.key === "ArrowRight") { this.stop(); this.go(Math.min(d.steps.length - 1, this.k + 1)); e.preventDefault(); }
        if (e.key === "ArrowLeft") { this.stop(); this.go(Math.max(0, this.k - 1)); e.preventDefault(); }
      });
    }
    now() { return performance.now() / 1000; }
    layoutSb(now) { const s = this.def.sandbox.derive ? this.def.sandbox.derive(this.sb, now) : this.sb; return this.def.layout(s, now); }
    renderSbUI() {
      for (const [c, b] of this.sbBtns) { b.textContent = typeof c.label === "function" ? c.label(this.sb) : c.label; b.disabled = c.off ? !!c.off(this.sb) : false; }
      const s = this.def.sandbox.derive ? this.def.sandbox.derive(this.sb, this.now()) : this.sb;
      this.sbStatus.innerHTML = this.def.sandbox.status(s);
    }
    morph(target, dur) { this.from = blend(this.from, this.cur, ease((this.now() - this.t0) / this.tdur)); this.t0 = this.now(); this.tdur = REDUCED ? 0.001 : dur; this.target = target; }
    setMode(m) {
      this.mode = m; this.stop();
      this.tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.mode === m ? "true" : "false"));
      this.panSteps.hidden = m !== "steps"; if (this.panSb) this.panSb.hidden = m !== "sb";
      if (m === "sb") { this.sb = Object.assign({}, this.def.sandbox.init); this.sb._at = this.now(); this.renderSbUI(); this.morph(this.layoutSb(this.now()), 0.8); }
      else this.go(this.k, false);
    }
    show(k, instant) {
      this.k = k; const st = this.def.steps[k];
      this.capN.textContent = `${k + 1} / ${this.def.steps.length} · ${st.tag}`; this.capT.textContent = st.say;
      this.dots.forEach((b, i) => b.setAttribute("aria-current", i === k ? "step" : "false"));
      if (instant) { this.from = this.cur = this.target = this.def.layout(this.S[k], this.now()); this.t0 = -1e9; }
    }
    go(k, fromPrev) {
      const prev = fromPrev === false ? null : k > 0 && k === this.k + 1 ? this.S[k - 1] : null;
      this.show(k, false);
      if (prev) { this.from = blend(this.from, this.cur, ease((this.now() - this.t0) / this.tdur)); this.t0 = this.now(); this.tdur = REDUCED ? 0.001 : this.def.steps[k].dur || 1.1; this.target = null; this.prevState = prev; }
      else { this.morph(null, 0.6); this.prevState = null; }
      this.stepAt = this.now();
    }
    play() {
      if (this.mode !== "steps") this.setMode("steps");
      this.playing = true; this.bPlay.textContent = "❚❚ 멈춤"; this.bPlay.setAttribute("aria-pressed", "true");
      if (this.k >= this.def.steps.length - 1) this.go(0); this.stepAt = this.now();
    }
    stop() { this.playing = false; if (this.bPlay) { this.bPlay.textContent = "▶ 재생"; this.bPlay.setAttribute("aria-pressed", "false"); } }
    frame(now) {
      if (this.playing && now - this.stepAt > stepDur(this.def.steps[this.k])) {
        if (this.k < this.def.steps.length - 1) this.go(this.k + 1); else this.stop();
      }
      const tt = REDUCED ? 0 : now;
      const tgt = this.mode === "sb" ? this.layoutSb(now) : this.def.layout(this.S[this.k], tt);
      this.cur = tgt;
      const p = ease((now - this.t0) / this.tdur);
      this.scene.draw(blend(this.from, tgt, p));
    }
  }

  /* ── 영상 모드 ───────────────────────────────── */
  function videoMode(V) {
    const root = document.documentElement; root.setAttribute("data-theme", "light"); root.setAttribute("data-pal", V.pal || "B");
    document.body.classList.add("video");
    const def = DEFS[V.anim]; const S = states(def);
    const f = document.createElement("div"); f.id = "vframe";
    f.innerHTML = `<header class="vh"><span class="vsec"></span><span class="vlec"></span></header>
      <div class="vtitle"><span class="vfig"></span><span class="vname"></span></div>
      <ol class="vrail"></ol><svg class="vstage" aria-hidden="true"></svg>`;
    document.body.appendChild(f);
    f.querySelector(".vsec").textContent = V.sec || def.sec || ""; f.querySelector(".vlec").textContent = V.lec || "";
    f.querySelector(".vfig").textContent = def.fig; f.querySelector(".vname").textContent = def.title;
    const rail = f.querySelector(".vrail");
    const items = def.steps.map((st, i) => { const li = document.createElement("li"); li.innerHTML = `<b>${i + 1}</b><span></span>`; li.querySelector("span").textContent = st.tag; rail.appendChild(li); return li; });
    const scene = new Scene(f.querySelector(".vstage"), def.view);
    const beats = V.beats || def.steps.map((_, i) => 1 + i * 4);
    window.__seek = (t) => {
      let k = -1; for (let i = 0; i < beats.length; i++) if (t >= beats[i]) k = i;
      const A = def.layout(k <= 0 ? def.blank : S[k - 1], t), B = def.layout(k < 0 ? def.blank : S[k], t);
      const p = k < 0 ? 1 : ease((t - beats[k]) / ((def.steps[k] && def.steps[k].dur) || 1.1));
      scene.draw(blend(A, B, p));
      items.forEach((li, i) => li.className = i < k ? "done" : i === k ? "now" : "");
      return k;
    };
    window.__ready = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { window.__seek(0); return true; });
  }

  /* ── 시작 ───────────────────────────────── */
  function start() {
    if (window.__VIDEO__) return videoMode(window.__VIDEO__);
    const players = [];
    document.querySelectorAll("section.anim[data-anim]").forEach((sec) => { const d = DEFS[sec.dataset.anim]; if (d) players.push(new Player(d, sec)); });
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { const p = players.find((x) => x.root === e.target); if (p) p.vis = e.isIntersecting; }), { rootMargin: "120px" }) : null;
    if (io) players.forEach((p) => io.observe(p.root));
    const loop = () => { const now = performance.now() / 1000; for (const p of players) if (p.vis) p.frame(now); requestAnimationFrame(loop); };
    for (const p of players) p.frame(performance.now() / 1000);
    requestAnimationFrame(loop);
    document.querySelectorAll("[data-pal-set]").forEach((b) => b.addEventListener("click", () => {
      document.documentElement.setAttribute("data-pal", b.dataset.palSet);
      document.querySelectorAll("[data-pal-set]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      try { localStorage.setItem("it-pal", b.dataset.palSet); } catch (e) {}
    }));
    try { const sv = localStorage.getItem("it-pal"); if (sv) { const b = document.querySelector(`[data-pal-set="${sv}"]`); if (b) b.click(); } } catch (e) {}
  }

  window.IT = { define(d) { DEFS[d.id] = d; ORDER.push(d.id); }, start, ease, lerp, clamp, blend, poly, plen, pat };
})();
