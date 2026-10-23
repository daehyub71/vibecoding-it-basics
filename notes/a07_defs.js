/* 7장 움직이는 그림 — 혼합 판(2026-10-23): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 문 번호 · 터미널 글자를 얹는다. 예제 저장소 = smart-korean-legal-platform.
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

  /* 길 위를 가는 신호 점(kit 의 dot) */
  const dot = (o, id, path, on, color, u, lag) => { o[id] = { type: "dot", path, pid: id + path.length, u: u == null ? 1 : u, r: 13, fill: color, stroke: "#FFFFFF", sw: 4, op: on, z: 7, from: { u: 0 }, lag }; };
  const route = (o, id, pts, on, color, dash) => { o[id] = { type: "path", d: poly(pts), len: plen(pts), draw: on ? 1 : 0, stroke: color, sw: 7, fill: "none", dash: dash || "", op: on ? 0.85 : 0, z: 5, from: { draw: 0 } }; };

  /* 그림 7장 — 상자 좌표는 it_label_fill detect 결과(1672×941) */
  const D = {
    p07_01: [[423, 125, 200, 50], [835, 109, 164, 49], [1169, 137, 184, 51], [1429, 188, 205, 51], [381, 395, 172, 51], [1456, 431, 184, 51], [634, 539, 73, 45], [247, 740, 210, 51]],
    p07_02: [[306, 100, 236, 76], [708, 114, 225, 65], [1375, 99, 242, 73], [960, 203, 195, 63]],
    p07_03: [[434, 96, 235, 65], [754, 289, 241, 64], [993, 459, 198, 65], [1410, 452, 226, 67]],
    p07_04: [[638, 122, 233, 72], [1072, 99, 293, 68], [1364, 275, 230, 70], [1402, 535, 228, 70], [639, 692, 206, 71]],
    p07_05: [[1430, 110, 210, 61], [440, 196, 171, 61], [669, 175, 257, 69], [1436, 582, 210, 61]],
    p07_06: [[178, 36, 513, 69], [1099, 37, 427, 68], [1431, 207, 213, 61], [1387, 691, 232, 61], [540, 791, 236, 63], [926, 791, 235, 62]],
    p07_07: [[1299, 145, 218, 56], [546, 348, 125, 58], [691, 348, 128, 58], [838, 348, 128, 58], [986, 348, 129, 58], [265, 418, 187, 51]],
  };
  figAnim("p07_01", "그림 7-1", "카페의 손님 쪽과 주방 쪽", "7.1 손님 쪽 · 주방 쪽", "p07_01.jpg",
    bx(D.p07_01, [[1, "메뉴판", C.blue], [5, "키오스크", C.blue], [8, "진동벨", C.blue], [3, "레시피", C.teal], [4, "재고 장부", C.teal], [6, "커피 머신", C.teal], [2, "손님 쪽 | 주방 쪽", C.coral]]),
    [{ tag: "손님이 보는 쪽", show: [1, 2, 3], hl: [0, 60, 820, 820] }, { tag: "보이지 않는 주방", show: [4, 5, 6], hl: [820, 60, 852, 820] }, { tag: "프론트엔드 · 백엔드", show: [7], note: [470, 870, "보고 만지는 쪽 = 프론트엔드 · 데이터와 규칙 = 백엔드", C.coral] }]);
  figAnim("p07_02", "그림 7-2", "다른 휴대전화에서는 보이지 않는 상담 대화", "7.4 저장은 저장소까지", "p07_02.jpg",
    bx(D.p07_02, [[1, "대화를 나눈 휴대전화", C.coral], [2, "화면 상태에만 있는 대화", C.teal], [4, "서버로 가지 않는다", C.blue], [3, "다른 휴대전화", C.coral]]),
    [{ tag: "상담 대화", show: [1], hl: [0, 60, 600, 840] }, { tag: "화면 안에만", show: [2, 3, 4], hl: [600, 60, 1072, 840] }, { tag: "설계의 선택", show: [], note: [380, 870, "어느 기기에서나 보이려면 저장 창구 · DB 표 · 로그인이 필요", C.coral] }]);
  figAnim("p07_03", "그림 7-3", "증상이 보이는 곳과 원인이 있는 곳", "7.6 증상과 원인", "p07_03.jpg",
    bx(D.p07_03, [[2, "보이는 증상", C.teal], [1, "엉뚱한 수리", C.blue], [4, "진짜 원인", C.coral], [3, "길을 따라가 본다", C.coral]]),
    [{ tag: "수도꼭지를 갈았다", show: [1, 2], hl: [0, 60, 1060, 840] }, { tag: "벽 속 밸브", show: [3], hl: [1240, 60, 432, 840] }, { tag: "증상 ≠ 원인", show: [4] }]);
  figAnim("p07_04", "그림 7-4", "층별 안내도를 보듯 폴더를 읽는다", "7.7 폴더 지도", "p07_04.jpg",
    bx(D.p07_04, [[1, "손님이 다니는 층", C.coral], [5, "직원 구역", C.ink], [3, "frontend/", C.teal], [4, "backend/", C.ink], [2, "위에서부터 차례로", C.blue]]),
    [{ tag: "층별 안내도", show: [1, 2], hl: [0, 60, 640, 840] }, { tag: "층을 차례로", show: [3, 4], hl: [640, 60, 1032, 840] }, { tag: "요청 하나의 길만", show: [5] }]);
  figAnim("p07_05", "그림 7-5", "주문표의 그림이 서로 다른 키오스크와 주방", "7.8 API 계약", "p07_05.jpg",
    bx(D.p07_05, [[2, "보낸 이름", C.blue], [3, "주문표", C.coral], [1, "받는 쪽의 이름", C.teal], [4, "짝 없는 주문", C.blue]]),
    [{ tag: "키오스크가 보낸다", show: [1, 2], hl: [0, 60, 1000, 840] }, { tag: "주방의 다른 그림", show: [3], hl: [1000, 60, 672, 840] }, { tag: "주문이 빠진다", show: [4] }]);
  figAnim("p07_06", "그림 7-6", "매번 주방에 묻는 손님과 창고 열쇠를 건넨 가게", "7.9 안전", "p07_06.jpg",
    bx(D.p07_06, [[1, "모두 서버에 묻기", C.coral], [5, "속도", C.coral], [2, "모두 브라우저에 넘기기", C.blue], [3, "금고 = 비밀값", C.blue], [4, "장부 = 데이터", C.blue], [6, "안전", C.teal]]),
    [{ tag: "매번 주방에", show: [1, 2], hl: [0, 20, 820, 900] }, { tag: "열쇠를 통째로", show: [3, 4, 5, 6], hl: [880, 20, 792, 900] }, { tag: "속도 · 비용 · 안전", show: [], hl: [560, 560, 560, 330] }]);
  figAnim("p07_07", "그림 7-7", "AI에게 증상을 구간별로 알려 주기", "7.10 AI에게 번역하기", "p07_07.jpg",
    bx(D.p07_07, [[6, "증상을 구간별로", C.coral], [2, "화면 파일", C.blue], [3, "API 호출", C.coral], [4, "서버 라우트", C.teal], [5, "저장소 접근", C.blue], [1, "흐름 순서 표로 확인", C.blue]]),
    [{ tag: "구간별로 알리기", show: [1], hl: [0, 60, 520, 840] }, { tag: "흐름 순서대로", show: [2, 3, 4, 5], hl: [520, 300, 620, 400] }, { tag: "작은 시험", show: [6], hl: [1140, 60, 532, 840] }]);

  /* ── 7-A 두 가지 질문, 두 가지 분류 (무대 p07_a01) ── */
  const CARD7 = ["상담 화면", "FastAPI 서버", "MCP 클라이언트", "SSR 화면 코드"];
  /* 카드마다 [왼쪽 쟁반 칸(0 위=클라이언트 · 1 아래=서버), 오른쪽 쟁반 칸(0 위=프론트 · 1 아래=백엔드), 줄 안 순서] */
  const PUT7 = [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 1], [1, 0, 1, 1]];
  IT.define({
    id: "a07_01", fig: "움직이는 그림 7-A", title: "두 가지 질문, 두 가지 분류", sec: "7.3 두 가지 분류", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["두 질문", "상담 화면", "FastAPI 서버", "같은 말처럼 보인다", "MCP 클라이언트", "서버가 그리는 화면", "따로 말하기"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p07_a01.jpg");
      lab(o, "q1", [338, 71, 402, 68], "질문 1 · 누가 요청하나", on, C.blue); lab(o, "q2", [933, 69, 430, 70], "질문 2 · 무엇을 맡나", on, C.coral);
      lab(o, "c", [318, 225, 146, 49], "클라이언트", on, C.blue); lab(o, "sv", [317, 506, 147, 49], "서버", on, C.blue);
      lab(o, "fe", [915, 225, 146, 49], "프론트엔드", on, C.coral); lab(o, "be", [915, 506, 146, 49], "백엔드", on, C.coral);
      const shown = [1, 2, 4, 5];
      CARD7.forEach((nm, i) => {
        const vis = k >= shown[i] ? 1 : 0, [l, r, sl, sr] = PUT7[i], odd = i >= 2, col = odd ? "#CF3F33" : C.ink;
        txtBox(o, "L" + i, [312 + sl * 225, [330, 610][l], 210, 60], nm, vis, col);
        txtBox(o, "R" + i, [908 + sr * 225, [330, 610][r], 210, 60], nm, vis, col);
      });
      hl(o, "mcp", [300, 300, 1080, 400], k === 4, t);
      if (k === 3) note(o, "n3", 520, 870, "여기까지는 클라이언트 = 프론트엔드처럼 보인다", 1, C.ink);
      if (k === 4) note(o, "n4", 440, 870, "법령 서버에 요청하니 클라이언트, 맡은 일은 여전히 백엔드", 1, "alert");
      if (k === 5) note(o, "n5", 470, 870, "서버에서 도는 코드가 화면을 맡기도 한다(SSR)", 1, "alert");
      if (k === 6) note(o, "n6", 440, 870, "문제를 말할 때는 누가 요청했나와 무엇을 맡았나를 따로", 1, C.coral);
      return o;
    },
  });

  /* ── 7-B 데이터는 저장소까지 도착해야 한다 (무대 p07_a02) ── */
  const P7 = { ph: [192, 348], dr: [261, 592], rd: [775, 435], srv: [1280, 505], db: [1533, 557], ph2: [1568, 244] };
  const GO7 = [P7.ph, [480, 420], P7.rd, [1040, 470], P7.srv];
  IT.define({
    id: "a07_02", fig: "움직이는 그림 7-B", title: "데이터는 저장소까지 도착해야 한다", sec: "7.4 저장은 저장소까지", view: [W, H], rest: 7, blank: { k: -1 },
    steps: ["저장 단추", "요청을 만든다", "네트워크를 건너", "입력 · 권한 확인", "DB에 기록", "그제야 완료", "다른 기기에서도", "화면 안에만 두면"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, local = k === 7; img(o, "p07_a02.jpg");
      lab(o, "ph", [81, 85, 267, 61], "화면(프론트엔드)", on, C.blue); lab(o, "ph2", [1357, 49, 263, 60], "다른 휴대전화", on, C.coral);
      lab(o, "srv", [1104, 242, 295, 69], "백엔드(FastAPI)", on, C.teal); lab(o, "rd", [634, 336, 283, 65], "네트워크", on, C.ink);
      lab(o, "dr", [150, 740, 284, 65], "화면 안 상태", on, local ? "#CF3F33" : C.ink); lab(o, "db", [1357, 695, 275, 63], "데이터베이스", on, C.ink);
      hl(o, "btn", [90, 160, 220, 380], k === 0, t);
      txtBox(o, "req", [60, 470, 300, 54], "POST /api/… { 질문 }", k === 1 ? 1 : 0, C.coral, { mono: true });
      route(o, "go", GO7, k >= 2 && !local, C.coral);
      if (k === 2) dot(o, "d", GO7, 1, C.coral);
      else if (k === 4) dot(o, "d", [P7.srv, P7.db, P7.srv], 1, C.ink);
      else if (k === 5) dot(o, "d", GO7.slice().reverse(), 1, C.teal);
      else if (k === 6) dot(o, "d", [P7.db, [1640, 420], P7.ph2], 1, C.teal);
      else if (local) dot(o, "d", [P7.ph, P7.dr], 1, "#CF3F33");
      else o.d = { type: "dot", path: GO7, pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      route(o, "db", [P7.srv, P7.db], k >= 4 && !local, C.ink);
      route(o, "back", GO7.slice().reverse(), k === 5, C.teal);
      route(o, "p2", [P7.db, [1640, 420], P7.ph2], k === 6 || local, local ? "#CF3F33" : C.teal, local ? "10 10" : "");
      txtBox(o, "chk", [1120, 340, 300, 54], "입력 ✓ · 권한 ✓", k === 3 ? 1 : 0, "#2D7A4E");
      txtBox(o, "ok", [1120, 640, 230, 50], "기록 완료", k === 4 ? 1 : 0, "#2D7A4E");
      txtBox(o, "done", [60, 470, 300, 54], "저장 완료", k >= 5 && !local ? 1 : 0, "#2D7A4E");
      mark(o, "m6", 1568, 200, true, k === 6 ? 1 : 0); mark(o, "m7", 1568, 200, false, local ? 1 : 0);
      if (k === 5) note(o, "n5", 470, 870, "기록이 끝났다는 신호를 받은 뒤에야 ‘완료’", 1, C.teal);
      if (local) note(o, "n7", 400, 870, "화면 안에만 든 것은 새로고침 · 다른 휴대전화에서 보이지 않는다", 1, "alert");
      return o;
    },
  });

  /* ── 7-C 고칠 곳은 어느 쪽인가 (무대 p07_a03) ── */
  const SIGN7 = [[470, 192, 188, 52], [728, 205, 185, 54], [981, 200, 204, 53]];
  const BASK7 = [[409, 582, 220, 44], [701, 580, 220, 46], [988, 580, 225, 45]];
  const JOB7 = [["배지 색 바꾸기", 0, "dev-check/page.tsx 색 한 줄"], ["AI 키 바꾸기", 1, "서버 설정 파일(.env)"], ["감시 목록 영구 저장", 2, "service.py → DB 표"]];
  IT.define({
    id: "a07_03", fig: "움직이는 그림 7-C", title: "고칠 곳은 어느 쪽인가", sec: "7.5 나누는 기준", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["배지 색", "믿음 · 비밀 없음", "→ 프론트엔드", "AI 키 → 백엔드", "감시 목록 → 백엔드", "고칠 곳이 갈린다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p07_a03.jpg");
      const job = k <= 2 ? 0 : k === 3 ? 1 : 2;
      ["남이 믿고 봐야 하나", "비밀 · 권한이 필요한가", "보이는 표현인가"].forEach((q, i) => lab(o, "s" + i, SIGN7[i], q, on, [C.coral, C.blue, C.teal][i]));
      lab(o, "f1", [1510, 222, 134, 46], "frontend", on, C.teal); lab(o, "f2", [1511, 360, 133, 46], "backend", on, C.ink);
      ["프론트엔드", "백엔드 · 설정", "백엔드 · 저장"].forEach((b, i) => lab(o, "b" + i, BASK7[i], b, on, [C.teal, C.blue, C.coral][i]));
      txtBox(o, "card", [60, 300, 330, 60], JOB7[job][0], on, C.ink);
      const tgt = JOB7[job][1], done = k === 5;
      [0, 1, 2].forEach((i) => hl(o, "hb" + i, [BASK7[i][0] - 30, 560, BASK7[i][2] + 60, 280], !done && ((k === 2 && i === 0) || (k === 3 && i === 1) || (k === 4 && i === 2)), t));
      hl(o, "hs", [SIGN7[0][0] - 20, 170, 760, 260], k === 1, t);
      if (k >= 2 && !done) route(o, "p", [[225, 400], [560, 330], [819, 360], [1071, 340], [BASK7[tgt][0] + 110, 700]], 1, [C.teal, C.blue, C.coral][tgt]);
      else o.p = { type: "path", d: poly([[0, 0], [1, 1]]), len: 2, draw: 0, stroke: C.ink, sw: 7, fill: "none", op: 0, z: 5 };
      JOB7.forEach(([nm, b, f], i) => txtBox(o, "in" + i, [BASK7[b][0] - 10, 820, BASK7[b][2] + 20, 50], nm, (k >= [2, 3, 4][i]) ? 1 : 0, [C.teal, C.blue, C.coral][b]));
      txtBox(o, "file", [1180, 600, 450, 54], k >= 2 && !done ? JOB7[job][2] : "", k >= 2 && !done ? 1 : 0, C.ink, { mono: true });
      if (done) note(o, "n5", 520, 120, "같은 앱 고치기라도 고칠 곳은 이렇게 갈린다", 1, C.coral);
      return o;
    },
  });

  /* ── 7-D 이름이 어긋난 계약 (무대 p07_a04) ── */
  const CELL7 = [305, 554, 789, 1028, 1268, 1507];
  IT.define({
    id: "a07_04", fig: "움직이는 그림 7-D", title: "이름이 어긋난 계약", sec: "7.8 API 계약", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["API 계약", "문서: /watch · law_name", "서버는 계약대로", "화면은 /register · name", "거절 → 등록 실패", "조용한 불일치", "함께 고치고 확인"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p07_a04.jpg");
      lab(o, "cl", [135, 54, 277, 60], "화면이 보내는 주문", on, C.coral); lab(o, "ct", [712, 125, 260, 59], "API 계약(PLAN.md)", on, C.ink);
      lab(o, "rc", [1326, 155, 261, 59], "서버 접수 창구", on, C.teal);
      txtBox(o, "c1", [690, 280, 300, 54], "POST /watch", k >= 1 ? 1 : 0, C.ink, { mono: true });
      txtBox(o, "c3", [690, 350, 300, 54], "이름 → law_name", k >= 1 ? 1 : 0, C.ink, { mono: true });
      txtBox(o, "r1", [1330, 300, 270, 54], "/watch 창구", k >= 2 ? 1 : 0, C.teal, { mono: true });
      txtBox(o, "rv", [1330, 370, 270, 54], "law_name 받음", k >= 2 ? 1 : 0, C.teal, { mono: true });
      txtBox(o, "o1", [80, 300, 330, 56], "POST /register", k >= 3 ? 1 : 0, "#CF3F33", { mono: true });
      txtBox(o, "o2", [80, 380, 330, 56], "{ name: … }", k >= 3 ? 1 : 0, "#CF3F33", { mono: true });
      route(o, "send", [[420, 360], [700, 520], [1100, 520], [1360, 420]], k === 4, "#CF3F33", "10 8");
      if (k === 4) dot(o, "d", [[420, 360], [700, 520], [1100, 520], [1360, 420], [1480, 610]], 1, "#CF3F33");
      else o.d = { type: "dot", path: [[420, 360], [1360, 420]], pid: "none", u: 0, r: 13, fill: "#CF3F33", op: 0, z: 7 };
      lab(o, "tr", [1413, 557, 231, 66], "거절 · 등록 실패", k >= 4 ? 1 : 0, "#CF3F33"); mark(o, "x4", 1450, 300, false, k === 4 ? 1 : 0);
      lab(o, "st", [687, 645, 291, 59], k >= 5 ? "목록: law_name ↔ name" : "결과 미리보기", on, k >= 5 ? "#CF3F33" : C.ink);
      ["형법", "민법", "상법", "근로기준법", "주택임대차", "개인정보"].forEach((nm, i) => txtBox(o, "cell" + i, [CELL7[i] - 95, 770, 190, 56], k >= 5 ? "이름: (빈칸)" : nm, k >= 5 ? 1 : 0, k >= 5 ? "#5D6470" : C.ink, { lag: i * 0.08 }));
      hl(o, "both", [60, 260, 1580, 220], k === 6, t);
      if (k === 5) note(o, "n5", 520, 900 - 40, "오류는 없는데 이름 칸만 비어 있다", 1, "alert");
      if (k === 6) note(o, "n6", 420, 860, "계약을 바꿀 때는 화면과 서버를 함께 고치고 실제 응답으로 확인", 1, C.coral);
      return o;
    },
  });

  /* 글자 칸 */
  function txtBox(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min((opt && opt.max) || h * 0.5, (w - 20) / Math.max(1, n));
    o["tb-" + id] = { type: "rect", x, y, w, h, rx: Math.min(14, h * 0.3), fill: (opt && opt.bg) || "#FFFFFF", stroke: color, sw: 3, op: on, z: 6, from: { sc: 0.85 } };
    o["tt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", font: opt && opt.mono ? "mono" : undefined, fill: (opt && opt.fg) || color, op: on, z: 7 };
  }
  const mark = (o, id, x, y, ok, on) => { o[id] = { type: "text", x, y, text: ok ? "✓" : "✗", size: 64, weight: 700, anchor: "middle", fill: ok ? "#2D7A4E" : "#CF3F33", op: on, z: 9 }; };

  IT.define({
    id: "e07", fig: "다음 시간", title: "Part2-2 요청 vs 응답", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part2-2", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "요청 vs 응답", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "메시지 한 통의 안쪽 — 상태 코드 · 헤더 · 본문", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/smart-korean-legal-platform", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
