/* 4장 움직이는 그림 — 혼합 판(2026-10-20): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 쪽지 · 봉투 · 주소 조각을 얹는다. 예제 저장소 = seoul-trade-insight.
   좌표는 무대 그림(1672×941) 기준. */
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



  const bx = (arr, specs) => Object.fromEntries(specs.map(([n, text, color], i) => [i + 1, [...arr[n - 1], text, color]]));
  const D = {
    p04_01: [[1184, 76, 249, 76], [461, 97, 225, 75], [876, 141, 200, 83], [1472, 181, 181, 83]],
    p04_02: [[723, 69, 227, 55], [105, 293, 207, 54], [1478, 347, 170, 54], [730, 415, 221, 54]],
    p04_03: [[800, 76, 281, 59], [170, 167, 280, 62], [1251, 255, 249, 61], [812, 677, 260, 62]],
    p04_04: [[279, 33, 310, 63], [1360, 33, 269, 63], [349, 549, 232, 62], [1074, 549, 232, 62]],
    p04_05: [[1339, 91, 241, 61], [662, 162, 224, 61], [984, 342, 208, 62], [1239, 410, 240, 61], [272, 488, 240, 61]],
    p04_06: [[257, 89, 228, 52], [831, 313, 142, 50], [996, 313, 141, 50], [1161, 313, 141, 50], [1327, 313, 142, 50], [1492, 313, 141, 50], [1096, 535, 191, 48]],
    p04_07: [[280, 136, 268, 84], [794, 129, 261, 69], [1507, 313, 143, 47], [1507, 383, 143, 47], [1507, 455, 143, 47], [1507, 526, 143, 47]],
  };
  figAnim("p04_01", "그림 4-1", "이름만 아는 가게를 찾아가는 길", "4.1 이름만 아는 가게", "p04_01.jpg",
    bx(D.p04_01, [[2, "가게 이름(도메인)", C.coral], [3, "찾은 위치(IP 주소)", C.teal], [1, "간판", C.coral], [4, "실제 주소", C.blue]]),
    [{ tag: "이름만 안다", show: [1], hl: [0, 40, 560, 880] }, { tag: "지도가 위치를 찾는다", show: [2], hl: [560, 40, 470, 880] }, { tag: "가게에 도착", show: [3, 4], hl: [1030, 40, 642, 880] }]);
  figAnim("p04_02", "그림 4-2", "간판은 그대로, 건물만 이사", "4.3 도메인", "p04_02.jpg",
    bx(D.p04_02, [[2, "옛 주소(옛 IP)", C.coral], [4, "같은 이름(도메인)", C.teal], [3, "새 주소(새 IP)", C.blue], [1, "이사", C.blue]]),
    [{ tag: "옛 건물", show: [1], hl: [0, 40, 560, 880] }, { tag: "간판을 들고", show: [2], hl: [540, 300, 600, 600] }, { tag: "새 건물 · 같은 이름", show: [3, 4], hl: [1100, 40, 572, 880] }]);
  figAnim("p04_03", "그림 4-3", "간판만 단 빈 가게", "4.5 도메인 ≠ 웹사이트", "p04_03.jpg",
    bx(D.p04_03, [[2, "길 안내(DNS)", C.teal], [1, "간판(도메인)", C.blue], [4, "빈 가게(서버에 파일 없음)", C.coral], [3, "배포", C.coral]]),
    [{ tag: "길 안내는 맞았다", show: [1], hl: [0, 120, 470, 800] }, { tag: "간판도 있다", show: [2], hl: [470, 40, 660, 300] }, { tag: "가게 안이 비었다", show: [3, 4], hl: [470, 300, 1200, 600] }]);
  figAnim("p04_04", "그림 4-4", "이사 간 가게의 옛 자리 앞에서", "4.6 캐시와 TTL", "p04_04.jpg",
    bx(D.p04_04, [[3, "옛 답을 기억한 사람(캐시)", C.coral], [1, "옛 자리", C.blue], [4, "새로 물어본 사람", C.coral], [2, "새 자리", C.coral]]),
    [{ tag: "옛 답 → 옛 자리", show: [1, 2], hl: [0, 0, 720, 941] }, { tag: "새 답 → 새 자리", show: [3, 4], hl: [1000, 0, 672, 941] }, { tag: "언제 물어봤느냐", show: [], note: [520, 860, "같은 이름, 물어본 때에 따라 다른 곳", C.coral] }]);
  figAnim("p04_05", "그림 4-5", "동·호수만으로는 찾아올 수 없는 배달", "4.7 공인 IP · 사설 IP", "p04_05.jpg",
    bx(D.p04_05, [[5, "동·호수(사설 IP)", C.blue], [2, "단지 주소(공인 IP)", C.teal], [3, "경비실(공유기)", C.blue], [4, "안에서는 동·호수로", C.coral], [1, "우리 집 노트북", C.coral]]),
    [{ tag: "동·호수 쪽지", show: [1], hl: [0, 40, 570, 880] }, { tag: "단지 주소", show: [2], hl: [580, 40, 560, 880] }, { tag: "경비실이 전해 준다", show: [3, 4, 5], hl: [1150, 40, 522, 880] }]);
  figAnim("p04_06", "그림 4-6", "간판은 하나, 뒤의 창구는 여러 개", "4.9 여러 서버", "p04_06.jpg",
    bx(D.p04_06, [[1, "하나의 도메인", C.coral], [7, "요청을 나누는 장치", C.teal], [2, "서버 1", C.coral], [3, "서버 2", C.blue], [4, "서버 3", C.teal], [5, "서버 4", C.coral], [6, "서버 5", C.blue]]),
    [{ tag: "간판 하나", show: [1], hl: [0, 40, 750, 880] }, { tag: "안내 직원", show: [2], hl: [1050, 500, 400, 420] }, { tag: "창구 여러 개", show: [3, 4, 5, 6, 7], hl: [760, 230, 912, 300] }]);
  figAnim("p04_07", "그림 4-7", "내 화면에서는 열리고 친구 화면에서는 안 열릴 때", "4.10 바이브코딩 현장", "p04_07.jpg",
    bx(D.p04_07, [[1, "내 노트북에서는 열림", C.blue], [2, "친구 휴대전화는 안 열림", C.teal], [3, "공개 주소?", C.coral], [4, "DNS 풀림?", C.teal], [5, "서버 응답?", C.blue], [6, "경고·정책?", C.coral]]),
    [{ tag: "내 노트북에선 열림", show: [1], hl: [0, 60, 580, 840] }, { tag: "친구는 안 열림", show: [2], hl: [590, 60, 470, 840] }, { tag: "단계별로 나누기", show: [3, 4, 5, 6], hl: [1070, 60, 602, 840] }]);


  /* 길 위를 가는 신호 점(kit 의 dot) */
  const dot = (o, id, path, on, color, u, lag) => { o[id] = { type: "dot", path, pid: id + path.length, u: u == null ? 1 : u, r: 13, fill: color, stroke: "#FFFFFF", sw: 4, op: on, z: 7, from: { u: 0 }, lag }; };
  const route = (o, id, pts, on, color, dash) => { o[id] = { type: "path", d: poly(pts), len: plen(pts), draw: on ? 1 : 0, stroke: color, sw: 7, fill: "none", dash: dash || "", op: on ? 0.85 : 0, z: 5, from: { draw: 0 } }; };

  /* 글자 칸(흰 상자 안에 글자) */
  function txtBox(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min((opt && opt.max) || h * 0.5, (w - 20) / Math.max(1, n));
    o["tb-" + id] = { type: "rect", x, y, w, h, rx: Math.min(14, h * 0.3), fill: "#FFFFFF", stroke: color, sw: 3, op: on, z: 6, from: { sc: 0.85 } };
    o["tt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", font: opt && opt.mono ? "mono" : undefined, fill: color, op: on, z: 7 };
  }

  /* ── 4-A 이름이 주소가 되기까지 (무대 p04_a01) ── */
  const A1P = { lap: [430, 400], res: [930, 470], root: [1330, 250], com: [1300, 560], auth: [1290, 770] };
  const DRW = [[25, 782, 201, 61], [255, 782, 217, 61], [499, 782, 230, 61]];
  IT.define({
    id: "a04_01", fig: "움직이는 그림 4-A", title: "이름이 주소가 되기까지", sec: "4.4 DNS", view: [W, H], rest: 7, blank: { k: -1 },
    steps: ["이름의 주소는?", "가까운 기억부터", "리졸버에게", "루트 → .com 쪽으로", ".com → 담당 서버로", "담당 서버의 답 · TTL", "돌아오며 기억", "다시 물으면 지름길"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.5 })),
    layout(s, t) {
      const o = {}, k = s.k, on = k >= 0 ? 1 : 0; img(o, "p04_a01.jpg");
      lab(o, "lap", [340, 98, 266, 63], "내 노트북 · 브라우저", on, C.blue);
      o.addr = { type: "text", x: 220, y: 279, text: "www.example.com", size: 22, weight: 700, font: "mono", fill: C.ink, op: on, z: 5 };
      ["브라우저 캐시", "운영체제 캐시", "hosts 파일"].forEach((nm, i) => lab(o, "dr" + i, DRW[i], nm, k >= 1 ? 1 : 0, C.teal, { lag: i * 0.15 }));
      lab(o, "res", [834, 262, 203, 57], "리졸버", k >= 2 ? 1 : 0, C.coral);
      lab(o, "root", [1472, 83, 180, 58], "루트 서버", k >= 3 ? 1 : 0, C.ink);
      lab(o, "com", [1492, 476, 160, 49], ".com 담당", k >= 4 ? 1 : 0, C.ink);
      lab(o, "auth", [1483, 697, 171, 53], "example.com 담당", k >= 5 ? 1 : 0, C.ink);
      // 찾는 중 × / ✓
      const miss = (id, x, y, on2) => { o["x-" + id] = { type: "text", x, y, text: "✗", size: 46, weight: 700, anchor: "middle", fill: "#CF3F33", op: on2, z: 8 }; };
      DRW.forEach((b, i) => miss("d" + i, b[0] + b[2] / 2, b[1] - 18, k >= 1 && k <= 5 ? 1 : 0));
      miss("r", 915, 400, k >= 2 && k <= 5 ? 1 : 0);
      // 길
      route(o, "q1", [A1P.lap, A1P.res], k >= 2 && k <= 6, C.coral, "12 10");
      route(o, "q2", [A1P.res, A1P.root], k === 3, C.ink, "12 10");
      route(o, "q3", [A1P.res, A1P.com], k === 4, C.ink, "12 10");
      route(o, "q4", [A1P.res, A1P.auth], k >= 5 && k <= 6, C.coral, "12 10");
      route(o, "back", [A1P.auth, A1P.res, A1P.lap], k === 6, C.teal);
      if (k === 2) dot(o, "dt", [A1P.lap, A1P.res], 1, C.coral);
      else if (k === 3) dot(o, "dt", [A1P.res, A1P.root, A1P.res], 1, C.ink);
      else if (k === 4) dot(o, "dt", [A1P.res, A1P.com, A1P.res], 1, C.ink);
      else if (k === 5) dot(o, "dt", [A1P.res, A1P.auth], 1, C.coral);
      else if (k === 6) dot(o, "dt", [A1P.auth, A1P.res, A1P.lap], 1, C.teal);
      else o.dt = { type: "dot", path: [A1P.lap, A1P.res], pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      // 답 카드
      txtBox(o, "c3", [990, 300, 300, 56], ".com 담당은 저쪽 →", k === 3 ? 1 : 0, C.ink);
      txtBox(o, "c4", [960, 600, 320, 56], "example.com 담당은 저쪽 →", k === 4 ? 1 : 0, C.ink);
      txtBox(o, "c5", [940, 840, 360, 60], "192.0.2.10 · TTL 300", k >= 5 && k <= 6 ? 1 : 0, C.coral, { mono: true });
      // 캐시에 남은 답 + 줄어드는 TTL
      const ttl = k === 6 ? 300 - Math.floor((t * 4) % 40) : 300;
      txtBox(o, "cr", [835, 570, 200, 46], "192.0.2.10", k >= 6 ? 1 : 0, C.teal, { mono: true });
      chip(o, "ttlr", 935, 645, "TTL " + ttl, k >= 6 ? 1 : 0, C.teal, 18);
      txtBox(o, "cb", [30, 700, 190, 44], "192.0.2.10", k >= 6 ? 1 : 0, C.teal, { mono: true });
      txtBox(o, "co", [262, 700, 200, 44], "192.0.2.10", k === 6 ? 1 : 0, C.teal, { mono: true });
      // 접속 화살
      route(o, "go", [[560, 330], [800, 160], [1100, 120]], k === 6, C.blue);
      chip(o, "gol", 1060, 100, "이 주소로 접속 시작", k === 6 ? 1 : 0, C.blue, 20);
      // 다시 물으면
      hl(o, "short", [20, 690, 210, 160], k === 7, t);
      chip(o, "ok", 125, 680, "✓ 바로 찾음", k === 7 ? 1 : 0, C.teal, 22);
      if (k === 0) note(o, "n0", 380, 340, "이 이름의 IP 주소는?", 1, C.coral);
      if (k === 7) note(o, "n7", 300, 880, "거쳐 간 곳 1 — 대부분의 조회는 캐시에서 끝난다", 1, C.teal);
      return o;
    },
  });

  /* ── 4-B 주소를 바꾼 뒤의 캐시와 TTL (무대 p04_a02) ── */
  const PX = [[160, 560], [500, 560], [860, 560]], BAR = [[79, 855, 240, 32], [427, 855, 252, 32], [784, 855, 239, 32]];
  const OLDB = [1120, 240], NEWB = [1120, 560], LB = [[207, 397, 180, 52], [563, 397, 180, 52], [917, 397, 180, 52]];
  const REM = [[0.3, 0.65, 0.9], [0.3, 0.65, 0.9], [0.3, 0.65, 0.9], [1, 0.4, 0.75], [0.95, 0.35, 0.7], [0.6, 1, 1], [0.5, 0.9, 0.95]];
  const NEWP = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1], [1, 1, 1]];
  IT.define({
    id: "a04_02", fig: "움직이는 그림 4-B", title: "주소를 바꾼 뒤의 캐시와 TTL", sec: "4.6 캐시와 TTL", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["서로 다른 때 기억", "주소를 바꿨다", "모두 옛 서버로", "A의 TTL 끝 → 다시 묻기", "사람마다 다른 서버", "B · C 도 넘어감", "옛 서버 닫기"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.5 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p04_a02.jpg");
      lab(o, "ns", [848, 40, 179, 54], "담당 네임 서버", on, C.ink);
      const ip = k >= 1 ? "203.0.113.17" : "198.51.100.24";
      o.card1 = { type: "text", x: 649, y: 117, text: "shop.example.com", size: 20, weight: 700, font: "mono", anchor: "middle", fill: C.ink, op: on, z: 5 };
      o.card2 = { type: "text", x: 649, y: 148, text: "→ " + ip, size: 21, weight: 700, font: "mono", anchor: "middle", fill: k >= 1 ? C.teal : C.coral, op: on, z: 5 };
      o.card3 = { type: "text", x: 649, y: 176, text: "TTL 3600", size: 17, weight: 600, font: "mono", anchor: "middle", fill: "#5D6470", op: on, z: 5 };
      hl(o, "card", [530, 76, 240, 116], k === 1, t);
      lab(o, "old", [1467, 53, 179, 54], "옛 서버", on, C.coral); lab(o, "new", [1467, 395, 177, 53], "새 서버", on, C.teal);
      chip(o, "oldip", 1556, 128, "198.51.100.24", on, C.coral, 16); chip(o, "newip", 1556, 470, "203.0.113.17", on, C.teal, 16);
      lab(o, "clk", [1477, 712, 169, 52], "빨리 감기", on, C.ink);
      const tm = ["0분", "0분", "0분", "+20분", "+20분", "+55분", "+60분"][k];
      o.clkT = { type: "text", x: 1346, y: 815, text: tm, size: 34, weight: 700, anchor: "middle", fill: C.ink, op: on, z: 6 };
      ["사용자 A", "사용자 B", "사용자 C"].forEach((nm, i) => {
        lab(o, "p" + i, [[207, 397, 180, 52], [563, 397, 180, 52], [917, 397, 180, 52]][i], nm, on, C.blue);
        const nw = NEWP[k][i], col = nw ? C.teal : C.coral, [bx0, by, bw, bh] = BAR[i];
        o["bar" + i] = { type: "rect", x: bx0 + 3, y: by + 3, w: (bw - 6) * REM[k][i], h: bh - 6, rx: 8, fill: col, op: on * 0.85, z: 5 };
        chip(o, "cip" + i, [268, 615, 960][i], 780, nw ? "203.0.113.17" : "198.51.100.24", on, col, 16);
        const [px, py] = PX[i], to = nw ? NEWB : OLDB;
        route(o, "go" + i, [[LB[i][0] + LB[i][2] + 4, LB[i][1] + 26], to], k >= 2 && k !== 3, col, nw ? "" : "12 10");
        o["rq" + i] = { type: "path", d: poly([[px + 40, py - 120], [649, 200]]), len: 600, draw: (k === 3 && i === 0) || (k === 5 && i > 0) ? 1 : 0, stroke: C.ink, sw: 4, dash: "6 8", fill: "none", op: (k === 3 && i === 0) || (k === 5 && i > 0) ? 0.8 : 0, z: 5, from: { draw: 0 } };
      });
      o.dark = { type: "rect", x: 1110, y: 60, w: 330, h: 300, rx: 20, fill: "#1D2127", op: k === 6 ? 0.55 : 0, z: 4 };
      if (k === 4) note(o, "n4", 470, 260, "같은 이름인데 사람마다 다른 서버", 1, C.coral);
      if (k === 5) note(o, "n5", 420, 260, "퍼져 나가는 게 아니라, 만료돼 다시 묻는다", 1, C.ink);
      if (k === 6) note(o, "n6", 360, 250, "모두 넘어간 뒤에 옛 서버를 닫는다", 1, C.teal);
      return o;
    },
  });

  /* ── 4-C 집 안 번호가 바깥으로 나갈 때 (무대 p04_a03) ── */
  const NP = { lap: [393, 600], tab: [217, 530], phone: [167, 340], rt: [543, 330], cloud: [1003, 346], dc: [1371, 470], str: [1538, 170] };
  const ENV = [null, [380, 420], [770, 210], [1180, 300], [770, 210], [770, 210], [1000, 220]];
  IT.define({
    id: "a04_03", fig: "움직이는 그림 4-C", title: "집 안 번호가 바깥으로 나갈 때", sec: "4.7 NAT", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["사설 주소 꼬리표", "노트북의 요청", "공유기가 바꿔 적기", "웹사이트엔 바깥 주소", "답장은 기록표대로", "태블릿도 같은 주소", "바깥에서 사설 주소로 ✗"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.5 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p04_a03.jpg");
      lab(o, "lap", [444, 503, 161, 45], "노트북", on, C.blue); lab(o, "tab", [28, 496, 145, 44], "태블릿", on, C.blue); lab(o, "ph", [94, 250, 159, 44], "휴대전화", on, C.blue);
      chip(o, "ipl", 524, 568, "192.168.0.23", on, C.blue, 16); chip(o, "ipt", 100, 560, "192.168.0.24", on, C.blue, 16); chip(o, "ipp", 173, 314, "192.168.0.25", on, C.blue, 16);
      lab(o, "rt", [522, 208, 162, 44], "공유기", on, C.teal);
      chip(o, "rti", 603, 274, "안 192.168.0.1 · 밖 203.0.113.5", on, C.teal, 15);
      lab(o, "cl", [947, 155, 175, 44], "인터넷", on, C.ink); lab(o, "dc", [1418, 387, 178, 44], "웹사이트", on, C.blue);
      chip(o, "dci", 1507, 450, "198.51.100.24", on, C.blue, 16);
      lab(o, "bd", [1373, 687, 213, 54], k >= 3 ? "보이는 주소 203.0.113.5" : "보이는 주소", on, C.coral);
      lab(o, "st", [1327, 67, 161, 44], "바깥의 낯선 컴퓨터", k >= 6 ? 1 : 0, C.coral);
      // 기록표
      o.tbl = { type: "rect", x: 640, y: 20, w: 300, h: 118, rx: 14, fill: "#FFFFFF", stroke: C.teal, sw: 3, op: k >= 2 ? 1 : 0, z: 6 };
      o.tblT = { type: "text", x: 660, y: 50, text: "공유기 기록표", size: 19, weight: 700, fill: C.teal, op: k >= 2 ? 1 : 0, z: 7 };
      o.tr1 = { type: "text", x: 660, y: 84, text: "노트북 ↔ 대화 1", size: 19, weight: 600, fill: C.ink, op: k >= 2 ? 1 : 0, z: 7 };
      o.tr2 = { type: "text", x: 660, y: 116, text: "태블릿 ↔ 대화 2", size: 19, weight: 600, fill: C.ink, op: k >= 5 ? 1 : 0, z: 7, from: { y: 130 } };
      // 봉투
      const reply = k === 4, stranger = k === 6;
      const from = k === 1 ? "192.168.0.23" : reply ? "198.51.100.24" : stranger ? "낯선 컴퓨터" : k === 5 ? "203.0.113.5 (태블릿)" : "203.0.113.5";
      const to = reply ? "203.0.113.5 → 노트북" : stranger ? "192.168.0.23" : "198.51.100.24";
      const ep = ENV[k] || [380, 420], eon = k >= 1 ? 1 : 0, col = stranger ? "#CF3F33" : reply ? C.coral : C.blue;
      o.env = { type: "rect", x: ep[0], y: ep[1], w: 320, h: 92, rx: 12, fill: "#FFFDF6", stroke: col, sw: 3, op: eon, z: 8 };
      o.envA = { type: "text", x: ep[0] + 16, y: ep[1] + 36, text: "보내는 사람 " + from, size: 18, weight: 700, fill: (k === 2 || k === 5) ? C.coral : C.ink, op: eon, z: 9 };
      o.envB = { type: "text", x: ep[0] + 16, y: ep[1] + 70, text: "받는 사람 " + to, size: 18, weight: 700, fill: C.ink, op: eon, z: 9 };
      hl(o, "rth", [470, 180, 280, 220], k === 2 || k === 4, t);
      route(o, "out", [NP.lap, NP.rt, NP.cloud, NP.dc], k >= 1 && k <= 3, C.blue);
      route(o, "back", [NP.dc, NP.cloud, NP.rt, NP.lap], k === 4, C.coral, "12 10");
      route(o, "tab", [NP.tab, NP.rt, NP.cloud, NP.dc], k === 5, C.blue);
      route(o, "str", [NP.str, NP.cloud], k === 6, "#CF3F33", "10 10");
      o.sx = { type: "text", x: 1003, y: 420, text: "✗", size: 80, weight: 700, anchor: "middle", fill: "#CF3F33", op: k === 6 ? 1 : 0, z: 9 };
      if (k === 6) note(o, "n6", 760, 860, "사설 주소로는 바깥에서 찾아올 수 없다", 1, "alert");
      if (k === 5) note(o, "n5", 760, 860, "바깥에선 같은 주소 · 구분은 기록표가", 1, C.teal);
      return o;
    },
  });

  /* ── 4-D URL을 조각내 읽기 (무대 p04_a04) ── */
  const DX = [184, 443, 702, 961, 1220, 1480];
  const URLS = [
    { u: "https://shop.example.com:443/items?id=7#review", p: ["https", "shop.example.com", ":443", "/items", "?id=7", "#review"] },
    { u: "https://daehyub71.github.io/seoul-trade-insight/area/?ta=3110131&biz=CS100010", p: ["https", "daehyub71.github.io", "(443)", "/seoul-trade-insight/area/", "?ta=3110131&biz=CS100010", "—"] },
    { u: "https://example.com.fake-site.invalid/login", p: ["https", "example.com.fake-site.invalid", "(443)", "/login", "—", "—"] },
  ];
  IT.define({
    id: "a04_04", fig: "움직이는 그림 4-D", title: "URL을 조각내 읽기", sec: "4.8 URL", view: [W, H], rest: 8, blank: { k: -1 },
    steps: ["긴 주소", "방식", "호스트 이름 · 오른쪽부터", "포트(생략 가능)", "경로", "질의 문자열", "조각은 브라우저에만", "상권 사이트 주소", "진짜 주인은 오른쪽 끝"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p04_a04.jpg");
      const U = URLS[k >= 8 ? 2 : k >= 7 ? 1 : 0], full = k >= 7;
      o.url = { type: "text", x: 205, y: 134, text: U.u, size: U.u.length > 60 ? 25 : 32, weight: 700, font: "mono", fill: C.ink, op: on, z: 6 };
      const NM = ["방식", "호스트 이름", "포트", "경로", "질의 문자열", "조각"], COL = [C.coral, "#B47F00", C.teal, C.blue, "#7A4FB5", "#5D6470"];
      const BX = [[72, 232, 231, 62], [332, 232, 230, 62], [589, 232, 230, 62], [851, 236, 223, 54], [1109, 236, 223, 54], [1369, 232, 231, 62]];
      NM.forEach((nm, i) => {
        const shown = full || k >= i + 1;
        lab(o, "n" + i, BX[i], nm, on, COL[i]);
        const v = U.p[i], sz = Math.min(24, 225 / Math.max(1, v.length * 0.6));
        o["v" + i] = { type: "text", x: DX[i], y: 470, text: v, size: sz, weight: 700, font: "mono", anchor: "middle", fill: COL[i], op: shown ? (i === 2 && !full ? (k >= 3 ? 0.55 : 0) : 1) : 0, z: 6, from: { y: 160 } };
      });
      chip(o, "omit", DX[2], 520, "생략 가능", k >= 3 && !full ? 1 : 0, C.teal, 18);
      // 지금 꺼낸 조각을 크게
      const BIG = [null, ["https", "방식 — 어떤 규칙으로 통신할지", 0], ["shop.example.com", "호스트 이름 — 오른쪽부터 com → example → shop", 1], [":443", "포트 — https 기본 문이라 보통 생략", 2],
        ["/items", "경로 — 서버 안의 어느 자원인지", 3], ["?id=7", "질의 문자열 — id(이름) = 7(값)", 4], ["#review", "조각 — 서버로 보내지 않고 브라우저가 쓴다", 5],
        ["?ta=3110131&biz=CS100010", "질의 문자열 — 어느 상권 · 어느 업종", 4], ["example.com.fake-site.invalid", "등록 도메인은 오른쪽 끝 fake-site.invalid", 1]][k];
      const bon = BIG ? 1 : 0, bt = BIG ? BIG[0] : "", bcol = BIG ? (k === 8 ? "#CF3F33" : COL[BIG[2]]) : C.ink;
      o.bigB = { type: "rect", x: 395, y: 600, w: 480, h: 140, rx: 18, fill: "#FFFFFF", stroke: bcol, sw: 4, op: bon, z: 6 };
      o.bigT = { type: "text", x: 635, y: 670, text: bt, size: Math.min(40, 440 / Math.max(1, bt.length * 0.6)), weight: 700, font: "mono", anchor: "middle", fill: bcol, op: bon, z: 7, from: { y: 690 } };
      o.bigS = { type: "text", x: 635, y: 716, text: BIG ? BIG[1] : "", size: 19, weight: 600, anchor: "middle", fill: "#5D6470", op: bon, z: 7 };
      lab(o, "sv", [892, 554, 253, 62], "서버로 간다", k >= 6 && k <= 7 ? 1 : 0, C.teal);
      lab(o, "br", [1363, 554, 253, 62], "브라우저에만 남는다", k >= 6 && k <= 7 ? 1 : 0, "#5D6470");
      [0, 1, 2, 3, 4].forEach((i) => { o["ar" + i] = { type: "path", d: poly([[DX[i], 540], [1020, 700]]), len: 900, draw: k === 6 ? 1 : 0, stroke: C.teal, sw: 3, fill: "none", op: k === 6 ? 0.6 : 0, z: 4, from: { draw: 0 } }; });
      o.ar5 = { type: "path", d: poly([[DX[5], 540], [1480, 700]]), len: 300, draw: k === 6 ? 1 : 0, stroke: "#5D6470", sw: 4, fill: "none", dash: "8 8", op: k === 6 ? 0.8 : 0, z: 4, from: { draw: 0 } };
      lab(o, "warn", [119, 557, 252, 61], "진짜 주인은 오른쪽 끝", k === 8 ? 1 : 0, "#CF3F33");
      hl(o, "host", [318, 380, 250, 130], k === 2 || k === 8, t);
      if (k === 8) note(o, "n8", 260, 860, "등록 도메인 = fake-site.invalid  (example.com. 은 앞에 붙은 하위 이름)", 1, "alert");
      if (k === 7) note(o, "n7", 260, 860, "상세 화면 주소도 같은 틀 — 질의 문자열이 「어느 상권 · 어느 업종」", 1, C.blue);
      return o;
    },
  });

  IT.define({
    id: "e04", fig: "다음 시간", title: "Part1-5 localhost와 포트", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part1-5", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "localhost와 포트", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "내 컴퓨터 안의 주소와 출입문 번호", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/seoul-trade-insight", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
