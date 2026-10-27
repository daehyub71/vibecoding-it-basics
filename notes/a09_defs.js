/* 9장 움직이는 그림 — 혼합 판(2026-10-27): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 주소 · 상태 코드를 얹는다. 예제 저장소 = nvidia-cert-quiz.
   좌표는 무대 그림(1672×941) 기준. 상태 코드는 저장소 코드를 옮긴 연습용 서버(127.0.0.1:8009)에서 실제로 받은 값, 503은 배포 서버(2026-10-27). */
(function () {
  const W = 1672, H = 941, poly = IT.poly, plen = IT.plen;
  const C = { coral: "#B53A24", teal: "#03807F", blue: "#1B66C9", ink: "#1F3A5F", ok: "#2D7A4E", bad: "#CF3F33" };

  /* 빈 상자에 라벨 얹기: [x,y,w,h] */
  function lab(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min(h * 0.46, (w - 26) / Math.max(1, n));
    o["lb-" + id] = { type: "rect", x: x + 4, y: y + 4, w: w - 8, h: h - 8, rx: h * 0.22, fill: "#FFFFFF", op: on, z: 3, from: { sc: 0.7 }, lag: opt && opt.lag };
    o["lt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", fill: color, op: on, z: 4, from: { y: y + h / 2 + size * 0.36 + 10 }, lag: opt && opt.lag };
  }
  function hl(o, id, r, on, t) { const [x, y, w, h] = r; o["hl-" + id] = { type: "rect", x, y, w, h, rx: 22, fill: "none", stroke: "hot", sw: 7, op: on ? 0.75 + 0.25 * Math.sin((t || 0) * 4) : 0, z: 2 }; }
  function note(o, id, x, y, text, on, color) {
    const n = [...text].length, w = n * 24 + 44;
    o["nb-" + id] = { type: "rect", x, y, w, h: 54, rx: 16, fill: "#FFFFFF", stroke: color || "hot", sw: 3, op: on, z: 8, from: { y: y + 14 } };
    o["nt-" + id] = { type: "text", x: x + w / 2, y: y + 36, text, size: 25, weight: 700, anchor: "middle", fill: color || "hot-ink", op: on, z: 9, from: { y: y + 50 } };
  }
  /* 가운데 정렬 메모(글자 수로 폭을 잡아 x 를 가운데에) */
  const cnote = (o, id, cy, text, on, color) => note(o, id, W / 2 - ([...text].length * 24 + 44) / 2, cy, text, on, color);
  function img(o, href) { o.bg = { type: "image", href, x: 0, y: 0, w: W, h: H, z: 0 }; }
  function txtBox(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min((opt && opt.max) || h * 0.5, (w - 20) / Math.max(1, n));
    o["tb-" + id] = { type: "rect", x, y, w, h, rx: Math.min(14, h * 0.3), fill: (opt && opt.bg) || "#FFFFFF", stroke: color, sw: 3, op: on, z: 6, from: { sc: 0.85 } };
    o["tt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", font: opt && opt.mono ? "mono" : undefined, fill: (opt && opt.fg) || color, op: on, z: 7 };
  }
  const mark = (o, id, x, y, ok, on, size) => { o[id] = { type: "text", x, y, text: ok ? "✓" : "✗", size: size || 64, weight: 700, anchor: "middle", fill: ok ? C.ok : C.bad, op: on, z: 9 }; };
  const dot = (o, id, path, on, color, u, lag) => { o[id] = { type: "dot", path, pid: id + path.length, u: u == null ? 1 : u, r: 13, fill: color, stroke: "#FFFFFF", sw: 4, op: on, z: 7, from: { u: 0 }, lag }; };
  const nodot = (o, id, path, color) => { o[id] = { type: "dot", path, pid: "none", u: 0, r: 13, fill: color, op: 0, z: 7 }; };

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
  const bx = (arr, specs) => Object.fromEntries(specs.map(([n, text, color], i) => [i + 1, [...arr[n - 1], text, color]]));

  /* 그림 7장 — 상자 좌표는 it_label_fill detect 결과(1672×941). p09_07 의 위쪽 안내판 두 상자는 손으로 잰 좌표 */
  const D = {
    p09_01: [[39, 72, 271, 65], [455, 59, 288, 74], [1006, 59, 281, 74], [1009, 309, 254, 72]],
    p09_02: [[552, 68, 213, 57], [1398, 93, 213, 57], [949, 220, 200, 57], [242, 396, 182, 56]],
    p09_03: [[1292, 42, 342, 78], [55, 121, 290, 78], [736, 108, 353, 87], [1164, 514, 277, 61]],
    p09_04: [[281, 62, 188, 56], [904, 47, 190, 53], [261, 507, 219, 60], [850, 512, 195, 62], [1286, 513, 192, 61]],
    p09_05: [[1361, 70, 284, 87], [33, 311, 283, 84], [728, 708, 278, 90], [1334, 710, 290, 86]],
    p09_06: [[1327, 59, 220, 74], [757, 325, 257, 62], [757, 417, 257, 62], [1270, 435, 165, 42], [1529, 499, 125, 65], [757, 511, 257, 62], [74, 570, 135, 57], [226, 570, 136, 57], [380, 570, 137, 57], [1289, 601, 149, 41]],
    p09_07: [[56, 43, 345, 96], [1273, 42, 339, 94], [261, 206, 118, 76], [1498, 211, 97, 78], [261, 390, 118, 74], [1498, 413, 97, 79]],
  };
  figAnim("p09_01", "그림 9-1", "묻는 조회, 신청서로 맡기는 처리", "9.1 묻기와 맡기기", "p09_01.jpg",
    bx(D.p09_01, [[2, "GET · 조회", C.coral], [3, "POST · 처리 맡기기", C.blue], [1, "조건을 말로(주소)", C.teal], [4, "내용을 신청서로(본문)", C.coral]]),
    [{ tag: "조회", show: [1], hl: [0, 40, 836, 860] }, { tag: "처리 맡기기", show: [2], hl: [836, 40, 836, 860] }, { tag: "주소 · 본문", show: [3, 4] }]);
  figAnim("p09_02", "그림 9-2", "이름보다 실제로 하는 일", "9.4 POST — 본문에 내용", "p09_02.jpg",
    bx(D.p09_02, [[4, "POST · 맡기기", C.coral], [1, "저장 안 할 수도", C.blue], [3, "GET · 묻기만", C.teal], [2, "사본을 보관", C.blue]]),
    [{ tag: "POST인데 저장 없음", show: [1, 2], hl: [0, 40, 830, 860] }, { tag: "GET인데 기록이", show: [3, 4], hl: [830, 40, 842, 860] },
      { tag: "실제로 바뀌는 것", show: [], note: [520, 870, "메서드 이름보다 서버에서 바뀌는 것", C.ink] }]);
  figAnim("p09_03", "그림 9-3", "같은 주문서를 두 번 낸 손님", "9.6 다시 보내도 되나", "p09_03.jpg",
    bx(D.p09_03, [[2, "응답이 늦다", C.coral], [3, "같은 요청을 다시", C.coral], [4, "두 번 물어도 괜찮다", C.teal], [1, "음료가 두 잔(멱등 아님)", C.blue]]),
    [{ tag: "대답이 늦다", show: [1], hl: [0, 30, 640, 880] }, { tag: "한 장 더", show: [2, 3], hl: [640, 30, 560, 880] }, { tag: "두 잔", show: [4], hl: [1200, 30, 472, 470] }]);
  figAnim("p09_04", "그림 9-4", "엽서로 보낸 주문과 잠긴 운반함에 넣은 주문", "9.7 HTTP vs HTTPS", "p09_04.jpg",
    bx(D.p09_04, [[1, "HTTP: 다 읽힌다", C.coral], [2, "엿보는 사람", C.teal], [3, "HTTPS: 잠긴 운반함", C.blue], [4, "행선지만 보인다", C.coral], [5, "도착지에서 열린다", C.teal]]),
    [{ tag: "엽서", show: [1, 2], hl: [0, 20, 1672, 455] }, { tag: "잠긴 운반함", show: [3, 4], hl: [0, 470, 1672, 450] },
      { tag: "도착지에서", show: [5], hl: [1240, 470, 432, 450], note: [470, 870, "내용은 같고, 운반하는 방식만 다르다", C.ink] }]);
  figAnim("p09_05", "그림 9-5", "현관은 잠갔는데 창문이 열린 집", "9.8 HTTPS가 못 하는 일", "p09_05.jpg",
    bx(D.p09_05, [[2, "HTTPS(오가는 길 보호)", C.teal], [3, "열린 창: 확인 안 함", C.blue], [4, "비밀 키 둘 곳", C.teal], [1, "서버 기록", C.blue]]),
    [{ tag: "현관 자물쇠", show: [1], hl: [280, 220, 360, 560] }, { tag: "열린 창문", show: [2], hl: [640, 260, 420, 420] }, { tag: "키와 기록", show: [3, 4], hl: [1060, 50, 610, 820] }]);
  figAnim("p09_06", "그림 9-6", "메서드마다 이유를 묻는 사람", "9.11 AI에게 말하기", "p09_06.jpg",
    bx(D.p09_06, [[7, "목록 보기", C.blue], [8, "추가", C.teal], [9, "빼기", C.coral], [2, "GET · 목록 보기", C.ink], [3, "POST · 추가", C.ink], [6, "DELETE · 빼기", C.ink],
      [4, "GET", C.ink], [10, "DELETE", C.ink], [5, "두 번 → 하나", C.coral], [1, "왜 이 메서드?", C.blue]]),
    [{ tag: "설계 부탁", show: [1, 2, 3, 4, 5, 6], hl: [0, 40, 1110, 860] }, { tag: "두 번 눌러도 하나", show: [7, 8, 9], hl: [1180, 380, 492, 330] },
      { tag: "이유를 묻는다", show: [10], hl: [1110, 30, 562, 340], note: [430, 870, "이 앱의 북마크: GET · POST · DELETE 와 맞춰 보기", C.ink] }]);
  figAnim("p09_07", "그림 9-7", "무엇을 부탁하나와 어떻게 운반하나", "9.13 오해 바로잡기", "p09_07.jpg",
    bx(D.p09_07, [[1, "무엇을 부탁하나", C.coral], [2, "어떻게 운반하나", C.blue], [3, "GET", C.coral], [5, "POST", C.teal], [4, "HTTP", C.blue], [6, "HTTPS", C.teal]]),
    [{ tag: "안내판 두 개", show: [1, 2] }, { tag: "따로 고른다", show: [3, 4, 5, 6], note: [500, 870, "서로 다른 질문 — 하나씩 따로 고른다", C.ink] }]);

  /* ── 9-A 주소에 싣는 조건, 본문에 싣는 내용 (무대 p09_a01) ── */
  const A1 = { lap: [228, 270], env: [822, 380], srv: [1380, 470] };
  const GETQ = "GET /api/v1/questions/random?count=10&difficulty=easy";
  const POSTQ = "POST /api/v1/quiz/start?user_id=web_demo";
  IT.define({
    id: "a09_01", fig: "움직이는 그림 9-A", title: "주소에 싣는 조건, 본문에 싣는 내용", sec: "9.2 VS 비교", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["GET: 주소 뒤 조건", "방문 기록에 남는다", "첫 줄에 조건 · 본문 없음", "서버 접속 기록", "POST: 본문에 조건", "기록엔 user_id", "저장하면 본문도 남는다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, post = k >= 4; img(o, "p09_a01.jpg");
      lab(o, "addr", [305, 62, 262, 65], "주소창", on, C.blue);
      lab(o, "hist", [277, 484, 250, 65], "방문 기록", on, C.teal);
      lab(o, "in", [827, 132, 244, 66], post ? "본문(시험 조건)" : "본문", on, C.teal);
      lab(o, "out", [828, 619, 223, 58], "첫 줄", on, C.coral);
      lab(o, "log", [1405, 191, 241, 66], "서버 접속 기록", on, C.blue);
      /* 주소창 · 방문 기록 */
      txtBox(o, "url", [90, 160, 600, 44], post ? "web-six-cyan-91.vercel.app (화면)" : "…/questions/random?count=10&difficulty=easy", on, post ? "#5D6470" : C.coral, { mono: true });
      txtBox(o, "h1", [70, 640, 560, 46], "…/random?count=10&difficulty=easy", k >= 1 && k < 4 ? 1 : 0, C.coral, { mono: true });
      /* 봉투: 겉(첫 줄) · 안(본문) */
      txtBox(o, "first", [560, 462, 560, 60], post ? "POST …/quiz/start?user_id=web_demo" : "GET …/random?count=10&difficulty=easy", k >= 2 ? 1 : 0, C.coral, { mono: true });
      txtBox(o, "body", [672, 300, 330, 52], post ? "question_count: 3" : "(비어 있음)", k >= 2 ? 1 : 0, post ? C.teal : "#5D6470", { mono: true, max: 26 });
      txtBox(o, "body2", [672, 362, 330, 52], "difficulty: easy", k >= 4 ? 1 : 0, C.teal, { mono: true, max: 26 });
      /* 서버 접속 기록 */
      txtBox(o, "l1", [1296, 372, 340, 50], post ? "POST …/start" : "GET …/random", k === 3 || k >= 5 ? 1 : 0, post ? C.blue : C.coral, { mono: true });
      txtBox(o, "l2", [1296, 430, 340, 50], post ? "?user_id=web_demo" : "?count=10&difficulty=easy", k === 3 || k >= 5 ? 1 : 0, post ? C.bad : C.coral, { mono: true });
      txtBox(o, "l3", [1296, 488, 340, 50], "HTTP/1.1  200 OK", k === 3 || k >= 5 ? 1 : 0, C.ok, { mono: true });
      txtBox(o, "db", [1300, 690, 360, 56], "DB: 시험 조건 저장 (quiz.py:91)", k === 6 ? 1 : 0, C.teal);
      hl(o, "hh", [40, 570, 620, 300], k === 1, t);
      hl(o, "hl", [1280, 330, 390, 300], k === 3 || k === 5, t);
      const go = [A1.lap, [560, 330], A1.env, [1150, 430], A1.srv];
      if (k === 0 || k === 4) dot(o, "d", [A1.lap, [560, 330], A1.env], 1, post ? C.teal : C.coral);
      else if (k === 3 || k === 5) dot(o, "d", go, 1, post ? C.teal : C.coral);
      else nodot(o, "d", go, C.coral);
      if (k === 5) note(o, "n5", 560, 870, "본문은 기록 줄에 없지만, 주소의 user_id 는 그대로", 1, C.coral);
      if (k === 6) note(o, "n6", 620, 870, "POST 라고 해서 흔적이 없는 것은 아니다", 1, "alert");
      return o;
    },
  });

  /* ── 9-B 다시 보내도 되는 요청 (무대 p09_a02) ── */
  const LANE = [152, 410, 669], LCOL = [C.blue, C.teal, C.coral];
  const SLOTX = [1268, 1337, 1406, 1475, 1544];
  IT.define({
    id: "a09_02", fig: "움직이는 그림 9-B", title: "다시 보내도 되는 요청", sec: "9.6 다시 보내도 되나", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["세 요청을 한 번씩", "응답이 사라졌다", "처리됐을까?", "한 번 더 보낸다", "조회: 늘지 않음", "문제 통계: 두 번 늘어남", "오답 노트: 한 줄 그대로"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p09_a02.jpg");
      [["GET 조회", [30, 48, 179, 51]], ["POST 통계", [30, 303, 178, 51]], ["POST 오답", [30, 563, 178, 51]]].forEach(([nm, b], i) => lab(o, "p" + i, b, nm, on, LCOL[i]));
      [["문제(그대로)", [1385, 32, 259, 50]], ["푼 횟수", [1391, 292, 250, 43]], ["오답 노트", [1385, 546, 259, 49]]].forEach(([nm, b], i) => lab(o, "s" + i, b, nm, on, LCOL[i]));
      /* 선반 칸: 조회는 처음부터 문제 다섯, 통계는 보낼 때마다 +1, 오답 노트는 한 줄 */
      ["Q1", "Q2", "Q3", "Q4", "Q5"].forEach((q, j) => txtBox(o, "q" + j, [SLOTX[j], LANE[0] - 30, 58, 50], q, on, C.blue, { mono: true }));
      txtBox(o, "c0", [SLOTX[0], LANE[1] - 30, 58, 50], "+1", on, C.teal, { mono: true });
      txtBox(o, "c1", [SLOTX[1], LANE[1] - 30, 58, 50], "+1", k >= 5 ? 1 : 0, C.bad, { mono: true });
      txtBox(o, "w0", [SLOTX[0], LANE[2] - 30, 58, 50], "q007", on, C.coral, { mono: true, max: 16 });
      /* 가는 신호 · 사라진 응답 */
      LANE.forEach((y, i) => {
        const go = [[345, y - 4], [1240, y - 4]];
        if (k === 0 || k === 3) dot(o, "g" + i, go, 1, LCOL[i], 1, i * 0.12); else nodot(o, "g" + i, go, LCOL[i]);
        mark(o, "x" + i, 790, y + 70, false, k >= 1 && k <= 3 ? 1 : 0, 56);
      });
      /* 다시 보내기 단추(무대 맨 아래 빈 판) */
      txtBox(o, "btn", [640, 788, 390, 68], "다시 보내기", k >= 3 ? 1 : 0, C.coral, { max: 34 });
      hl(o, "hb", [578, 771, 514, 116], k === 3, t);
      LANE.forEach((y, i) => hl(o, "hl" + i, [1240, y - 110, 420, 200], k === 4 + i, t));
      if (k === 2) cnote(o, "n2", 870, "사용자는 처리가 됐는지 알 수 없다", 1, "alert");
      if (k === 5) cnote(o, "n5", 870, "제출이 올 때마다 하나씩 더한다(quiz.py:173~186)", 1, C.bad);
      if (k === 6) cnote(o, "n6", 870, "이미 있는지 먼저 보고, 없을 때만 넣는다(quiz.py:191~194)", 1, C.ok);
      return o;
    },
  });

  /* ── 9-C 중간에서 보이는 것과 가려지는 것 (무대 p09_a03) ── */
  const ROAD = [[304, 623], [547, 646], [730, 669], [760, 745], [1034, 745], [1049, 669], [1125, 714], [1338, 714], [1345, 623]];
  const LENS = [900, 289];
  IT.define({
    id: "a09_03", fig: "움직이는 그림 9-C", title: "중간에서 보이는 것과 가려지는 것", sec: "9.7 HTTP vs HTTPS", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["HTTP: 그대로 보인다", "몰래 바꿀 수도", "HTTPS: 행선지만", "바꾸면 알아챈다", "인증서로 주인 확인", "서버에서 열린다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, sec = k >= 2; img(o, "p09_a03.jpg");
      lab(o, "lap", [33, 297, 236, 63], "내 노트북", on, C.coral);
      lab(o, "rt", [396, 287, 224, 67], "공유기 · 통신망", on, C.teal);
      lab(o, "mg", [737, 46, 239, 68], "중간에서 보는 사람", on, C.blue);
      lab(o, "sv", [1388, 84, 256, 72], "서버", on, C.coral);
      lab(o, "lg", [1418, 385, 228, 56], "서버가 보는 내용", on, C.blue);
      txtBox(o, "scheme", [60, 470, 220, 56], sec ? "https://" : "http://", on, sec ? C.ok : C.bad, { mono: true });
      /* 돋보기 속 */
      const lensTxt = k === 0 ? ["GET …/random", "?count=10", "user_id=web_demo"] : k === 1 ? ["GET …/random", "?count=10 → 50", "(몰래 바꿈)"] : ["가는 곳만 보임:", "web-six-cyan-", "91.vercel.app", "내용: ■■■■■■"];
      for (let i = 0; i < 4; i++) o["ln" + i] = { type: "text", x: LENS[0], y: LENS[1] - 40 + i * 38, text: lensTxt[i] || "", size: 21, weight: 700, anchor: "middle", font: "mono", fill: i === 3 || (k === 1 && i === 1) ? C.bad : C.ink, op: on && lensTxt[i] ? 1 : 0, z: 6 };
      /* 신호 */
      if (k === 0 || k === 2) dot(o, "d", ROAD.slice(0, 5), 1, sec ? C.ok : C.coral); else if (k === 1 || k === 3 || k === 5) dot(o, "d", ROAD, 1, k === 1 ? C.bad : sec ? C.ok : C.coral); else nodot(o, "d", ROAD, C.coral);
      mark(o, "rej", 1190, 735, false, k === 3 ? 1 : 0);
      txtBox(o, "cert", [200, 790, 900, 64], "인증서  CN=*.vercel.app · 발급 Google Trust Services (WR1)", k === 4 ? 1 : 0, C.ok, { mono: true });
      mark(o, "ck", 1150, 845, true, k === 4 ? 1 : 0, 56);
      /* 서버 기록 창 */
      txtBox(o, "sv1", [1395, 495, 235, 46], k === 1 ? "count=50 (바뀜)" : "count=10", k === 1 || k === 5 ? 1 : 0, k === 1 ? C.bad : C.ok, { mono: true });
      txtBox(o, "sv2", [1395, 552, 235, 46], "user_id=web_demo", k === 5 ? 1 : 0, C.ok, { mono: true });
      hl(o, "hm", [740, 130, 330, 330], k <= 2, t);
      if (k === 3) cnote(o, "n3", 870, "중간에서 바꾸면 받는 쪽이 알아채고 받지 않는다", 1, "alert");
      if (k === 5) cnote(o, "n5", 870, "도착하면 열린다 — 서버는 HTTP 일 때와 똑같은 내용을 본다", 1, C.ink);
      return o;
    },
  });

  /* ── 9-D 메서드와 주소가 어긋날 때 (무대 p09_a04) ── */
  const MSLOT = [[106, 357, 69, 152], [185, 357, 69, 152], [263, 357, 69, 152], [349, 357, 69, 152]];
  const CASE9 = [
    ["POST", "/api/v1/quiz/start", "{\"question_count\": 3, \"difficulty\": \"easy\"}", 0, "200 · quiz_id", C.ok],
    ["GET", "/api/v1/quiz/start", "", 0, "405 · allow: POST", C.bad],
    ["POST", "/api/v1/questions/random", "", 0, "405 · allow: GET", C.bad],
    ["GET", "/api/v1/questions/random?count=3", "", 0, "422 · count ≥ 5", C.bad],
    ["POST", "/api/v1/quiz/strat", "", 0, "404 · Not Found", C.bad],
    ["POST", "/api/v1/quiz/start", "{\"question_count\": 3, …}", 1, "503 · 서버 쪽 문제", C.bad],
    ["", "", "", -1, "", C.ink]];
  const BR = [600, 441], TO = [[[882, 312], [1049, 258]], [[882, 616], [1041, 638]]];
  IT.define({
    id: "a09_04", fig: "움직이는 그림 9-D", title: "메서드와 주소가 어긋날 때", sec: "9.10 오류 문구", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["POST 시험 시작 → 200", "GET 시험 시작 → 405", "POST 문제 뽑기 → 405", "문제 셋만 → 422", "주소 오타 → 404", "배포 서버 → 503", "보는 순서"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, c = CASE9[k]; img(o, "p09_a04.jpg");
      lab(o, "m", [121, 222, 290, 78], "메서드", on, C.coral); lab(o, "a", [440, 222, 197, 78], "주소", on, C.teal);
      lab(o, "cs", [928, 72, 249, 64], "배포된 서버", on, C.teal); lab(o, "ls", [926, 455, 258, 73], "연습 서버(내 노트북)", on, C.blue);
      lab(o, "ct", [1281, 126, 256, 63], "응답", on, C.teal); lab(o, "lt", [1292, 506, 254, 64], "응답", on, C.blue);
      ["GET", "POST", "PUT", "DELETE"].forEach((m, i) => {
        const [x, y, w, h] = MSLOT[i], pick = c[0] === m;
        o["mc" + i] = { type: "text", x: x + w / 2, y: y + h / 2 + 10, text: m, size: m.length > 4 ? 14 : 22, weight: 700, anchor: "middle", font: "mono", fill: pick ? C.coral : "#8A919C", op: on, z: 5 };
        hl(o, "mh" + i, [x - 6, y - 6, w + 12, h + 12], pick && k < 6, t);
      });
      txtBox(o, "req", [40, 560, 700, 56], c[0] ? c[0] + " " + c[1] : "", c[0] ? 1 : 0, C.ink, { mono: true });
      txtBox(o, "bd", [40, 628, 700, 50], c[2] ? "본문 " + c[2] : "", c[2] ? 1 : 0, C.teal, { mono: true });
      if (c[3] >= 0) dot(o, "d", [[495, 441], BR, ...TO[c[3] === 1 ? 0 : 1]], 1, c[5] === C.ok ? C.ok : C.coral); else nodot(o, "d", [[495, 441], BR], C.coral);
      const tray = c[3] === 1 ? [1290, 270, 280, 70] : [1290, 650, 280, 70];
      txtBox(o, "res", tray, c[4], c[3] >= 0 ? 1 : 0, c[5], { mono: true, max: 26 });
      if (k === 5) cnote(o, "n5", 870, "요청이 맞아도 서버가 응답하지 못하는 날 — 서버 쪽 문제", 1, "alert");
      ["① 주소", "② 메서드", "③ 보낸 값", "④ 응답 상태"].forEach((x, i) => txtBox(o, "ord" + i, [60 + i * 400, 760, 360, 70], x, k === 6 ? 1 : 0, [C.teal, C.coral, C.blue, C.ink][i], { max: 32 }));
      return o;
    },
  });

  IT.define({
    id: "e09", fig: "다음 시간", title: "Part2-4 UI vs API", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part2-4", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "UI vs API", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "사람의 창구와 프로그램의 창구", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/nvidia-cert-quiz", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });
})();
