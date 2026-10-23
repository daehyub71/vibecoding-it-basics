/* 2장 움직이는 그림 — 혼합 판(2026-10-20): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 경로 글줄 · 깃발 · 연결선을 얹는다.
   좌표는 무대 그림(1672×941) 기준. 상자 좌표는 제작도구/it_label_fill.py detect 결과. */
(function () {
  const W = 1672, H = 941, L = IT.lerp, poly = IT.poly, plen = IT.plen;
  const C = { coral: "#B53A24", teal: "#03807F", blue: "#1B66C9", ink: "#1F3A5F" };

  /* 빈 상자에 라벨 얹기: [x,y,w,h] */
  function lab(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "\u1100" ? 1 : 0.6), 0);
    const size = Math.min(h * 0.46, (w - 26) / Math.max(1, n));
    o["lb-" + id] = { type: "rect", x: x + 4, y: y + 4, w: w - 8, h: h - 8, rx: h * 0.22, fill: "#FFFFFF", op: on, z: 3, from: { sc: 0.7 }, lag: opt && opt.lag };
    o["lt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", fill: color, op: on, z: 4, from: { y: y + h / 2 + size * 0.36 + 10 }, lag: opt && opt.lag };
  }
  /* 강조 테두리 */
  function hl(o, id, r, on, t) { const [x, y, w, h] = r; o["hl-" + id] = { type: "rect", x, y, w, h, rx: 22, fill: "none", stroke: "hot", sw: 7, op: on ? 0.75 + 0.25 * Math.sin((t || 0) * 4) : 0, z: 2 }; }
  /* 말풍선 메모 */
  function note(o, id, x, y, text, on, color) {
    const n = [...text].length, w = n * 24 + 44;
    o["nb-" + id] = { type: "rect", x, y, w, h: 54, rx: 16, fill: "#FFFFFF", stroke: color || "hot", sw: 3, op: on, z: 5, from: { y: y + 14 } };
    o["nt-" + id] = { type: "text", x: x + w / 2, y: y + 36, text, size: 25, weight: 700, anchor: "middle", fill: color || "hot-ink", op: on, z: 6, from: { y: y + 50 } };
  }
  function img(o, href) { o.bg = { type: "image", href, x: 0, y: 0, w: W, h: H, z: 0 }; }
  function veil(o, on) { o.veil = { type: "rect", x: 0, y: 0, w: W, h: H, fill: "#FFFFFF", op: on ? 0.55 : 0, z: 1 }; }


  /* ── 그림 7장: 말하는 순간 그 자리 라벨이 뜨고 강조된다 ── */
  function figAnim(id, fig, title, sec, img_, boxes, steps) {
    IT.define({
      id, fig, title, sec, view: [W, H], rest: steps.length - 1, blank: { k: -1 },
      steps: steps.map((s, i) => ({ tag: s.tag, say: s.say || s.tag, set: { k: i }, dur: 1.2 })),
      layout(s, t) {
        const o = {}; img(o, img_); const k = s.k;
        steps.forEach((st, i) => (st.show || []).forEach((n, j) => { const b = boxes[n]; lab(o, "b" + n, b.slice(0, 4), b[4], k >= i ? 1 : 0, b[5], { lag: Math.min(0.6, j * 0.15) }); }));
        steps.forEach((st, i) => { if (st.hl) hl(o, "h" + i, st.hl, k === i, t); });
        const cur = steps[k] || {};
        if (cur.note) note(o, "nt", cur.note[0], cur.note[1], cur.note[2], 1, cur.note[3]);
        return o;
      },
    });
  }


  const M = "'IBM Plex Mono', Menlo, monospace";
  const bx = (arr, specs) => Object.fromEntries(specs.map(([n, text, color], i) => [i + 1, [...arr[n - 1], text, color]]));

  /* ── 그림 7장: 말하는 순간 그 자리 라벨이 뜨고 강조된다 ── */
  const D = {
    p02_01: [[627, 85, 214, 45], [1436, 131, 214, 43], [809, 190, 214, 42], [1465, 297, 174, 42], [962, 516, 168, 42], [1467, 577, 176, 41]],
    p02_02: [[522, 407, 252, 69], [864, 728, 308, 65], [1293, 737, 325, 73], [465, 14, 742, 74]],
    p02_03: [[567, 198, 233, 68], [1380, 404, 259, 70], [25, 643, 269, 76]],
    p02_04: [[83, 87, 309, 62], [1335, 83, 299, 71], [682, 310, 160, 57], [1324, 731, 306, 70]],
    p02_05: [[172, 62, 515, 86], [979, 59, 521, 88], [335, 256, 204, 54], [1126, 254, 205, 54]],
    p02_06: [[1182, 121, 161, 42], [1404, 120, 197, 44], [83, 279, 215, 50], [644, 279, 188, 50], [992, 670, 174, 47]],
    p02_07: [[774, 115, 211, 50], [1478, 117, 182, 48], [656, 557, 121, 49], [797, 557, 123, 49], [946, 557, 130, 49], [1277, 742, 181, 49], [572, 574, 69, 39]],
  };
  figAnim("p02_01", "그림 2-1", "안방 서랍장 둘째 칸, 파란 상자", "2.1 서랍장에서 시작하는 파일 탐험", "p02_01.jpg",
    bx(D.p02_01, [[1, "저장장치 · 집", C.coral], [3, "폴더 · 안방", C.blue], [2, "폴더 · 서랍장", C.blue], [4, "폴더 · 둘째 칸", C.coral], [5, "폴더 · 파란 상자", C.teal], [6, "파일 · 여권", C.ink]]),
    [{ tag: "전화", hl: [0, 40, 470, 400] }, { tag: "안방", show: [1, 2], hl: [470, 40, 470, 400] }, { tag: "서랍장 · 칸 · 상자", show: [3, 4, 5], hl: [940, 40, 720, 400] },
     { tag: "여권 = 파일", show: [6], note: [40, 470, "큰 곳 → 작은 곳 = 경로", C.coral] }]);
  figAnim("p02_02", "그림 2-2", "이름표를 바꿔도 내용물은 그대로", "2.2 이름과 확장자", "p02_02.jpg",
    bx(D.p02_02, [[1, "새 이름표 (.pdf)", C.coral], [2, "내용물은 그대로 · 영수증", C.teal], [3, "진짜 사진", C.blue], [4, "이름표 ≠ 내용", C.blue]]),
    [{ tag: "스티커 바꾸기", show: [1], hl: [0, 120, 840, 720] }, { tag: "내용물은 그대로", show: [2], hl: [860, 160, 420, 560] }, { tag: "진짜 사진", show: [3], hl: [1270, 230, 400, 470] },
     { tag: "이름표 ≠ 내용", show: [4] }]);
  figAnim("p02_03", "그림 2-3", "같은 파일, 다른 위치", "2.3 폴더는 정리함일까", "p02_03.jpg",
    bx(D.p02_03, [[1, "약속된 자리 · 폴더", C.coral], [3, "프로그램", C.blue], [2, "멀쩡한 파일, 다른 위치", C.blue]]),
    [{ tag: "약속된 자리", show: [1], hl: [420, 20, 410, 900] }, { tag: "프로그램", show: [2], hl: [0, 20, 420, 900] }, { tag: "다른 위치", show: [3], hl: [840, 20, 820, 900] }]);
  figAnim("p02_04", "그림 2-4", "전체 주소와 길 안내", "2.4 절대경로 vs 상대경로", "p02_04.jpg",
    bx(D.p02_04, [[1, "절대경로 · 전체 주소", C.blue], [3, "어디서 출발해도 같은 곳", C.coral], [2, "상대경로 · 길 안내", C.teal], [4, "지금 서 있는 곳", C.teal]]),
    [{ tag: "절대경로", show: [1, 2], hl: [0, 60, 840, 840] }, { tag: "상대경로", show: [3, 4], hl: [840, 60, 832, 840] }]);
  figAnim("p02_05", "그림 2-5", "옆집 거실에서 따라 한 안내문", "2.6 프로젝트 루트", "p02_05.jpg",
    bx(D.p02_05, [[1, "저장소 루트에서", C.teal], [3, "같은 명령", C.blue], [2, "다른 폴더에서", C.coral], [4, "그런 파일이 없습니다", C.coral]]),
    [{ tag: "우리 집", show: [1, 2], hl: [0, 40, 830, 880] }, { tag: "옆집", show: [3, 4], hl: [840, 40, 832, 880] }]);
  figAnim("p02_06", "그림 2-6", "똑같이 생긴 두 현관문", "2.8 이름이 같은 파일", "p02_06.jpg",
    bx(D.p02_06, [[3, "101동 101호", C.blue], [4, "102동 101호", C.coral], [1, "web 안", C.blue], [2, "루트", C.coral], [5, "엉뚱한 파일을 고쳤다", C.teal]]),
    [{ tag: "두 동", show: [1, 2], hl: [10, 50, 840, 880] }, { tag: "README 두 개", show: [3, 4], hl: [870, 20, 800, 450], note: [880, 470, "이름은 같아도 폴더가 다르다", C.coral] }, { tag: "엉뚱한 파일", show: [5], hl: [870, 480, 800, 440] }]);
  figAnim("p02_07", "그림 2-7", "AI와 폴더 지도를 먼저 그리기", "2.10 바이브코딩 현장", "p02_07.jpg",
    bx(D.p02_07, [[1, "AI가 그린 폴더 지도", C.blue], [3, "화면", C.blue], [4, "설정", C.teal], [5, "데이터", C.coral], [6, "내가 확인한 경로", C.coral], [2, "실제 파일 목록", C.blue], [7, "AI", C.blue]]),
    [{ tag: "AI가 그린 지도", show: [1, 2, 3, 4, 7], hl: [530, 40, 590, 840] }, { tag: "실제와 맞춰 보기", show: [5, 6], hl: [1120, 40, 552, 840] }]);

  /* 글자 폭으로 줄 나누기(빗금 · 역빗금 뒤에서 끊는다) */
  function wrapPath(s, max) {
    const out = []; let cur = "";
    for (const part of s.split(/(?<=[\/\\]|→ )/)) { if ((cur + part).length > max && cur) { out.push(cur); cur = part; } else cur += part; }
    return out.concat(cur ? [cur] : []);
  }
  function pathCard(o, id, x, y, w, title, path, on, color, size) {
    const sz = size || 22, max = Math.floor((w - 40) / (sz * 0.6)), ls = wrapPath(path, max);
    o[id + "b"] = { type: "rect", x, y, w, h: 54 + ls.length * sz * 1.35, rx: 16, fill: "#FFFFFF", stroke: color || "#1F3A5F", sw: 3, op: on, z: 6 };
    o[id + "t"] = { type: "text", x: x + 20, y: y + 32, text: title, size: 20, weight: 700, fill: color || "#1F3A5F", op: on, z: 7 };
    ls.forEach((l, i) => { o[id + "l" + i] = { type: "text", x: x + 20, y: y + 64 + i * sz * 1.35, text: l, size: sz, weight: 600, font: "mono", fill: "fg", op: on, z: 7 }; });
    for (let i = ls.length; i < 6; i++) o[id + "l" + i] = { type: "text", x: x + 20, y: y + 64 + i * sz * 1.35, text: "", size: sz, op: 0, z: 7 };
  }
  function cover(o, id, b, on) { const [x, y, w, h] = b; o["cv-" + id] = { type: "rect", x: x - 2, y: y - 2, w: w + 4, h: h + 4, rx: 12, fill: "#FFFFFF", op: on, z: 3 }; }
  function chip(o, id, cx, cy, text, on, color, size) {
    const sz = size || 18, w = [...text].reduce((s, c) => s + (c >= "\u1100" ? 1 : 0.6), 0) * sz + 26;
    o["cb-" + id] = { type: "rect", x: cx - w / 2, y: cy - sz * 0.9, w, h: sz * 1.8, rx: sz * 0.9, fill: "#FFFFFF", stroke: color || C.ink, sw: 2.5, op: on, z: 5 };
    o["ct-" + id] = { type: "text", x: cx, y: cy + sz * 0.36, text, size: sz, weight: 700, anchor: "middle", fill: color || C.ink, op: on, z: 6 };
  }

  /* ── 2-A 서랍장에서 폴더 트리로 (무대 p02_a01) ── */
  const A1 = {
    photo: [[36, 40, 584, 258], [26, 304, 554, 192], [26, 504, 554, 200], [26, 712, 554, 200]],
    plab: [[618, 85, 218, 76], [618, 342, 229, 79], [618, 550, 229, 78], [618, 758, 231, 79]],
    icon: [[940, 108], [1012, 207], [1083, 308], [1155, 410], [1225, 513], [1296, 617], [1366, 718], [1432, 815]],
    flab: [[1045, 65, 175, 50], [1119, 164, 175, 50], [1190, 266, 175, 50], [1263, 367, 176, 50], [1333, 469, 174, 50], [1406, 573, 176, 50], [1472, 674, 170, 50], [1512, 776, 130, 50]],
    mac: [1399, 39, 118, 52], win: [1530, 42, 112, 46],
  };
  const NAMES = ["C:", "Users", "사용자이름", "projects", "utube-…-tracer", "web", "src", "BoardCard.tsx"];
  const MACP = "/Users/사용자이름/projects/utube-trend-tracer/web/src/components/BoardCard.tsx";
  const WINP = "C:\\Users\\사용자이름\\projects\\utube-trend-tracer\\web\\src\\components\\BoardCard.tsx";
  IT.define({
    id: "a02_01", fig: "움직이는 그림 2-A", title: "서랍장에서 폴더 트리로", sec: "2.1 서랍장에서 시작하는 파일 탐험", view: [W, H], rest: 6,
    blank: { k: -1 },
    steps: [{ tag: "안방", set: { k: 0 } }, { tag: "서랍장 · 칸 · 상자", set: { k: 1 }, dur: 1.4 }, { tag: "폴더와 파일", set: { k: 2 }, dur: 1.4 }, { tag: "C: Users 사용자이름 projects", set: { k: 3 }, dur: 1.4 },
      { tag: "BoardCard.tsx 까지", set: { k: 4 }, dur: 1.4 }, { tag: "확장자 tsx", set: { k: 5 } }, { tag: "맥 표기", set: { k: 6 } }],
    layout(s, t) {
      const o = {}, k = s.k; img(o, "p02_a01.jpg");
      const PL = ["집 = 저장장치", "안방", "서랍장 · 둘째 칸", "파란 상자 · 여권"];
      PL.forEach((p, i) => lab(o, "p" + i, A1.plab[i], p, k >= (i < 2 ? 0 : 1) ? 1 : 0, i === 0 ? C.coral : i === 3 ? C.ink : C.teal, { lag: (i % 2) * 0.25 }));
      if (k <= 1) hl(o, "ph", k === 0 ? A1.photo[1] : [26, 504, 554, 408], true, t);
      o.veilL = { type: "rect", x: 20, y: 30, w: 840, h: 890, fill: "#FFFFFF", op: k >= 2 ? 0.62 : 0, z: 4 };
      // 트리 선
      for (let i = 0; i < 7; i++) {
        const [x0, y0] = A1.icon[i], [x1, y1] = A1.icon[i + 1];
        o["tr" + i] = { type: "path", d: `M${x0 - 14},${y0 + 38} L${x0 - 14},${y1} L${x1 - 42},${y1}`, stroke: "#1F3A5F", sw: 4, fill: "none", len: 260, draw: k >= 2 ? 1 : 0, op: k >= 2 ? 1 : 0, z: 2, from: { draw: 0 }, lag: i * 0.08 };
      }
      const upto = k >= 4 ? 7 : k >= 3 ? 3 : -1;
      NAMES.forEach((nm, i) => {
        const on = k >= 2 ? 1 : 0, lit = i <= upto;
        lab(o, "f" + i, A1.flab[i], i === 7 && k >= 5 ? "BoardCard . tsx" : i === 0 && k === 6 ? "/" : nm, on, lit ? C.coral : C.blue, { lag: i * 0.08 });
        if (i === 7) o["ext"] = { type: "rect", x: A1.flab[7][0] + A1.flab[7][2] - 50, y: A1.flab[7][1] + 8, w: 44, h: 34, rx: 10, fill: "none", stroke: "hot", sw: 4, op: k >= 5 ? 1 : 0, z: 5 };
        const [cx, cy] = A1.icon[i];
        o["dot" + i] = { type: "circle", cx: cx - 40, cy, r: 9, fill: C.coral, op: lit ? 1 : 0, z: 5, lag: i * 0.12 };
      });
      // 맥 / 윈도우 단추
      lab(o, "mac", A1.mac, "윈도우", k >= 2 ? 1 : 0, k === 6 ? "#8A93A3" : C.coral); lab(o, "win", A1.win, "맥", k >= 2 ? 1 : 0, k === 6 ? C.teal : "#8A93A3");
      // 경로 글줄
      const txt = k <= 0 ? "안방" : k === 1 ? "안방 → 서랍장 → 둘째 칸 → 파란 상자 → 여권" : k === 2 ? "폴더 = 방 · 서랍 · 상자  /  파일 = 여권" : k === 3 ? "C:\\Users\\사용자이름\\projects" : k === 6 ? MACP : WINP;
      pathCard(o, "pc", k <= 2 ? 878 : 630, k <= 2 ? 700 : 660, k <= 2 ? 430 : 680, k <= 2 ? "경로 = 찾아가는 말" : k === 6 ? "맥 · / 에서 시작, / 로 들어간다" : "윈도우 · C: 에서 시작, \\ 하나 = 한 칸 안으로", txt, k >= 0 ? 1 : 0, k === 6 ? C.teal : C.coral, k <= 2 ? 22 : 25);
      if (k === 5) note(o, "ex", 1240, 880, "점 뒤 tsx = 확장자", 1, C.coral);
      return o;
    },
  });

  /* ── 2-B 지금 서 있는 곳이 바뀌면 (무대 p02_a02) ── */
  const N2 = {   // 이름 · 아이콘 중심 · 라벨 상자 · 부모
    root: ["저장소 루트", [772, 145], [893, 98, 165, 53], null],
    backend: ["pipeline", [518, 315], [627, 266, 160, 53], "root"], frontend: ["web", [995, 315], [1105, 266, 163, 53], "root"],
    app: ["app", [303, 482], [400, 443, 145, 50], "backend"], src: ["src", [788, 482], [885, 443, 139, 50], "frontend"], map: ["components", [1243, 482], [1351, 443, 150, 50], "src"],
    api: ["config.py", [80, 648], [150, 619, 107, 49], "app"], main: ["youtube.py", [318, 648], [375, 619, 110, 49], "app"], App: ["app/page.tsx", [546, 648], [608, 619, 106, 49], "src"],
    hooks: ["lib", [790, 648], [859, 619, 101, 49], "src"], useLoc: ["supabase.ts", [1013, 648], [1069, 619, 112, 49], "hooks"],
    Kakao: ["BoardCard.tsx", [1244, 648], [1306, 619, 107, 49], "map"], Marker: ["BoardCard.test.tsx", [1475, 648], [1540, 619, 105, 49], "map"],
  };
  const LOW = ["api", "main", "App", "hooks", "useLoc", "Kakao", "Marker"];
  const ABS = "C:/Users/사용자이름/projects/utube-trend-tracer";
  const ST2 = [
    { flag: "root", star: null, abs: "", rel: "" },
    { flag: "root", star: "App", abs: ABS + "/web/src/app/page.tsx", rel: "web/src/app/page.tsx" },
    { flag: "src", star: "App", abs: ABS + "/web/src/app/page.tsx", rel: "./app/page.tsx" },
    { flag: "map", star: "Kakao", abs: ABS + "/web/src/components/BoardCard.tsx", rel: "./BoardCard", note: "BoardCard.test.tsx 안: import { BoardCard } from './BoardCard'" },
    { flag: "frontend", star: "env", abs: ABS + "/.env.example", rel: "../.env.example", note: "README: web 안에서 cp ../.env.example .env.local" },
    { flag: "backend", star: null, abs: ABS + "/pipeline", rel: "./app/page.tsx  →  찾을 수 없음", miss: true },
    { flag: "src", star: "Kakao", abs: ABS + "/web/src/components/BoardCard.tsx", rel: "@/components/BoardCard", note: "@ = web/src 에 붙인 별명 (tsconfig.json) · page.tsx 가 이렇게 부른다" },
  ];
  ST2.forEach((s) => { s.abs = s.abs.replace(/\//g, "\\"); });   // 윈도우 표기(2026-10-23: 윈도우 먼저)
  IT.define({
    id: "a02_02", fig: "움직이는 그림 2-B", title: "지금 서 있는 곳이 바뀌면", sec: "2.4 절대경로 vs 상대경로", view: [W, H], rest: 6,
    blank: { k: -1 },
    steps: ST2.map((s, i) => ({ tag: ["루트에 서기", "같은 파일, 두 말", "src 로 옮기기", "./ 바로 옆", "../ 한 칸 위", "pipeline 에서는", "@ 별명"][i], set: { k: i }, dur: 1.2 })),
    layout(s, t) {
      const o = {}, k = s.k, S = ST2[Math.max(0, k)] || ST2[0], on = k >= 0 ? 1 : 0;
      img(o, "p02_a02.jpg");
      for (const id in N2) {
        const [nm, [cx, cy], b, par] = N2[id];
        if (par) { const [px, py] = N2[par][1]; o["ln-" + id] = { type: "path", d: `M${px},${py + 52} L${px},${(py + cy) / 2 + 20} L${cx},${(py + cy) / 2 + 20} L${cx},${cy - 50}`, stroke: "#9AA6B5", sw: 3, fill: "none", op: on * 0.9, z: 1 }; }
        const low = LOW.includes(id), isFlag = S.flag === id, isStar = S.star === id;
        const col = isStar ? C.coral : isFlag ? C.teal : C.ink;
        if (low) { cover(o, id, b, on); chip(o, id, cx, cy + 74, nm, on, col, 17); }
        else { cover(o, id, b, on); chip(o, id, b[0] + b[2] / 2 + (nm.length > 10 ? 18 : 0), b[1] + b[3] / 2, nm, on, col, 20); }
      }
      // __tests__ (hooks 아래 작은 폴더 칩)
      o["ln-tests"] = { type: "line", x1: 1062, y1: 125, x2: 1190, y2: 125, stroke: "#9AA6B5", sw: 3, op: on, z: 1 };
      chip(o, "tests", 1270, 125, ".env.example", on, S.star === "env" ? C.coral : C.ink, 18);
      chip(o, "lgF", 250, 100, "지금 서 있는 곳", on, "#D93A2E", 20); chip(o, "lgS", 1440, 100, "찾는 파일", on, "#B47F00", 20);
      // 깃발(현재 위치) · 별(목적지)
      const fp = N2[S.flag][1];
      o.flagP = { type: "line", x1: fp[0] - 36, y1: fp[1] - 20, x2: fp[0] - 36, y2: fp[1] - 86, stroke: "#5D6470", sw: 4, op: on, z: 7 };
      o.flag = { type: "path", d: `M${fp[0] - 34},${fp[1] - 86} L${fp[0] + 10},${fp[1] - 72} L${fp[0] - 34},${fp[1] - 58} Z`, fill: "#D93A2E", op: on, z: 7 };
      if (S.star) { const [sx, sy] = S.star === "env" ? [1236, 171] : N2[S.star][1]; o.star = { type: "circle", cx: sx + 34, cy: sy - 46, r: 18 + 3 * Math.sin(t * 5), fill: "#F2B705", stroke: "#B47F00", sw: 2, op: on, z: 7 }; }
      else o.star = { type: "circle", cx: 1580, cy: 95, r: 1, fill: "#F2B705", op: 0, z: 7 };
      // ../ 발자국
      o.up = { type: "path", d: "M995,262 C1000,200 1080,170 1180,150", stroke: C.coral, sw: 4, dash: "8 8", off: -t * 30, fill: "none", op: k === 4 ? 1 : 0, z: 6 };
      // 두 글줄 + 현재 위치 상자
      cover(o, "abs", [34, 756, 1252, 62], on); cover(o, "rel", [34, 830, 1252, 62], on); cover(o, "cur", [1306, 769, 332, 102], on);
      o.absT = { type: "text", x: 50, y: 796, text: "절대경로  " + (S.abs || "—"), size: S.abs.length > 70 ? 19 : 22, weight: 600, font: "mono", fill: C.blue, op: on, z: 6 };
      o.relT = { type: "text", x: 50, y: 870, text: "상대경로  " + (S.rel || "—"), size: 24, weight: 700, font: "mono", fill: S.miss ? "#CF3F33" : C.teal, op: on, z: 6 };
      o.curB = { type: "rect", x: 1306, y: 769, w: 332, h: 102, rx: 16, fill: "#FFFFFF", stroke: C.teal, sw: 3, op: on, z: 5 };
      o.curL = { type: "text", x: 1472, y: 806, text: "지금 서 있는 곳", size: 19, weight: 700, anchor: "middle", fill: "#5D6470", op: on, z: 6 };
      o.curT = { type: "text", x: 1472, y: 848, text: S.flag === "root" ? "저장소 루트" : S.flag === "map" ? "web/src/components" : S.flag === "src" ? "web/src" : S.flag === "frontend" ? "web" : S.flag === "backend" ? "pipeline" : S.flag, size: 24, weight: 700, font: "mono", anchor: "middle", fill: C.teal, op: on, z: 6 };
      if (S.note) note(o, "n2", 330, 520 + 0, S.note, 1, C.coral);
      return o;
    },
  });

  /* ── 2-C 같은 명령, 다른 출발점 (무대 p02_a03) ── */
  const NMX = (s) => ({ root: "루트", backend: "pipeline", frontend: "web" })[s] || s;
  const DR = { root: [258, 222, 405, 212], backend: [105, 432, 342, 248], frontend: [475, 432, 345, 248] };
  const FILES = { root: [["README.md", 460, 405]], backend: [["requirements.txt", 276, 555], ["scripts/run_collect.py", 276, 590]], frontend: [["package.json", 648, 555], ["src/", 648, 590]] };
  const STEPS3 = [
    { t1: ["PS> pwd", "C:\\…\\utube-trend-tracer"], at1: "root", look: null },
    { t1: ["PS> cd pipeline", "PS> pwd", "C:\\…\\pipeline"], at1: "backend" },
    { t1: ["PS> pip install -r requirements.txt", "✓ requirements.txt 를 찾았다"], at1: "backend", look: ["backend", 0, true] },
    { t1: ["PS> python -m scripts.run_collect", "✓ scripts/run_collect.py · 수집 중 …"], at1: "backend", look: ["backend", 1, true], busy: true },
    { t1: ["PS> cd web", "cd : 경로를 찾을 수 없습니다(…\\pipeline\\web)"], at1: "backend", look: ["backend", -1, false], busy: true, err1: true },
    { t1: ["(수집 중 …)"], at1: "backend", busy: true, t2: ["PS> cd web", "PS> npm run dev", "✓ package.json · 화면 서버 켜짐"], at2: "frontend", look: ["frontend", 0, true] },
    { t1: ["(수집 중 …)"], at1: "backend", busy: true, t2: ["PS> npm run dev   (루트에서)", "npm error Could not read package.json"], at2: "root", look: ["root", -1, false], err2: true },
    { t1: ["PS> cd ../web", "PS> pwd", "C:\\…\\web"], at1: "frontend", t2: ["(화면 서버 켜짐)"], at2: "frontend", hop: true },
  ];
  IT.define({
    id: "a02_03", fig: "움직이는 그림 2-C", title: "같은 명령, 다른 출발점", sec: "2.6 프로젝트 루트", view: [W, H], rest: 7,
    blank: { k: -1 },
    steps: STEPS3.map((s, i) => ({ tag: ["pwd", "cd pipeline", "pip install", "수집 실행", "cd web ✗", "새 터미널", "루트에서 npm ✗", "cd ../web"][i], set: { k: i }, dur: 1.0 })),
    layout(s, t) {
      const o = {}, k = s.k, S = STEPS3[Math.max(0, k)], on = k >= 0 ? 1 : 0; img(o, "p02_a03.jpg");
      lab(o, "dr0", [360, 84, 266, 62], "루트", on, C.coral); lab(o, "dr1", [78, 744, 255, 63], "pipeline/", on, C.teal); lab(o, "dr2", [586, 744, 253, 63], "web/", on, C.blue);
      for (const d in FILES) FILES[d].forEach(([nm, x, y], i) => chip(o, `fl-${d}${i}`, x, y, nm, on, "#5D6470", 16));
      lab(o, "t1", [1209, 87, 253, 54], "터미널 1 · " + NMX(S.at1), on, C.coral);
      lab(o, "t2", [1281, 363, 247, 44], "터미널 2 · " + (S.at2 ? NMX(S.at2) : "닫힘"), on, C.teal);
      ["pwd", "cd", "pip", "python", "npm", "cd .."].forEach((nm, i) => lab(o, "bt" + i, [1062 + i * 87.4, 560, 73, 31], nm, on, [0, 1, 2, 3, 1, 1][i] === -1 ? C.ink : C.ink));
      const term = (id, x, y, lines, err) => lines.concat(["", "", ""]).slice(0, 4).forEach((l, i) => {
        o[id + i] = { type: "text", x, y: y + i * 30, text: l, size: 21, weight: 600, font: "mono", fill: l.startsWith("$") ? "#E8EDF3" : (err && i === lines.length - 1) || l.includes("error") || l.startsWith("cd:") ? "#FF8A7A" : l.startsWith("✓") ? "#9ED39B" : "#AEB8C6", op: on && l ? 1 : 0, z: 4 };
      });
      term("ta", 1078, 285, S.t1 || [], S.err1); term("tb", 1078, 462, S.t2 || [], S.err2);
      if (S.busy) o.busy = { type: "rect", x: 1064, y: 254, w: 504, h: 132, rx: 6, fill: "#2D7A4E", op: 0.12 + 0.06 * Math.sin(t * 3), z: 3 }; else o.busy = { type: "rect", x: 1064, y: 254, w: 504, h: 132, rx: 6, fill: "#2D7A4E", op: 0, z: 3 };
      // 지금 위치 표시(서랍 테두리)
      const box = (id, d, col, on2) => { const [x, y, w, h] = DR[d]; o[id] = { type: "rect", x: x - 6, y: y - 6, w: w + 12, h: h + 12, rx: 14, fill: "none", stroke: col, sw: 6, op: on2, z: 3 }; };
      box("at1", S.at1, C.coral, on); box("at2", S.at2 || "root", C.teal, S.at2 ? on : 0);
      // 돋보기 ✓ ×
      if (S.look) {
        const [d, i, ok] = S.look, [x, y, w, h] = DR[d], f = i >= 0 ? FILES[d][i] : null;
        const cx = f ? f[1] + 110 : x + w / 2, cy = f ? f[2] - 40 : y + h / 2;
        o.mg = { type: "circle", cx, cy, r: 34, fill: "#FFFFFF", stroke: "#1F3A5F", sw: 6, op: 0.95, z: 7, from: { cx: 980, cy: 330 } };
        o.mgh = { type: "line", x1: cx + 24, y1: cy + 24, x2: cx + 52, y2: cy + 52, stroke: "#1F3A5F", sw: 9, op: 1, z: 7, from: { x1: 1004, y1: 354, x2: 1032, y2: 382 } };
        o.mgm = { type: "text", x: cx, y: cy + 13, text: ok ? "✓" : "✗", size: 38, weight: 700, anchor: "middle", fill: ok ? "#2D7A4E" : "#CF3F33", op: 1, z: 8 };
      } else { o.mg = { type: "circle", cx: 980, cy: 330, r: 34, fill: "#FFFFFF", op: 0, z: 7 }; o.mgh = { type: "line", x1: 0, y1: 0, x2: 0, y2: 0, op: 0, z: 7 }; o.mgm = { type: "text", x: 0, y: 0, text: "", op: 0, z: 8 }; }
      // 한 칸 나갔다 들어가기
      o.hop = { type: "path", d: "M276,430 C300,300 380,250 460,250 C560,250 640,300 648,430", stroke: C.coral, sw: 5, dash: "10 8", off: -t * 30, fill: "none", op: S.hop ? 1 : 0, z: 6 };
      if (S.hop) note(o, "hp", 640, 20, "cd ../web = 한 칸 나갔다가 옆으로", 1, C.coral);
      if (k === 4) note(o, "e1", 60, 200, "web 은 pipeline 안이 아니라 옆에 있다", 1, "alert");
      if (k === 6) note(o, "e2", 640, 20, "루트에는 package.json 이 없다", 1, "alert");
      return o;
    },
  });

  /* ── 2-D 옮기기와 복사하기 (무대 p02_a04) ── */
  const CARD = [192, 248, 150, 84];       // 위 서랍 속 로고 카드(무대 그림)
  const CARD2 = [150, 520, 150, 84];      // 아래 서랍으로 옮긴 자리
  const ST4 = [
    { top: 1, bot: 0, ref: "top", logo: "ok" }, { top: 0, bot: 1, ref: "top", logo: "ok", moving: true },
    { top: 0, bot: 1, ref: "top", logo: "broken" }, { top: 0, bot: 1, ref: "bot", logo: "ok" },
    { top: 1, bot: 1, ref: "top", logo: "ok", copy: true }, { top: 1, bot: 1, ref: "top", logo: "ok", copy: true, recolor: true },
    { top: 1, bot: 0, ref: "top", logo: "ok", fast: true },
  ];
  IT.define({
    id: "a02_04", fig: "움직이는 그림 2-D", title: "옮기기와 복사하기", sec: "2.9 옮기기와 복사하기", view: [W, H], rest: 6,
    blank: { k: -1 },
    steps: ST4.map((s, i) => ({ tag: ["경로를 따라 로고", "이동", "그림이 깨진다", "경로 고치기", "복사", "사본을 고치면", "같은 장치 · 다른 장치"][i], set: { k: i }, dur: 1.2 })),
    layout(s, t) {
      const o = {}, k = s.k, S = ST4[Math.max(0, k)], on = k >= 0 ? 1 : 0; img(o, "p02_a04.jpg");
      lab(o, "d1", [221, 131, 297, 61], "public/images/", on, C.blue); lab(o, "d2", [340, 505, 253, 65], "src/assets/", on, C.teal);
      lab(o, "nb", [699, 142, 291, 68], "코드가 적어 둔 경로", on, C.coral); lab(o, "wb", [1086, 127, 295, 67], "화면의 로고 자리", on, C.blue);
      ["이동", "복사", "경로 고치기", "사본 색 바꾸기", "처음으로"].forEach((nm, i) => lab(o, "b" + i, [[62, 782, 250, 64], [364, 782, 278, 63], [682, 783, 269, 62], [990, 783, 277, 62], [1321, 782, 288, 63]][i], nm, on,
        (k === 1 && i === 0) || (k === 4 && i === 1) || (k === 3 && i === 2) || (k === 5 && i === 3) ? C.coral : "#8A93A3"));
      // 위 서랍의 로고(없어지면 빈 자리 표시)
      o.empty = { type: "rect", x: CARD[0], y: CARD[1], w: CARD[2], h: CARD[3], rx: 8, fill: "#F1EEE8", stroke: "#B9B2A6", sw: 3, dash: "8 6", op: S.top ? 0 : on, z: 2 };
      o.emptyT = { type: "text", x: CARD[0] + CARD[2] / 2, y: CARD[1] + 50, text: "빈 자리", size: 20, weight: 700, anchor: "middle", fill: "#8A8172", op: S.top ? 0 : on, z: 3 };
      // 아래 서랍의 로고(이동 · 복사본)
      const logo = (id, x, y, w, h, opv, col) => {
        o[id] = { type: "rect", x, y, w, h, rx: 8, fill: "#FFFFFF", stroke: "#D3D8CB", sw: 2, op: opv, z: 4, from: { x: CARD[0], y: CARD[1] } };
        o[id + "m"] = { type: "path", d: `M${x + 22},${y + h - 16} L${x + 60},${y + 26} L${x + 86},${y + 56} L${x + 102},${y + 40} L${x + w - 18},${y + h - 16} Z`, fill: col, op: opv, z: 5, from: { d: `M${CARD[0] + 22},${CARD[1] + h - 16} L${CARD[0] + 60},${CARD[1] + 26} L${CARD[0] + 86},${CARD[1] + 56} L${CARD[0] + 102},${CARD[1] + 40} L${CARD[0] + w - 18},${CARD[1] + h - 16} Z` } };
        o[id + "s"] = { type: "circle", cx: x + w - 30, cy: y + 22, r: 10, fill: "#F2B705", op: opv, z: 5, from: { cx: CARD[0] + w - 30, cy: CARD[1] + 22 } };
      };
      logo("lb", CARD2[0], CARD2[1], CARD2[2], CARD2[3], S.bot ? on : 0, S.recolor ? C.coral : "#3BA27A");
      // 쪽지의 경로 · 연결선
      const refTop = S.ref === "top", path = refTop ? "public/images/logo.png" : "src/assets/logo.png";
      o.np1 = { type: "text", x: 805, y: 360, text: "<img src=", size: 22, weight: 600, font: "mono", anchor: "middle", fill: "#5D6470", op: on, z: 4 };
      o.np2 = { type: "text", x: 805, y: 404, text: path.replace("logo.png", ""), size: 23, weight: 700, font: "mono", anchor: "middle", fill: refTop ? C.blue : C.teal, op: on, z: 4 };
      o.np3 = { type: "text", x: 805, y: 444, text: "logo.png", size: 23, weight: 700, font: "mono", anchor: "middle", fill: refTop ? C.blue : C.teal, op: on, z: 4 };
      const broken = S.logo === "broken";
      const tx = refTop ? CARD[0] + CARD[2] : CARD2[0] + CARD2[2], ty = refTop ? CARD[1] + 40 : CARD2[1] + 40;
      o.wire1 = { type: "path", d: broken ? `M700,380 C620,380 560,${ty + 70} ${tx + 60},${ty + 90}` : `M700,380 C600,380 ${tx + 80},${ty} ${tx + 4},${ty}`, stroke: broken ? "#CF3F33" : refTop ? C.blue : C.teal, sw: 5, dash: broken ? "6 10" : "", fill: "none", op: on, z: 6 };
      o.wire2 = { type: "path", d: "M920,380 C1000,380 1040,300 1100,292", stroke: broken ? "#CF3F33" : "#5D6470", sw: 5, fill: "none", op: on, z: 6 };
      // 화면의 로고 자리
      o.wl = { type: "rect", x: 1100, y: 266, w: 122, h: 54, rx: 8, fill: "#FFFFFF", op: on, z: 4 };
      o.wlm = { type: "path", d: "M1112,312 L1140,280 L1158,300 L1170,290 L1206,312 Z", fill: S.recolor && !refTop ? C.coral : "#3BA27A", op: broken ? 0 : on, z: 5 };
      o.wlx = { type: "text", x: 1161, y: 304, text: "✗ 깨짐", size: 22, weight: 700, anchor: "middle", fill: "#CF3F33", op: broken ? on : 0, z: 5 };
      if (broken) note(o, "nf", 1090, 560, "찾을 수 없음 · 파일은 멀쩡하다", 1, "alert");
      if (k === 3) note(o, "fx", 640, 560, "옮길 때는 부르는 경로도 함께 고친다", 1, C.teal);
      if (S.recolor) note(o, "rc", 640, 560, "사본을 고쳤는데 화면은 그대로", 1, C.coral);
      if (S.fast) { note(o, "f1", 120, 650, "같은 저장장치 안 = 주소만 바뀐다(순식간)", 1, C.teal); note(o, "f2", 820, 650, "다른 장치로 = 복사한 뒤 원본 지우기", 1, C.coral); }
      return o;
    },
  });

  /* ── 엔드카드: 다음 시간 + 구독·좋아요·알림 설정·댓글 (말하는 순간 차례로 켜짐) ── */
  IT.define({
    id: "e02", fig: "다음 시간", title: "Part1-3 네트워크 vs 인터넷 vs 웹", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part1-3", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "네트워크 vs 인터넷 vs 웹", size: 70, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "다른 컴퓨터의 파일과 웹사이트를 찾아가는 길", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
      const B = [["구독", "#E5372B", "▶"], ["좋아요", "#2D7A4E", "👍"], ["알림 설정", "#E9A400", "🔔"], ["댓글", "#2443A0", "💬"]];
      B.forEach(([name, col, ic], i) => {
        const on = k >= i + 1 ? 1 : 0, x = 170 + i * 340, y = 430, w = 300, h = 150, now = k === i + 1;
        const bounce = now ? 1 + 0.06 * Math.sin(t * 9) : 1;
        o["bb" + i] = { type: "rect", x, y, w, h, rx: 75, fill: on ? col : "#FFFFFF", stroke: col, sw: 6, op: k >= 0 ? 1 : 0, sc: on ? bounce : 0.92, z: 3, from: { sc: 0.5 } };
        o["bi" + i] = { type: "text", x: x + 66, y: y + 98, text: ic, size: 60, anchor: "middle", fill: on ? "#FFFFFF" : col, op: k >= 0 ? 1 : 0, z: 4 };
        o["bt" + i] = { type: "text", x: x + 196, y: y + 92, text: name, size: name.length > 3 ? 36 : 46, weight: 700, anchor: "middle", fill: on ? "#FFFFFF" : col, op: k >= 0 ? 1 : 0, z: 4 };
        const rp = (t * 1.4) % 1;
        o["br" + i] = { type: "rect", x: x - 20 * rp, y: y - 20 * rp, w: w + 40 * rp, h: h + 40 * rp, rx: 75 + 20 * rp, fill: "none", stroke: col, sw: 5, op: now ? 0.8 * (1 - rp) : 0, z: 2 };
      });
      o.ch = { type: "text", x: 836, y: 680, text: "궁금한 점은 댓글로 남겨 주세요", size: 40, weight: 700, anchor: "middle", fill: "fg", op: k >= 4 ? 1 : 0, z: 3, from: { y: 700 } };
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/utube-trend-tracer", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
