/* 10장 움직이는 그림 — 혼합 판(2026-10-28): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 요청 · 응답을 얹는다. 예제 저장소 = krx-stock-charts(시세판).
   좌표는 무대 그림(1672×941) 기준. 응답 값은 2026-10-28 Supabase REST에 GET으로만 잰 실측(200 · 200 [] · 400 42703 · 401 · 1,000행). 그림 · 움직이는 그림 정의는 그림이 오면 채운다. */
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

  /* 그림 7장 — 상자 좌표는 it_label_fill detect 결과(1672×941) */
  const D = {
    p10_01: [[1396, 75, 228, 66], [302, 90, 336, 67], [876, 156, 305, 67], [837, 376, 73, 21], [1128, 374, 77, 19], [653, 547, 303, 66]],
    p10_02: [[249, 123, 214, 71], [668, 100, 200, 62], [956, 96, 63, 18], [801, 232, 159, 61], [870, 585, 120, 57], [1129, 583, 176, 59], [1425, 586, 164, 56]],
    p10_03: [[217, 55, 300, 64], [660, 93, 340, 68], [1356, 101, 191, 62], [1341, 550, 219, 54]],
    p10_04: [[129, 199, 275, 70], [1304, 184, 188, 48], [639, 215, 246, 61], [1292, 485, 217, 59]],
    p10_05: [[1074, 66, 254, 60], [461, 122, 175, 68], [656, 92, 183, 68], [1307, 757, 266, 73]],
    p10_06: [[924, 87, 251, 74], [1344, 65, 262, 76], [67, 365, 288, 70]],
    p10_07: [[1340, 93, 263, 69], [561, 193, 242, 66], [871, 214, 237, 56], [652, 836, 370, 55]],
  };
  figAnim("p10_01", "그림 10-1", "같은 서비스, 서로 다른 두 입구", "10.1 두 종류의 창구", "p10_01.jpg",
    bx(D.p10_01, [[2, "사람의 창구(UI)", C.coral], [3, "프로그램의 창구(API)", C.teal], [1, "가계부 앱", C.blue], [6, "같은 장부(데이터)", C.coral]]),
    [{ tag: "사람의 창구", show: [1], hl: [0, 30, 740, 430] }, { tag: "프로그램의 창구", show: [2, 3], hl: [740, 30, 932, 430] }, { tag: "장부는 하나", show: [4], hl: [180, 430, 1340, 470] }]);
  figAnim("p10_02", "그림 10-2", "사람이 읽는 화면과 기계가 읽는 데이터", "10.2 VS 비교", "p10_02.jpg",
    bx(D.p10_02, [[1, "차트", C.blue], [2, "큰 가격 글씨", C.coral], [4, "오름은 빨강", C.blue], [5, "날짜 칸", C.coral], [6, "시가 칸", C.blue], [7, "종가 칸", C.coral]]),
    [{ tag: "사람에게는 카드", show: [1, 2, 3], hl: [0, 30, 860, 880] }, { tag: "프로그램에게는 칸", show: [4, 5, 6], hl: [860, 30, 812, 880] }]);
  figAnim("p10_03", "그림 10-3", "메뉴판이 아니라 ‘요청과 응답의 계약서’", "10.4 API 명세", "p10_03.jpg",
    bx(D.p10_03, [[1, "메뉴판(이름만)", C.coral], [2, "주문서(입력 규칙)", C.teal], [3, "정해진 응답", C.blue], [4, "규칙에 안 맞으면 반려", C.coral]]),
    [{ tag: "메뉴판", show: [1], hl: [0, 30, 560, 880] }, { tag: "주문서와 접수 규칙", show: [2, 3, 4], hl: [560, 30, 1112, 880] }]);
  figAnim("p10_04", "그림 10-4", "사람이 눌러야만 프로그램이 일하는 것은 아니다", "10.7 UI 없는 프로그램", "p10_04.jpg",
    bx(D.p10_04, [[1, "모두 퇴근한 저녁", C.blue], [3, "정해진 시각에 실행", C.coral], [2, "거래소 자료", C.blue], [4, "데이터 창고에 쌓기", C.teal]]),
    [{ tag: "정해진 시각", show: [1, 2], hl: [0, 30, 1080, 880] }, { tag: "화면 없이 API만", show: [3, 4], hl: [1080, 30, 592, 880], note: [560, 870, "화면 없이 API만 쓰는 프로그램", C.ink] }]);
  figAnim("p10_05", "그림 10-5", "보여 주는 입장권, 숨기는 비밀번호", "10.8 API 키", "p10_05.jpg",
    bx(D.p10_05, [[2, "공개 키", C.coral], [3, "읽기만 허락", C.teal], [1, "관리자 키", C.blue], [4, "비밀 저장소에만", C.coral]]),
    [{ tag: "공개 키", show: [1, 2], hl: [0, 30, 860, 880] }, { tag: "비밀 키", show: [3, 4], hl: [860, 30, 812, 880] }]);
  figAnim("p10_06", "그림 10-6", "이름이 다르면 데이터가 있어도 못 찾는다", "10.9 200인데 빈 화면", "p10_06.jpg",
    bx(D.p10_06, [[3, "옛 안내문", C.blue], [1, "안내문이 가리킨 칸", C.teal], [2, "실제로 넣은 칸", C.coral]]),
    [{ tag: "빈 칸", show: [1, 2], hl: [920, 190, 260, 330] }, { tag: "택배는 도착했다", show: [3], hl: [1340, 190, 290, 330], note: [500, 870, "택배는 왔다 — 다른 이름의 칸을 열었을 뿐", C.ink] }]);
  figAnim("p10_07", "그림 10-7", "화면 시안과 계약서를 AI와 함께 맞춰 보기", "10.11 AI에게 말하기", "p10_07.jpg",
    bx(D.p10_07, [[2, "화면 시안", C.coral], [3, "API 계약서", C.teal], [1, "AI가 쓴 초안", C.blue], [4, "코드보다 계약서 먼저", C.coral]]),
    [{ tag: "짚어 가며 맞추기", show: [1, 2], hl: [520, 180, 620, 640] }, { tag: "AI 초안은 사람이 확인", show: [3, 4], hl: [1150, 30, 522, 800] }]);

  /* 촛대 모양(값은 그림용 비율 0~1 — 실제 시세 아님): [시, 고, 저, 종] */
  const CND = [[0.30, 0.42, 0.22, 0.38], [0.38, 0.50, 0.33, 0.47], [0.47, 0.52, 0.36, 0.40], [0.40, 0.48, 0.30, 0.45], [0.45, 0.60, 0.42, 0.57],
    [0.57, 0.66, 0.50, 0.53], [0.53, 0.70, 0.51, 0.68], [0.68, 0.80, 0.62, 0.76], [0.76, 0.82, 0.64, 0.67], [0.67, 0.88, 0.65, 0.84]];
  function candles(o, id, [x, y, w, h], on) {
    const n = CND.length, step = w / n, bw = step * 0.55;
    CND.forEach(([op, hi, lo, cl], i) => {
      const cx = x + step * (i + 0.5), Y = (v) => y + h * (1 - v), up = cl >= op, col = up ? "#D8382F" : "#2563C9";
      o[id + "w" + i] = { type: "line", x1: cx, y1: Y(hi), x2: cx, y2: Y(lo), stroke: col, sw: 2, op: on, z: 5 };
      o[id + "b" + i] = { type: "rect", x: cx - bw / 2, y: Y(Math.max(op, cl)), w: bw, h: Math.max(3, h * Math.abs(cl - op)), fill: col, op: on, z: 6, lag: i * 0.04 };
    });
  }
  /* 작은 꺾은선(종가만) */
  function spark(o, id, [x, y, w, h], vals, on, color) {
    const pts = vals.map((v, i) => [x + (w * i) / (vals.length - 1), y + h * (1 - v)]);
    o[id] = { type: "path", d: poly(pts), stroke: color, sw: 3, fill: "none", op: on, z: 6 };
  }
  const SP = [[0.2, 0.35, 0.3, 0.55, 0.5, 0.8], [0.7, 0.6, 0.65, 0.4, 0.45, 0.3], [0.4, 0.5, 0.35, 0.45, 0.6, 0.65]];
  const tx = (o, id, x, y, text, on, size, color, opt) => { o[id] = { type: "text", x, y, text, size, weight: (opt && opt.w) || 700, anchor: (opt && opt.a) || "middle", font: opt && opt.mono ? "mono" : undefined, fill: color, op: on, z: (opt && opt.z) || 7 }; };

  /* ── 10-A 클릭 한 번이 지나가는 두 창구 (무대 p10_a01) ── */
  const P1 = { mon: [300, 420], gl: [862, 480], srv: [1300, 480] };
  const REQ10 = "GET /rest/v1/ksc_bars?select=d,o,h,l,c,v,a&ticker=eq.005930&timeframe=eq.D&order=d.desc";
  const RES10 = "200  [{\"d\":\"2026-10-16\",\"o\":215000,\"h\":222500,\"l\":210500,\"c\":217000, …}, …]";
  IT.define({
    id: "a10_01", fig: "움직이는 그림 10-A", title: "클릭 한 번이 지나가는 두 창구", sec: "10.2 VS 비교", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["삼성전자를 누른다", "클릭이 요청으로", "Supabase API로", "JSON 목록이 온다", "차트와 큰 글씨", "표로 바꾸기", "두 창구의 경계"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p10_a01.jpg");
      lab(o, "hL", [30, 48, 541, 52], "사람의 창구 · UI", on, C.blue);
      lab(o, "hR", [757, 48, 883, 50], "프로그램의 창구 · API", on, C.teal);
      lab(o, "mon", [186, 165, 202, 47], "시세판 화면", on, C.blue);
      lab(o, "gl", [765, 176, 201, 56], "화면 프로그램", on, C.teal);
      lab(o, "api", [1209, 158, 181, 47], "Supabase API", on, C.blue);
      lab(o, "db", [1452, 133, 177, 47], "데이터 창고", on, C.coral);
      /* 모니터: 왼쪽 종목 목록 · 오른쪽 차트/표 */
      ["삼성전자", "SK하이닉스", "현대차", "NAVER"].forEach((nm, i) => txtBox(o, "tk" + i, [64, 300 + i * 52, 90, 40], nm, on, i === 0 ? C.coral : "#5D6470", { bg: i === 0 ? "#FCE6DF" : "#FFFFFF" }));
      candles(o, "cd", [190, 360, 310, 180], k === 4 ? 1 : 0);
      tx(o, "px", 500, 342, "217,000", k === 4 ? 1 : 0, 34, "#D8382F", { a: "end" });
      tx(o, "pxn", 190, 340, "삼성전자 · 일봉", k === 4 ? 1 : 0, 18, "#1F3A5F", { a: "start" });
      const COLX = [205, 268, 333, 398, 466];
      ["일자", "시가", "고가", "저가", "종가"].forEach((h, i) => tx(o, "th" + i, COLX[i], 330, h, k >= 5 ? 1 : 0, 16, "#5D6470"));
      ["10-16", "215,000", "222,500", "210,500", "217,000"].forEach((v, i) => tx(o, "td" + i, COLX[i], 368, v, k >= 5 ? 1 : 0, 14, i === 4 ? "#D8382F" : "#1F3A5F", { mono: true }));
      for (let r = 0; r < 4; r++) o["tr" + r] = { type: "rect", x: 182, y: 392 + r * 36, w: 330, h: 18, rx: 6, fill: "#E6EAF0", op: k >= 5 ? 1 : 0, z: 5 };
      /* 요청 · 응답 줄 */
      txtBox(o, "req", [470, 772, 1180, 46], REQ10, k >= 1 ? 1 : 0, C.coral, { mono: true });
      txtBox(o, "res", [470, 830, 1180, 46], RES10, k >= 3 ? 1 : 0, C.teal, { mono: true });
      /* 신호 */
      if (k === 0) dot(o, "d", [[480, 700], [110, 320]], 1, C.coral);
      else if (k === 1) dot(o, "d", [P1.mon, P1.gl], 1, C.coral);
      else if (k === 2) dot(o, "d", [P1.gl, P1.srv], 1, C.coral);
      else if (k === 3) dot(o, "d", [P1.srv, P1.gl], 1, C.teal);
      else if (k === 4) dot(o, "d", [P1.gl, P1.mon], 1, C.teal);
      else nodot(o, "d", [P1.mon, P1.gl], C.coral);
      hl(o, "hm", [40, 250, 520, 350], k === 0 || k === 4 || k === 5, t);
      hl(o, "hb", [455, 760, 1210, 128], k === 1 || k === 3, t);
      hl(o, "hs", [1160, 230, 500, 520], k === 2, t);
      if (k === 5) cnote(o, "n5", 104, "창고에 다시 묻지 않는다 — 받은 목록을 다른 모양으로", 1, C.ink);
      if (k === 6) { hl(o, "h6a", [22, 40, 557, 68], 1, t); hl(o, "h6b", [749, 40, 899, 66], 1, t); cnote(o, "n6", 104, "사람은 요청 줄을 보지 않고, 창고는 차트의 색을 모른다", 1, "alert"); }
      return o;
    },
  });

  /* ── 10-B 같은 데이터, 여러 화면 (무대 p10_a02) ── */
  const KV = [["[{ \"d\": \"2026-10-16\",", "d"], ["   \"o\": 215000,", "o"], ["   \"h\": 222500,", "h"], ["   \"l\": 210500,", "l"], ["   \"c\": 217000,", "c"], ["   \"v\": 18332314 }, …]", "v"]];
  const KY = (i) => 262 + i * 36;
  const SCR = { lap: [1290, 200], tab: [1290, 500], ph: [1372, 765] };
  IT.define({
    id: "a10_02", fig: "움직이는 그림 10-B", title: "같은 데이터, 여러 화면", sec: "10.5 이름표와 표현", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["JSON 목록과 화면들", "촛대 하나", "표 한 줄 · 등락률", "꺾은선은 종가만", "이름표를 지우면", "기대는 화면을 안다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p10_a02.jpg");
      lab(o, "f", [260, 96, 318, 71], "받은 JSON 목록", on, C.coral);
      lab(o, "lp", [1087, 50, 175, 61], "차트", on, C.blue);
      lab(o, "tb", [1087, 359, 175, 62], "표 보기", on, C.teal);
      lab(o, "ph", [1087, 634, 202, 61], "종목 목록", on, C.coral);
      /* 서류철 속 JSON — 지금 쓰는 이름표는 노랑 띠, 지운 이름표는 빨간 줄 */
      const use = k === 1 || k === 2 ? ["d", "o", "h", "l", "c"] : k === 3 ? ["c"] : [];
      const gone = k >= 4 ? ["c", "h"] : [];
      KV.forEach(([line, key], i) => {
        o["kb" + i] = { type: "rect", x: 140, y: KY(i) - 26, w: 430, h: 34, rx: 8, fill: "#FDF3CF", op: on && use.includes(key) ? 1 : 0, z: 5 };
        tx(o, "kv" + i, 150, KY(i), line, on, 24, gone.includes(key) ? C.bad : "#1F3A5F", { a: "start", mono: true });
        o["ks" + i] = { type: "line", x1: 190, y1: KY(i) - 8, x2: 500, y2: KY(i) - 8, stroke: C.bad, sw: 4, op: on && gone.includes(key) ? 1 : 0, z: 8 };
      });
      /* 화면 셋 */
      const broken = k >= 4;
      candles(o, "cd", [1300, 135, 250, 130], on && !broken ? 1 : 0.25);
      ["일자", "종가", "등락률"].forEach((h, i) => tx(o, "th" + i, 1320 + i * 85, 440, h, on, 18, "#5D6470"));
      tx(o, "td0", 1320, 476, "10-16", on, 16, "#1F3A5F", { mono: true }); tx(o, "td1", 1405, 476, "217,000", on, 16, broken ? "#C9CED6" : "#1F3A5F", { mono: true });
      tx(o, "td2", 1490, 476, "±%", on, 16, broken ? "#C9CED6" : "#5D6470", { mono: true });
      for (let r = 0; r < 3; r++) o["trw" + r] = { type: "rect", x: 1290, y: 494 + r * 30, w: 250, h: 16, rx: 6, fill: "#E6EAF0", op: on, z: 5 };
      o.cmp = { type: "path", d: "M1405,520 C1440,505 1470,500 1490,484", stroke: C.teal, sw: 3, fill: "none", op: k === 2 ? 1 : 0, z: 7 };
      SP.forEach((v, i) => { o["pc" + i] = { type: "rect", x: 1364, y: 678 + i * 62, w: 88, h: 52, rx: 8, fill: "#F4F6F9", op: on, z: 5 }; spark(o, "sp" + i, [1372, 688 + i * 62, 72, 32], v, on && !(k >= 4) ? 1 : 0.2, i === 1 ? "#2563C9" : "#D8382F"); });
      /* 이름표 → 화면 연결 신호 */
      if (k === 1) dot(o, "d", [[580, KY(2)], [1000, 200], SCR.lap], 1, C.blue);
      else if (k === 2) dot(o, "d", [[580, KY(2)], [1000, 480], SCR.tab], 1, C.teal);
      else if (k === 3) dot(o, "d", [[580, KY(4)], [1000, 700], SCR.ph], 1, C.coral);
      else nodot(o, "d", [[580, KY(2)], SCR.lap], C.blue);
      hl(o, "h1", [1250, 95, 345, 220], k === 1, t); hl(o, "h2", [1250, 395, 330, 230], k === 2, t); hl(o, "h3", [1340, 645, 140, 240], k === 3, t);
      [[1420, 230], [1410, 545], [1408, 790]].forEach(([x, y], i) => mark(o, "x" + i, x, y, false, k >= 4 ? 1 : 0, 72));
      if (k === 3) note(o, "n3", 700, 560, "주봉(W)의 종가 c 만 쓴다", 1, C.coral);
      txtBox(o, "rc", [60, 812, 520, 56], "c 지우면: 차트 ✗ · 표 ✗ · 꺾은선 ✗", k >= 4 ? 1 : 0, C.bad);
      txtBox(o, "rh", [600, 812, 520, 56], "h 지우면: 차트 ✗ · 표 ✗ · 꺾은선 ✓", k >= 4 ? 1 : 0, C.ink);
      if (k === 5) note(o, "n5", 640, 540, "기대는 화면을 알면 고칠 곳이 보인다", 1, C.ink);
      return o;
    },
  });

  /* ── 10-C 요청은 화면이, 판정은 서버가 (무대 p10_a03) ── */
  const P3 = { mon: [460, 400], gate: [1150, 420], robot: [1560, 520] };
  IT.define({
    id: "a10_03", fig: "움직이는 그림 10-C", title: "요청은 화면이, 판정은 서버가", sec: "10.6 서버가 정한다", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["2,000줄 달라", "1,000줄만 · 오류 없음", "다음 쪽을 다시", "공개 키로 쓰기", "고가 < 저가 거절", "판정은 서버가"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p10_a03.jpg");
      lab(o, "mon", [127, 129, 328, 69], "시세판 화면", on, C.blue);
      lab(o, "gate", [1090, 138, 175, 66], "창고 문지기", on, C.coral);
      lab(o, "rule", [1326, 133, 212, 70], "창고 규칙", on, C.teal);
      lab(o, "bot", [1515, 307, 138, 68], "자동 수집", on, C.blue);
      lab(o, "conv", [716, 752, 277, 67], "돌아온 줄", on, C.coral);
      /* 규칙판 */
      [["1,000줄씩", 1], ["공개 키: 읽기만", 3], ["고가 ≥ 저가", 4]].forEach(([r, at], i) => txtBox(o, "r" + i, [1305, 285 + i * 92, 180, 66], r, k >= at ? 1 : 0, C.teal));
      /* 모니터 글 */
      const M = k === 0 ? ["삼성전자 일봉", "2,000줄 주세요"] : k === 1 ? ["받은 줄: 1,000", "오류: 없음"] : k === 2 ? ["다음 쪽 range(1000, 1999)", "1,000줄보다 적으면 끝"]
        : k === 3 ? ["공개 키로", "시세 고쳐 쓰기"] : ["", ""];
      M.forEach((m, i) => tx(o, "m" + i, 267, 380 + i * 48, m, on && m ? 1 : 0, i === 0 ? 28 : 26, i === 1 && k === 1 ? C.ok : "#1F3A5F"));
      /* 요청 쪽지 */
      const REQ = k === 0 ? "limit=2000" : k === 2 ? "range(1000, 1999)" : k === 3 ? "쓰기 요청 · 공개 키" : "";
      txtBox(o, "rq", [500, 330, 300, 56], REQ, REQ ? 1 : 0, k === 3 ? C.bad : C.coral, { mono: k !== 3 });
      if (k === 0 || k === 2 || k === 3) dot(o, "d", [P3.mon, [820, 380], P3.gate], 1, k === 3 ? C.bad : C.coral);
      else if (k === 4) dot(o, "d", [P3.robot, [1300, 600], P3.gate], 1, C.bad);
      else nodot(o, "d", [P3.mon, P3.gate], C.coral);
      /* 컨베이어 위 상자 */
      txtBox(o, "pg0", [520, 560, 260, 66], "0 ~ 999번 줄", k >= 1 && k <= 2 ? 1 : 0, C.teal, { bg: "#E9F5F1" });
      txtBox(o, "pg1", [810, 560, 290, 66], k === 1 ? "1,000 ~ 1,999 (빠짐)" : "1,000 ~ 1,999번 줄", k >= 1 && k <= 2 ? 1 : 0, k === 1 ? C.bad : C.teal, { bg: k === 1 ? "#FBE2DE" : "#E9F5F1" });
      if (k === 1) cnote(o, "n1", 842, "오류 없이 조용히 1,000줄에서 자른다", 1, "alert");
      if (k === 2) cnote(o, "n2", 842, "화면 코드가 쪽을 넘겨 끝까지 받는다(paginate.ts)", 1, C.ok);
      /* 거절 */
      mark(o, "x3", 1180, 520, false, k === 3 || k === 4 ? 1 : 0, 90);
      if (k === 3) cnote(o, "n3", 842, "README: 공개 키로는 쓰기가 막힌다(실측했다고 적음)", 1, C.ink);
      txtBox(o, "bad", [1400, 680, 262, 52], "고가 < 저가 인 줄", k === 4 ? 1 : 0, C.bad);
      if (k === 4) cnote(o, "n4", 842, "앞 검사가 놓쳐도 창고의 검사(CHECK)가 마지막에 거절", 1, "alert");
      hl(o, "hr", [1285, 245, 225, 345], k === 5, t);
      if (k === 5) cnote(o, "n5", 842, "화면이 무엇을 허락하든, 마지막 판정은 서버가 한다", 1, C.ink);
      return o;
    },
  });

  /* ── 10-D 값이 틀리면 조용히, 이름이 틀리면 시끄럽게 (무대 p10_a04) — 2026-10-28 GET 실측 ── */
  const CASE10 = [
    { sw: 0, val: "timeframe=eq.D", st: "200 OK", stc: C.ok, body: ["[{\"d\":\"2026-10-16\",", "\"c\":217000, …}, …]"], scr: "chart",
      row: ["ksc_bars?select=d,o,h,l,c,v,a&…&timeframe=eq.D", "200", "[{\"d\":\"2026-10-16\", …}]"] },
    { sw: 1, val: "timeframe=eq.daily", st: "200 OK", stc: C.ok, body: ["[ ]"], scr: "empty",
      row: ["ksc_bars?select=d,o,h,l,c,v,a&…&timeframe=eq.daily", "200", "[ ]"] },
    null,
    { sw: 2, val: "select=d,close", st: "400", stc: C.bad, body: ["{\"code\":\"42703\",", "\"…close does not exist\"}"], scr: "error",
      row: ["ksc_bars?select=d,close&…", "400", "42703 column ksc_bars.close does not exist"] },
  ];
  const KNOB = [[214, 556], [275, 524], [336, 556]];
  const NROW = (i) => 792 + i * 38;
  IT.define({
    id: "a10_04", fig: "움직이는 그림 10-D", title: "값이 틀리면 조용히, 이름이 틀리면 시끄럽게", sec: "10.9 200인데 빈 화면", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["D → 200 · 차트", "daily → 200 · 빈 목록", "둘 다 200", "close → 400", "조용히 vs 시끄럽게", "응답 본문을 연다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p10_a04.jpg");
      const c = CASE10[k === 2 ? 1 : Math.min(k, 3)];
      lab(o, "spec", [77, 45, 163, 43], "API 명세서", on, C.coral);
      lab(o, "win", [772, 70, 162, 43], "데이터 창고", on, C.teal);
      lab(o, "st", [1474, 36, 164, 42], "상태 코드", on, C.coral);
      lab(o, "mon", [1491, 289, 163, 43], "시세판 화면", on, C.blue);
      lab(o, "sw", [27, 438, 192, 43], c.val, on, C.teal);
      lab(o, "net", [1505, 725, 149, 42], "Network 탭", on, C.blue);
      /* 명세서 종이(SPEC.md:77) */
      tx(o, "s0", 275, 190, "SPEC.md :77", on, 24, "#5D6470", { mono: true });
      tx(o, "s1", 275, 250, "timeframe", on, 28, "#1F3A5F", { mono: true });
      o.s2h = { type: "rect", x: 128, y: 274, w: 296, h: 38, rx: 8, fill: "#FDF3CF", op: k === 1 || k === 2 ? 1 : 0, z: 5 };
      tx(o, "s2", 275, 300, "daily · weekly · monthly", on, 22, "#1F3A5F", { mono: true });
      /* 스위치 위치 */
      o.knob = { type: "circle", cx: KNOB[c.sw][0], cy: KNOB[c.sw][1], r: 12, fill: C.coral, stroke: "#FFFFFF", sw: 3, op: on, z: 6 };
      /* 상자 속 응답 본문 */
      c.body.forEach((b, i) => tx(o, "b" + i + c.sw, 830, (c.body.length === 1 ? 555 : 532 + i * 30), b, on, c.body.length === 1 ? 44 : 18, c.stc === C.ok ? "#1F3A5F" : C.bad, { mono: true }));
      /* 번호표 판 */
      tx(o, "stc", 1435, 195, c.st, on, 64, c.stc, { mono: true });
      /* 모니터 */
      candles(o, "cd", [1240, 350, 340, 200], on && c.scr === "chart" ? 1 : 0);
      tx(o, "em", 1410, 465, "표시할 봉이 없습니다", on && c.scr === "empty" ? 1 : 0, 26, "#8A919C", { w: 500 });
      tx(o, "er0", 1410, 440, "데이터를 불러오지 못했습니다", on && c.scr === "error" ? 1 : 0, 26, "#1F3A5F");
      tx(o, "er1", 1410, 480, "Supabase 조회 실패:", on && c.scr === "error" ? 1 : 0, 17, "#5D6470", { mono: true, w: 500 });
      tx(o, "er2", 1410, 506, "column ksc_bars.close does not exist", on && c.scr === "error" ? 1 : 0, 15, "#5D6470", { mono: true, w: 500 });
      /* 신호: 스위치 → 창구, 창구 → 상자 → 모니터 */
      const go = [[300, 600], [640, 330], [840, 300]], back = [[840, 330], [830, 520], [1240, 460]];
      if (k === 0 || k === 1 || k === 3) { dot(o, "d", go, 1, C.coral); dot(o, "r", back, 1, c.stc === C.ok ? C.teal : C.bad, 1, 0.7); }
      else { nodot(o, "d", go, C.coral); nodot(o, "r", back, C.teal); }
      /* Network 창: 이름 · 상태 · 응답 */
      [0, 1, 3].forEach((ci, i) => {
        const r = CASE10[ci].row, vis = k >= ci ? 1 : 0, bad = ci === 3, quiet = ci === 1;
        tx(o, "nn" + i, 70, NROW(i), r[0], vis, 20, "#1F3A5F", { a: "start", mono: true });
        tx(o, "ns" + i, 840, NROW(i), r[1], vis, 22, bad ? C.bad : C.ok, { mono: true });
        tx(o, "nb" + i, 900, NROW(i), r[2], vis, 19, bad ? C.bad : quiet ? "#8A919C" : "#1F3A5F", { a: "start", mono: true });
      });
      txtBox(o, "q", [1395, NROW(1) - 25, 172, 34], "조용히 빔", k >= 4 ? 1 : 0, "#5D6470", { max: 20 });
      txtBox(o, "l", [1395, NROW(2) - 25, 172, 34], "시끄럽게 실패", k >= 4 ? 1 : 0, C.bad, { max: 20 });
      hl(o, "h2a", [1240, 100, 390, 155], k === 2, t); hl(o, "h2b", [800, 760, 520, 80], k === 2, t);
      hl(o, "h5", [40, 740, 1550, 160], k === 5, t);
      if (k === 2) cnote(o, "n2", 190, "상태 코드만 보면 둘 다 성공 — 본문을 열어야 보인다", 1, "alert");
      if (k === 4) cnote(o, "n4", 190, "조용한 실패가 더 찾기 어렵다", 1, "alert");
      if (k === 5) cnote(o, "n5", 190, "200인데 화면이 비면: 보낸 값 ↔ 받은 이름표를 나란히", 1, C.ink);
      return o;
    },
  });

  IT.define({
    id: "e10", fig: "다음 시간", title: "Part2-5 HTML · CSS · JavaScript의 역할", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part2-5", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "HTML · CSS · JavaScript", size: 66, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "화면을 만드는 세 가지 재료", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/krx-stock-charts", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });
})();
