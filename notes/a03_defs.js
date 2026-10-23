/* 3장 움직이는 그림 — 혼합 판(2026-10-20): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 점 · 끊김 표시 · 계기판을 얹는다.
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
    p03_01: [[552, 21, 568, 78], [847, 238, 225, 84], [1417, 235, 217, 82], [316, 326, 252, 81]],
    p03_02: [[331, 77, 199, 56], [698, 248, 190, 56], [964, 289, 186, 49], [1236, 345, 202, 49], [1462, 479, 186, 49]],
    p03_03: [[906, 83, 199, 64], [46, 187, 212, 66], [300, 187, 223, 66], [1410, 232, 236, 73]],
    p03_04: [[1195, 286, 283, 67], [142, 772, 412, 70], [122, 54, 442, 138], [1104, 54, 444, 138]],
    p03_05: [[425, 74, 226, 55], [1436, 47, 210, 56], [748, 250, 241, 54], [361, 667, 261, 57], [1222, 769, 270, 60]],
    p03_06: [[583, 65, 283, 64], [1362, 131, 261, 68], [695, 464, 267, 55], [171, 637, 310, 62], [1173, 686, 252, 56]],
    p03_07: [[241, 156, 230, 69], [1405, 165, 255, 70], [1020, 239, 146, 50], [1016, 364, 153, 55], [1017, 506, 152, 55]],
  };
  figAnim("p03_01", "그림 3-1", "신호는 꽉 찼는데 열리지 않는 사이트", "3.1 와이파이는 잡혔는데", "p03_01.jpg",
    bx(D.p03_01, [[4, "와이파이 연결됨", C.teal], [2, "카페 공유기", C.blue], [3, "바깥 길(인터넷)이 막힘", C.coral], [1, "연결됨, 인터넷 없음", C.blue]]),
    [{ tag: "와이파이 꽉 참", show: [1], hl: [0, 60, 600, 820] }, { tag: "공유기", show: [2], hl: [610, 60, 470, 820] }, { tag: "바깥 길이 막힘", show: [3, 4], hl: [1090, 60, 582, 820] }]);
  figAnim("p03_02", "그림 3-2", "도로망과 그 위의 서비스", "3.1 세 단어 나누기", "p03_02.jpg",
    bx(D.p03_02, [[1, "네트워크 · 동네 도로", C.coral], [5, "인터넷 · 전국 도로망", C.blue], [2, "웹 · 택배", C.coral], [4, "이메일", C.blue], [3, "메신저 · 게임", C.teal]]),
    [{ tag: "네트워크", show: [1], hl: [0, 0, 760, 520] }, { tag: "인터넷", show: [2], hl: [480, 160, 1192, 600] }, { tag: "웹 · 그 밖의 서비스", show: [3, 4, 5] }]);
  figAnim("p03_03", "그림 3-3", "인터넷 없이도 있을 수 있는 네트워크", "3.2 네트워크", "p03_03.jpg",
    bx(D.p03_03, [[2, "바깥 회선 끊김", C.coral], [3, "공유기 · 집 네트워크", C.teal], [4, "인쇄는 된다", C.blue], [1, "인터넷은 안 된다", C.coral]]),
    [{ tag: "모뎀 빨간 불", show: [1], hl: [20, 150, 260, 540] }, { tag: "인쇄는 된다", show: [2, 3], hl: [260, 150, 1400, 620] }, { tag: "인터넷은 안 됨", show: [4] }]);
  figAnim("p03_04", "그림 3-4", "넓은 길 vs 빨리 돌아오는 답장", "3.7 대역폭과 지연시간", "p03_04.jpg",
    bx(D.p03_04, [[3, "대역폭 · 한 번에 나르는 양", C.blue], [2, "큰 파일 내려받기", C.teal], [4, "지연시간 · 한 번 오가는 시간", C.coral], [1, "버튼 반응 · 화상회의", C.blue]]),
    [{ tag: "대역폭", show: [1, 2], hl: [0, 230, 860, 700] }, { tag: "지연시간", show: [3, 4], hl: [860, 230, 812, 700] }]);
  figAnim("p03_05", "그림 3-5", "집 밖에서 내 웹앱에 도달하기", "3.9 다른 동네의 친구", "p03_05.jpg",
    bx(D.p03_05, [[2, "링크를 보낸 사람", C.coral], [4, "친구의 휴대전화(클라이언트)", C.coral], [1, "이동통신망", C.teal], [3, "인터넷", C.blue], [5, "웹앱을 내어 주는 서버", C.teal]]),
    [{ tag: "링크를 연 친구", show: [1, 2], hl: [0, 60, 480, 860] }, { tag: "이동통신망 · 인터넷", show: [3, 4], hl: [400, 100, 820, 560] }, { tag: "서버", show: [5], hl: [1000, 340, 672, 560] }]);
  figAnim("p03_06", "그림 3-6", "출입문이 엄격한 캠퍼스", "3.10 폐쇄망", "p03_06.jpg",
    bx(D.p03_06, [[1, "내부망(폐쇄망)", C.teal], [2, "내부 서버", C.blue], [3, "안에서는 서로 통한다", C.teal], [5, "출입 통제", C.blue], [4, "바깥 인터넷", C.coral]]),
    [{ tag: "안에서는 통한다", show: [1, 2, 3], hl: [380, 20, 1290, 600] }, { tag: "출입 통제", show: [4, 5], hl: [140, 560, 1400, 360] }]);
  figAnim("p03_07", "그림 3-7", "막힌 층을 AI에게 설명하기", "3.10 폐쇄망", "p03_07.jpg",
    bx(D.p03_07, [[1, "ConnectionError", C.coral], [3, "와이파이(네트워크)", C.teal], [4, "바깥(인터넷) · 막힘", C.coral], [5, "그 사이트(웹)", C.blue], [2, "여기서 막혔다", C.coral]]),
    [{ tag: "어느 층?", show: [1, 2, 3, 4], hl: [500, 60, 680, 840] }, { tag: "AI에게 알리기", show: [5], hl: [1180, 60, 492, 840], note: [560, 860, "막힌 층을 AI에게 알려 준다", C.coral] }]);

  /* 길 위를 가는 신호 점(kit 의 dot) */
  const dot = (o, id, path, on, color, u, lag) => { o[id] = { type: "dot", path, pid: id + path.length, u: u == null ? 1 : u, r: 13, fill: color, stroke: "#FFFFFF", sw: 4, op: on, z: 7, from: { u: 0 }, lag }; };
  const route = (o, id, pts, on, color, dash) => { o[id] = { type: "path", d: poly(pts), len: plen(pts), draw: on ? 1 : 0, stroke: color, sw: 7, fill: "none", dash: dash || "", op: on ? 0.85 : 0, z: 5, from: { draw: 0 } }; };

  /* ── 3-A 동네 도로에서 전국 도로망으로 (무대 p03_a01) ── */
  const P1 = { laptop: [130, 455], router: [280, 405], j1: [656, 337], tel: [850, 300], j2: [1029, 341], j3: [1055, 469], j4: [849, 527], j5: [630, 457], dc: [1450, 330], phone: [482, 815], tower: [1215, 690], j6: [849, 694] };
  const ISL = [[600, 205], [1100, 215], [600, 555], [1080, 550]];
  const GO = [P1.router, [470, 395], P1.j1, P1.tel, P1.j2, [1230, 380], P1.dc];
  const BACK = [P1.dc, [1230, 400], P1.j3, P1.j4, P1.j5, [470, 415], P1.router];
  const FRIEND = [P1.phone, [700, 800], P1.j6, [1000, 690], P1.tower, [1150, 560], P1.j3, P1.j2, [1230, 380], P1.dc];
  const FRIEND2 = [P1.phone, [700, 800], P1.j6, P1.j4, P1.j5, [470, 415], P1.router];
  IT.define({
    id: "a03_01", fig: "움직이는 그림 3-A", title: "동네 도로에서 전국 도로망으로", sec: "3.3 인터넷", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["와이파이 = 네트워크", "공유기 → 통신사", "라우터가 길을 고른다", "답장", "바깥 길이 끊기면", "다른 동네 친구", "내 노트북에서만 켠 앱"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.6 })),
    layout(s, t) {
      const o = {}, k = s.k, on = k >= 0 ? 1 : 0; img(o, "p03_a01.jpg");
      lab(o, "cafe", [55, 180, 160, 50], "카페", on, C.coral); lab(o, "rt", [275, 211, 164, 43], "공유기", on, C.teal); lab(o, "pr", [356, 386, 68, 34], "프린터", on, C.blue);
      lab(o, "tel", [743, 159, 168, 40], "통신사", k >= 1 ? 1 : 0, C.blue); lab(o, "dc", [1459, 183, 161, 42], "서버", k >= 2 ? 1 : 0, C.blue);
      [[548, 61, 148, 40], [1048, 64, 150, 38], [513, 628, 142, 40], [1028, 623, 143, 41]].forEach((b, i) => lab(o, "is" + i, b, "네트워크 " + "ABCD"[i], k >= 2 ? 1 : 0, C.teal, { lag: i * 0.15 }));
      lab(o, "tw", [1297, 657, 183, 51], "기지국", k >= 5 ? 1 : 0, C.teal); lab(o, "fr", [200, 757, 201, 44], "다른 동네 친구", k >= 5 ? 1 : 0, C.coral);
      // 와이파이 물결
      for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; o["wf" + i] = { type: "circle", cx: P1.router[0], cy: P1.router[1], r: 20 + 90 * ph, fill: "none", stroke: C.teal, sw: 4, op: on * (1 - ph) * 0.9, z: 4 }; }
      chip(o, "lyN", 210, 140, "네트워크", on, C.teal, 22);
      chip(o, "lyI", 850, 470, "인터넷", k >= 2 ? 1 : 0, C.blue, 24);
      chip(o, "lyW", 1540, 140, "웹 서비스", k >= 3 ? 1 : 0, C.coral, 22);
      // 길 · 신호
      const cut = k === 4;
      route(o, "rOut", GO.slice(0, 4), k >= 1 && k !== 6, cut ? "#CF3F33" : C.blue, cut ? "10 12" : "");
      route(o, "rNet", GO.slice(3), k >= 2 && k <= 3, C.blue);
      route(o, "rBack", BACK, k === 3, C.coral, "14 10");
      route(o, "rFr", k === 6 ? FRIEND2 : FRIEND, k >= 5, C.teal);
      if (k === 2) ISL.forEach(([x, y], i) => { o["isl" + i] = { type: "circle", cx: x, cy: y, r: 70 + 6 * Math.sin(t * 4 + i), fill: "none", stroke: C.blue, sw: 5, op: 0.35 + 0.3 * Math.sin(t * 3 + i * 1.5), z: 4 }; });
      else ISL.forEach((p, i) => { o["isl" + i] = { type: "circle", cx: p[0], cy: p[1], r: 70, fill: "none", op: 0, z: 4 }; });
      if (k === 2) dot(o, "d", GO, 1, C.blue);
      else if (k === 3) dot(o, "d", BACK, 1, C.coral);
      else if (k === 5) dot(o, "d", FRIEND, 1, C.teal);
      else if (k === 6) dot(o, "d", FRIEND2, 1, C.teal);
      else o.d = { type: "dot", path: GO, pid: "none", u: 0, r: 13, fill: C.blue, op: 0, z: 7 };
      o.x = { type: "text", x: 470, y: 380, text: "✗", size: 64, weight: 700, anchor: "middle", fill: "#CF3F33", op: cut ? 1 : 0, z: 8 };
      if (cut) { note(o, "cn", 60, 560, "와이파이 ✓ · 프린터 ✓ · 인터넷 ✗", 1, "alert"); }
      if (k === 6) { o.q = { type: "text", x: 350, y: 360, text: "?", size: 70, weight: 700, anchor: "middle", fill: "#CF3F33", op: 1, z: 8 }; note(o, "qn", 520, 870, "앱이 내 노트북에서만 돌면 친구는 못 온다 (5장 · 24장)", 1, C.coral); }
      return o;
    },
  });

  /* ── 3-B 관계를 겹쳐서 보기 (무대 p03_a02) ── */
  const CIR = [[478, 420, "집", [157, 312, 173, 45]], [798, 420, "카페", [929, 312, 172, 45]], [378, 690, "학교", [53, 568, 184, 44]], [748, 690, "회사", [907, 568, 186, 44]]];
  const CARD = [[362, 190, "웹", [271, 50, 179, 37]], [678, 190, "이메일", [591, 50, 175, 37]], [994, 190, "메신저", [907, 50, 174, 37]], [1308, 190, "게임", [1223, 50, 177, 37]]];
  IT.define({
    id: "a03_02", fig: "움직이는 그림 3-B", title: "관계를 겹쳐서 보기", sec: "3.4 웹", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["기기 몇 대 = 네트워크", "곳곳의 네트워크", "이은 것 = 인터넷", "웹은 그 위 서비스", "이메일 · 메신저 · 게임", "페이지와 API", "떨어진 사내망"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = s.k, on = k >= 0 ? 1 : 0; img(o, "p03_a02.jpg");
      cover(o, "inner", [302, 159, 127, 79], 0);
      CIR.forEach(([x, y, nm, b], i) => {
        const lit = i === 0 ? on : k >= 1 ? 1 : 0;
        lab(o, "c" + i, b, nm + " 네트워크", lit, C.teal, { lag: i * 0.15 });
        o["cr" + i] = { type: "circle", cx: x, cy: y, r: 128, fill: "none", stroke: C.teal, sw: 6, op: (i === 0 && k === 0) || (k === 1 && i > 0) ? 0.9 : 0, z: 3 };
      });
      // 집 안 기기 연결(0단계)
      [[430, 380], [520, 370], [480, 470]].forEach(([x, y], i, a) => { const [x2, y2] = a[(i + 1) % 3]; o["dv" + i] = { type: "line", x1: x, y1: y, x2, y2, stroke: C.teal, sw: 4, dash: "6 6", op: on, z: 4 }; o["dd" + i] = { type: "circle", cx: x, cy: y, r: 10, fill: C.teal, op: on, z: 4 }; });
      // 인터넷 고리
      o.ring = { type: "path", d: "M150,555 C150,250 1100,250 1100,555 C1100,860 150,860 150,555 Z", stroke: C.blue, sw: 10, fill: "none", len: 2200, draw: k >= 2 ? 1 : 0, op: k >= 2 ? 0.8 : 0, z: 2, from: { draw: 0 } };
      chip(o, "inet", 625, 555, "인터넷", k >= 2 ? 1 : 0, C.blue, 30);
      // 서비스 카드
      CARD.forEach(([x, y, nm, b], i) => {
        const lit = i === 0 ? (k >= 3 ? 1 : 0) : k >= 4 ? 1 : 0;
        lab(o, "k" + i, b, nm, lit, i === 0 ? C.coral : C.blue, { lag: i * 0.12 });
        o["kc" + i] = { type: "rect", x: x - 82, y: y - 72, w: 164, h: 144, rx: 20, fill: "none", stroke: i === 0 ? C.coral : C.blue, sw: 6, op: lit && ((k === 3 && i === 0) || (k === 4 && i > 0)) ? 0.9 : 0, z: 3 };
        o["kl" + i] = { type: "line", x1: x, y1: y + 74, x2: x, y2: 300, stroke: i === 0 ? C.coral : C.blue, sw: 4, dash: "8 6", op: lit, z: 2 };
      });
      chip(o, "pg", 330, 290, "사람이 보는 페이지", k >= 5 ? 1 : 0, C.coral, 22); chip(o, "api", 650, 290, "프로그램이 읽는 데이터(API)", k >= 5 ? 1 : 0, C.coral, 22);
      // 떨어진 사내망
      lab(o, "intra", [1452, 474, 171, 39], "사내망", k >= 6 ? 1 : 0, C.teal);
      o.intraR = { type: "circle", cx: 1388, cy: 690, r: 140, fill: "none", stroke: C.teal, sw: 6, op: k >= 6 ? 0.9 : 0, z: 3 };
      if (k >= 6) note(o, "in", 1120, 856, "인터넷과 떨어져도 네트워크", 1, C.teal);
      lab(o, "btn", [753, 854, 163, 49], "인터넷 끊기", on, "#8A93A3");
      return o;
    },
  });

  /* ── 3-C 여러 묶음으로 전달되는 사진 (무대 p03_a03) ── */
  const LANE = [[[300, 420], [480, 400], [640, 262], [825, 235], [1010, 262], [1170, 400], [1210, 430]], [[300, 420], [825, 420], [1210, 430]], [[300, 420], [480, 440], [640, 580], [825, 610], [1010, 580], [1170, 450], [1210, 430]]];
  function at(pts, u) {
    const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let r = u * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const f = r / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } r -= seg[i]; }
    return pts[pts.length - 1];
  }
  const TCOL = ["#1B66C9", "#2A7BD8", "#03807F", "#0F9B8E", "#3B82E0", "#1F3A5F", "#2FA39E", "#4C6FD0"];
  const ORDER = [2, 0, 5, 1, 7, 4, 3, 6];     // 도착 순서(뒤섞임)
  IT.define({
    id: "a03_03", fig: "움직이는 그림 3-C", title: "여러 묶음으로 전달되는 사진", sec: "3.6 패킷", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["조각으로 나누기", "주소와 번호", "각자 길로", "순서가 뒤섞인다", "번호대로 맞추기", "사라진 묶음 다시 보내기", "3MB ≈ 2천 묶음"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.6 })),
    layout(s, t) {
      const o = {}, k = s.k, on = k >= 0 ? 1 : 0; img(o, "p03_a03.jpg");
      lab(o, "ph", [316, 102, 220, 56], "보내는 휴대전화", on, C.coral); lab(o, "rd", [773, 96, 240, 64], "여러 갈래 길", on, C.teal);
      lab(o, "lp", [1396, 95, 214, 53], "받는 노트북", on, C.blue); lab(o, "bd", [1396, 731, 226, 52], "조립판", on, C.coral);
      ["묶음 잃어버리기", "사진 크기", "같은 길로만"].forEach((nm, i) => lab(o, "b" + i, [[331, 797, 276, 64], [698, 796, 277, 65], [1065, 796, 276, 65]][i], nm, on, k === 5 && i === 0 ? C.coral : "#8A93A3"));
      // 조립판 칸
      for (let i = 0; i < 8; i++) { const cx = 1135 + (i % 4) * 110, cy = 500 + Math.floor(i / 4) * 98; o["cell" + i] = { type: "rect", x: cx, y: cy, w: 96, h: 84, rx: 10, fill: "#FFFFFF", stroke: "#C9B79A", sw: 3, op: on, z: 3 }; }
      for (let i = 0; i < 8; i++) {
        const cell = [1135 + (i % 4) * 110, 500 + Math.floor(i / 4) * 98], home = [92 + (i % 2) * 92, 180 + Math.floor(i / 2) * 116];
        const lane = LANE[i % 3], rank = ORDER.indexOf(i);
        let x, y, w = 84, h = 74, op = on;
        if (k <= 1) { [x, y] = home; }
        else if (k === 2) { const [px, py] = at(lane, 0.3 + 0.05 * (i % 4)); x = px - 42; y = py - 37; }
        else if (k === 3) { const [px, py] = at(lane, 0.62 + 0.045 * (7 - rank)); x = px - 42; y = py - 37; }
        else { [x, y] = cell; w = 96; h = 84; }
        if (k === 5 && i === 5) { const [px, py] = at(LANE[1], 0.55 + 0.3 * ((t * 0.35) % 1)); x = px - 42; y = py - 37; w = 84; h = 74; }
        o["tile" + i] = { type: "rect", x, y, w, h, rx: 10, fill: TCOL[i], stroke: "#FFFFFF", sw: 3, op, z: 6 };
        o["tn" + i] = { type: "text", x: x + w / 2, y: y + h / 2 + 14, text: String(i + 1), size: 38, weight: 700, anchor: "middle", fill: "#FFFFFF", op: k >= 1 ? op : 0, z: 7 };
        o["ta" + i] = { type: "text", x: x + w / 2, y: y + 18, text: "→노트북", size: 13, weight: 700, anchor: "middle", fill: "#FFFFFF", op: k >= 1 && k <= 3 ? op : 0, z: 7 };
      }
      if (k === 5) { o.miss = { type: "rect", x: 1135 + 1 * 110, y: 598, w: 96, h: 84, rx: 10, fill: "#FBE2DE", stroke: "#CF3F33", sw: 4, dash: "8 6", op: 0, z: 5 };
        note(o, "ack", 640, 690, "「1~5 · 7 · 8 받았다」 → 6번을 다시 보낸다", 1, C.coral); }
      if (k === 3) note(o, "mix", 560, 690, "3번이 1번보다 먼저 도착하기도 한다", 1, C.coral);
      if (k === 6) note(o, "calc", 520, 690, "3MB ÷ 약 1,500바이트 ≈ 2,000묶음", 1, C.blue);
      return o;
    },
  });

  /* ── 3-D 대역폭과 지연시간 실험실 (무대 p03_a04) ── */
  const ROAD = [[470, 360], [560, 255], [700, 232], [820, 305], [950, 330], [1080, 272], [1200, 300], [1290, 340]];
  const G1 = [620, 612], G2 = [1040, 612];
  const ST = [   // 대역폭(Mbps) · 지연(ms) · 서버(초) · 1GB 시간 · 버튼 반응
    { bw: 100, lat: 20, srv: 0, dl: "약 80초", btn: "0.04초" }, { bw: 1000, lat: 20, srv: 0, dl: "약 8초", btn: "0.04초" },
    { bw: 1000, lat: 20, srv: 0, dl: "약 8초", btn: "0.04초", ball: true }, { bw: 1000, lat: 200, srv: 0, dl: "약 8초", btn: "0.4초", ball: true, far: true },
    { bw: 1000, lat: 200, srv: 0, dl: "약 8초", btn: "0.4초", ball: true, far: true, talk: true }, { bw: 1000, lat: 20, srv: 1.8, dl: "약 8초", btn: "약 1.8초", ball: true, think: true },
    { bw: 100, lat: 20, srv: 0, dl: "약 80초", btn: "0.04초", unit: true },
  ];
  IT.define({
    id: "a03_04", fig: "움직이는 그림 3-D", title: "대역폭과 지연시간 실험실", sec: "3.7 대역폭과 지연시간", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["폭과 길이", "넓히면 = 대역폭", "버튼 신호는 그대로", "멀면 = 지연시간", "화상회의 · 게임", "서버가 생각하는 시간", "Mbps 와 MB"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = s.k, S = ST[Math.max(0, k)], on = k >= 0 ? 1 : 0; img(o, "p03_a04.jpg");
      lab(o, "lp", [83, 104, 295, 61], "내 노트북", on, C.blue); lab(o, "rd", [695, 120, 299, 63], "길 · 폭과 길이", on, C.teal); lab(o, "sv", [1329, 126, 294, 63], S.far ? "바다 건너 서버" : "서버", on, C.coral);
      lab(o, "g1", [174, 570, 272, 62], "1GB 내려받기", on, C.teal); lab(o, "g2", [1224, 563, 275, 60], "버튼 반응", on, C.coral);
      lab(o, "b1", [51, 774, 157, 57], "대역폭", on, C.blue); lab(o, "b2", [584, 774, 162, 57], "지연시간", on, C.teal); lab(o, "b3", [1107, 774, 163, 57], "서버 처리", on, C.coral);
      // 길 폭(차로)
      const lanes = S.bw >= 1000 ? 8 : 2;
      o.lanes = { type: "path", d: poly(ROAD), stroke: C.blue, sw: lanes * 9, fill: "none", op: on * 0.28, z: 3 };
      for (let i = 0; i < 6; i++) { const [x, y] = at(ROAD, ((t * 0.12 + i / 6) % 1)); o["trk" + i] = { type: "rect", x: x - 18, y: y - 10 - (i % 2) * (lanes > 2 ? 18 : 0), w: 36, h: 20, rx: 5, fill: C.blue, op: on * (i < (lanes > 2 ? 6 : 2) ? 0.9 : 0), z: 4 }; }
      // 버튼 신호 공(왕복)
      const per = S.far ? 4.0 : 1.6, ph = ((t / per) % 1), u = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      const waitPh = S.think && ph > 0.45 && ph < 0.75;
      const [bx_, by_] = at(ROAD, S.think ? Math.min(1, u * 1.2) : u);
      o.ball = { type: "circle", cx: bx_, cy: by_ - 30, r: 14, fill: ph < 0.5 ? "#F2B705" : C.coral, stroke: "#FFFFFF", sw: 3, op: S.ball ? 1 : 0, z: 6 };
      o.hg = { type: "circle", cx: 1475, cy: 95, r: 52, fill: "none", stroke: "#F2B705", sw: 7, op: S.think ? 0.6 + 0.4 * Math.sin(t * 6) : 0, z: 5 };
      // 계기판 바늘 · 숫자
      const ang = (v) => Math.PI * (0.85 + 1.3 * v);
      const needle = (id, [cx, cy], v, col) => { const a = ang(v); o[id] = { type: "line", x1: cx, y1: cy, x2: cx + Math.cos(a) * 70, y2: cy + Math.sin(a) * 70, stroke: col, sw: 8, op: on, z: 6 }; };
      needle("n1", G1, S.bw >= 1000 ? 0.1 : 0.85, "#1F3A5F"); needle("n2", G2, S.think ? 0.95 : S.far ? 0.6 : 0.08, "#1F3A5F");
      chip(o, "v1", G1[0], G1[1] + 125, S.dl, on, C.teal, 26); chip(o, "v2", G2[0], G2[1] + 125, S.btn, on, C.coral, 26);
      // 막대 손잡이
      const knob = (id, x0, x1, v, col) => { o[id] = { type: "circle", cx: x0 + (x1 - x0) * v, cy: 816, r: 18, fill: col, stroke: "#FFFFFF", sw: 4, op: on, z: 6 }; };
      knob("k1", 230, 540, S.bw >= 1000 ? 0.95 : 0.3, C.blue); knob("k2", 770, 1080, S.lat >= 200 ? 0.9 : 0.15, C.teal); knob("k3", 1310, 1606, S.srv > 0 ? 0.9 : 0.05, C.coral);
      chip(o, "kv1", 385, 870, S.bw + " Mbps", on, C.blue, 20); chip(o, "kv2", 925, 870, S.lat + " ms", on, C.teal, 20); chip(o, "kv3", 1458, 870, S.srv + " 초", on, C.coral, 20);
      if (S.talk) note(o, "tk", 520, 440, "말풍선이 0.4초 늦게 도착 → 대화가 엇갈린다", 1, C.coral);
      if (S.unit) note(o, "un", 480, 440, "100 Mbps(비트) ≈ 초당 12.5 MB(바이트)", 1, C.blue);
      if (k === 2) note(o, "same", 560, 440, "길을 넓혀도 공의 왕복 시간은 그대로", 1, C.teal);
      return o;
    },
  });

  /* ── 엔드카드: 다음 시간 + 구독·좋아요·알림 설정·댓글 (말하는 순간 차례로 켜짐) ── */
  IT.define({
    id: "e03", fig: "다음 시간", title: "Part1-4 IP 주소 vs 도메인", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part1-4", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "IP 주소 vs 도메인", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "숫자 주소와 이름, 그리고 DNS 안내소", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/seoul-bike-insight", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
