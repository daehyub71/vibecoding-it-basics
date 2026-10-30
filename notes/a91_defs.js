/* 바이브코딩 실전 T1 움직이는 그림 — 혼합 판(2026-10-30): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 강조 · 쪽지 · 숫자를 얹는다. 예제 저장소 = github-ai-star-trend.
   좌표는 무대 그림(1672×941) 기준 — 상자는 it_label_fill detect 결과(IT91/img/*_det.json). 숫자는 저장소 docs/MEASURE.md 실측(제작원고_T1_v2.md §9).
   단계는 v2 대본 문장 수에 맞췄다(문장 하나 = 단계 하나). v1 §4 와 다른 점: a91_02 「재현 테스트 먼저」 쪽지는 대본 순서대로 수리 단계에 둔다. */
(function () {
  const W = 1672, H = 941;
  const C = { coral: "#B53A24", teal: "#03807F", blue: "#1B66C9", ink: "#1F3A5F", ok: "#2D7A4E", bad: "#CF3F33" };

  /* 빈 상자에 라벨 얹기: [x,y,w,h] — "\n" 이면 두 줄 */
  function lab(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, lines = String(text).split("\n");
    const n = Math.max(...lines.map((t) => [...t].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0)));
    const size = Math.min(h * (lines.length > 1 ? 0.36 : 0.52), (w - 26) / Math.max(1, n)), lh = size * 1.2, y0 = y + h / 2 - (lh * (lines.length - 1)) / 2;
    o["lb-" + id] = { type: "rect", x: x + 4, y: y + 4, w: w - 8, h: h - 8, rx: h * 0.22, fill: "#FFFFFF", op: on, z: 3, from: { sc: 0.7 }, lag: opt && opt.lag };
    lines.forEach((t, i) => {
      const yy = y0 + lh * i + size * 0.36;
      o["lt-" + id + "-" + i] = { type: "text", x: x + w / 2, y: yy, text: t, size, weight: 700, anchor: "middle", fill: color, op: on, z: 4, from: { y: yy + 10 }, lag: opt && opt.lag };
    });
  }
  function hl(o, id, r, on, t) { const [x, y, w, h] = r; o["hl-" + id] = { type: "rect", x, y, w, h, rx: 22, fill: "none", stroke: "hot", sw: 7, op: on ? 0.75 + 0.25 * Math.sin((t || 0) * 4) : 0, z: 2 }; }
  function note(o, id, x, y, text, on, color) {
    const n = [...text].length, w = n * 24 + 44;
    o["nb-" + id] = { type: "rect", x, y, w, h: 54, rx: 16, fill: "#FFFFFF", stroke: color || "hot", sw: 3, op: on, z: 8, from: { y: y + 14 } };
    o["nt-" + id] = { type: "text", x: x + w / 2, y: y + 36, text, size: 25, weight: 700, anchor: "middle", fill: color || "hot-ink", op: on, z: 9, from: { y: y + 50 } };
  }
  const cnote = (o, id, cy, text, on, color, cx) => note(o, id, (cx || W / 2) - ([...text].length * 24 + 44) / 2, cy, text, on, color);
  function img(o, href) { o.bg = { type: "image", href, x: 0, y: 0, w: W, h: H, z: 0 }; }
  function txtBox(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min((opt && opt.max) || h * 0.5, (w - 20) / Math.max(1, n));
    o["tb-" + id] = { type: "rect", x, y, w, h, rx: Math.min(14, h * 0.3), fill: (opt && opt.bg) || "#FFFFFF", stroke: color, sw: 3, op: on, z: 6, from: { sc: 0.85 } };
    o["tt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", font: opt && opt.mono ? "mono" : undefined, fill: (opt && opt.fg) || color, op: on, z: 7 };
  }
  const mark = (o, id, x, y, ok, on, size) => { o[id] = { type: "text", x, y, text: ok ? "✓" : "✗", size: size || 64, weight: 700, anchor: "middle", fill: ok ? C.ok : C.bad, op: on, z: 9 }; };
  const tx = (o, id, x, y, text, on, size, color, opt) => { o[id] = { type: "text", x, y, text, size, weight: (opt && opt.w) || 700, anchor: (opt && opt.a) || "middle", font: opt && opt.mono ? "mono" : undefined, fill: color, op: on, z: (opt && opt.z) || 7, from: opt && opt.from }; };

  /* 상자 좌표 — 번호는 *_det.json 의 n */
  const D = {
    p91_01: { 1: [788, 103, 224, 77], 2: [185, 184, 202, 70], 3: [428, 184, 203, 70], 4: [1180, 191, 201, 71], 5: [1432, 191, 213, 71] },
    p91_02: { 1: [629, 103, 163, 52], 2: [153, 92, 197, 50], 3: [1338, 85, 211, 56], 4: [1067, 542, 172, 50], 5: [637, 565, 155, 49] },
    p91_03: { 1: [42, 101, 194, 62], 2: [354, 102, 184, 60], 3: [1307, 237, 214, 63], 4: [670, 185, 149, 46], 5: [709, 327, 150, 48], 6: [762, 484, 148, 49] },
    p91_04: { 1: [41, 48, 225, 71], 2: [1321, 60, 256, 73], 3: [694, 163, 238, 72], 4: [36, 216, 194, 74], 5: [1329, 369, 234, 70], 6: [1399, 532, 240, 72] },
    p91_05: { 1: [1135, 60, 281, 69], 2: [101, 107, 337, 86], 3: [636, 133, 304, 85], 4: [1378, 768, 258, 80] },
    p91_06: { 1: [98, 87, 385, 83], 2: [659, 87, 317, 82], 3: [1077, 87, 271, 85], 4: [1397, 87, 253, 85] },
    p91_07: { 1: [110, 79, 242, 80], 2: [994, 46, 243, 79], 3: [1322, 184, 268, 75], 4: [548, 214, 260, 75], 5: [963, 484, 237, 64] },
  };
  /* 그림 애니: labels = {n: [글, 색]} · steps[i].show = 그 단계에 나타날 상자 번호 */
  function figAnim(id, fig, title, sec, labels, steps) {
    const B = D[id];
    IT.define({
      id, fig, title, sec, view: [W, H], rest: steps.length - 1, blank: { k: -1 },
      steps: steps.map((s, i) => ({ tag: s.tag, say: s.say || s.tag, set: { k: i }, dur: 1.2 })),
      layout(s, t) {
        const o = {}; img(o, id + ".jpg"); const k = s.k;
        steps.forEach((st, i) => (st.show || []).forEach((n, j) => lab(o, "b" + n, B[n], labels[n][0], k >= i ? 1 : 0, labels[n][1], { lag: Math.min(0.6, j * 0.15) })));
        steps.forEach((st, i) => { if (st.hl) hl(o, "h" + i, st.hl, k === i, t); });
        const cur = steps[k] || {};
        if (cur.note) cnote(o, "nt", cur.note[0], cur.note[1], 1, cur.note[2], cur.note[3]);
        return o;
      },
    });
  }

  figAnim("p91_01", "그림 T1-1", "별이 쏟아지는 저장소 마을에서 주간 신문으로", "왜 GitHub 스타인가",
    { 1: ["주간 집계", C.blue], 2: ["저장소마다\n쌓이는 별", C.blue], 3: ["한 주 동안\n늘어난 별", C.blue], 4: ["주간 AI\n트렌드 브리핑", C.blue], 5: ["근거가 붙은\n저장소 카드", C.blue] },
    [{ tag: "스타 = 눈여겨본다", show: [2], hl: [0, 60, 760, 760] }, { tag: "수만 명이 누르면", show: [3] }, { tag: "한 주 동안 모으면", show: [1], hl: [740, 90, 400, 720] },
     { tag: "매주 아침 신문처럼", show: [4, 5], hl: [1140, 120, 532, 700] }]);
  figAnim("p91_02", "그림 T1-2", "급한 라면 대신 요리 교실", "라이브를 멈추고 방식을 바꿨다",
    { 1: ["시간에 쫓긴다", C.teal], 2: ["전에는 — 라이브", C.coral], 3: ["그림과 비유로 쉽게", C.blue], 4: ["끝까지 만든 뒤", C.coral], 5: ["레시피를 못 읽는다", C.blue] },
    [{ tag: "급한 라면", show: [2, 1, 5], hl: [0, 60, 830, 810] }, { tag: "요리 교실", show: [4, 3], hl: [830, 60, 842, 810] },
     { tag: "실수도 빼지 않고", note: [850, "실수한 장면도 빼지 않고 — 왜 그랬는지까지", C.ink] }]);
  figAnim("p91_03", "그림 T1-3", "토론에서 설계 문서 셋으로", "토론으로 정하고 문서로 남긴다",
    { 1: ["선택지와 장단점", C.coral], 2: ["결정은 사람이", C.blue], 3: ["진도율", C.blue], 4: ["명세서 SPEC", C.coral], 5: ["계획서 PLAN", C.teal], 6: ["할 일 TASK", C.blue] },
    [{ tag: "설계도부터", show: [1, 2], hl: [0, 80, 620, 780] }, { tag: "명세 · 계획 · 할 일", show: [4, 5, 6], hl: [610, 120, 560, 620] },
     { tag: "진도 막대", show: [3], hl: [1180, 210, 492, 640] }]);
  figAnim("p91_04", "그림 T1-4", "마구를 채운 말", "하네스 엔지니어링",
    { 1: ["AI — 힘센 말", C.coral], 2: ["마부 — 사람", C.coral], 3: ["고삐 —\n문서(SPEC)", C.blue], 4: ["눈가리개 — 테스트\n· 커밋 전 검사", C.teal], 5: ["계량기 — 예산 상한", C.teal], 6: ["채점판 — 정답 세트", C.blue] },
    [{ tag: "고삐 · 가리개 · 계량기", show: [3, 4, 5] }, { tag: "방향은 마구가", show: [1, 6, 2], note: [850, "말은 힘껏 달리고, 방향과 속도는 마구가 잡는다", C.ink] }]);
  figAnim("p91_05", "그림 T1-5", "한 번 쓰면 잠기는 금고", "한 번 쓰면 못 고치는 파일",
    { 1: ["한 번 쓰면 잠김", C.blue], 2: ["임시 폴더(연습장)", C.blue], 3: ["다 끝난 뒤 한꺼번에", C.teal], 4: ["반쯤 쓴 파일은\n못 들어감", C.coral] },
    [{ tag: "연습장 → 금고", show: [2, 3, 1], hl: [0, 80, 1020, 800] }, { tag: "반쯤 쓴 서류는 막힌다", show: [4], hl: [1150, 520, 512, 360] }]);
  figAnim("p91_06", "그림 T1-6", "덮고 고르는 정답 세트", "채점표부터 — 정답 세트",
    { 1: ["블라인드 30 — 초안을 덮고", C.coral], 2: ["초안 검수 170", C.teal], 3: ["정답 세트 200", C.blue], 4: ["모델 채점", C.coral] },
    [{ tag: "답안지를 덮고", show: [1], hl: [0, 180, 590, 600] }, { tag: "검수 170 · 수정 0", show: [2], hl: [570, 180, 470, 560] },
     { tag: "점수는 덮은 쪽으로", show: [3, 4], hl: [1040, 180, 632, 560] }]);
  figAnim("p91_07", "그림 T1-7", "월요일 아침 신문 공장", "Notion 에 쌓고, 사람이 게시한다",
    { 1: ["월요일 아침 9시\n자동 실행", C.blue], 2: ["공개 창고\n코드 · 숫자", C.blue], 3: ["사람이 검토하고 게시", C.blue], 4: ["별 사진 →\n순위 → 카드", C.blue], 5: ["비공개 창고\nAI가 쓴 글", C.coral] },
    [{ tag: "저절로 도는 공장", show: [1, 4], hl: [0, 150, 860, 600] }, { tag: "로봇은 문 앞까지", show: [2, 5], hl: [1340, 600, 332, 290] },
     { tag: "고치고 보내는 건 사람", show: [3], hl: [1290, 140, 382, 470] }]);

  /* ── T1-A 매주 사진 두 장을 빼면 (무대 p91_a01) ── */
  const DAYS = ["월", "화", "수", "목", "금", "토", "일"], DV = [0.35, 0.55, 0.9, 0.7, 0.5, 0.3, 0.25];
  IT.define({
    id: "a91_01", fig: "움직이는 그림 T1-A", title: "매주 사진 두 장을 빼면", sec: "짐작 대신 줄자", view: [W, H], rest: 4, blank: { k: -1 },
    steps: ["전수 조사는 13시간", "매주 사진 한 장", "두 장을 빼면", "위쪽만 자세히", "13시간 → 1시간"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p91_a01.jpg");
      lab(o, "old", [319, 159, 229, 74], "지난주 사진", k >= 1 ? on : 0, C.ink);
      lab(o, "new", [249, 730, 229, 75], "이번 주 사진", k >= 1 ? on : 0, C.ink);
      lab(o, "sub", [654, 116, 309, 74], "두 장을 겹쳐 빼기", k >= 2 ? on : 0, C.coral);
      lab(o, "cand", [814, 574, 230, 75], "늘어난 별 = 후보", k >= 2 ? on : 0, C.coral);
      lab(o, "top", [1194, 87, 280, 72], "위쪽 몇천 개만", k >= 3 ? on : 0, C.teal);
      lab(o, "day", [1208, 726, 294, 64], "요일별 자세한 기록", k >= 3 ? on : 0, C.teal);
      /* 확대 원 속 요일 막대 */
      DAYS.forEach((d, i) => {
        const x = 1230 + i * 48.6, bh = 165 * DV[i];
        o["bar" + i] = { type: "rect", x: x + 6, y: 532 - bh, w: 32, h: bh, rx: 4, fill: i === 2 ? C.coral : C.teal, op: k >= 3 ? on : 0, z: 5, from: { h: 0, y: 532 }, lag: i * 0.08 };
        tx(o, "dl" + i, x + 22, 562, d, k >= 3 ? on : 0, 20, C.ink);
      });
      txtBox(o, "big", [380, 30, 560, 58], "6.6만 개 × 하나씩 기록 = 13.2시간", on && k === 0 ? 1 : 0, C.bad);
      txtBox(o, "snap", [20, 470, 300, 50], "검색 한 번에 100개씩", on && k === 1 ? 1 : 0, C.ink, { max: 24 });
      hl(o, "h0", [1490, 0, 135, 255], k === 0, t);
      hl(o, "h1", [10, 120, 360, 680], k === 1, t);
      hl(o, "h2", [790, 350, 120, 140], k === 2, t);
      hl(o, "h3", [1165, 215, 460, 455], k === 3, t);
      hl(o, "h4", [1588, 112, 84, 182], k === 4, t);
      if (k === 4) cnote(o, "n4", 850, "13시간짜리 요청 → 한 시간 안팎", 1, C.ok);
      return o;
    },
  });

  /* ── T1-B 641개가 사라진 이유 (무대 p91_a02) ── */
  IT.define({
    id: "a91_02", fig: "움직이는 그림 T1-B", title: "641개가 사라진 이유", sec: "첫 실제 실행 — 641개", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["원인은 셋", "① 99개만 온 쪽", "여기서 멈춤", "② 일부만 온 응답", "③ 쪽 경계가 흔들림", "재현 테스트 먼저", "641 → 3"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p91_a02.jpg");
      lab(o, "p99", [116, 49, 232, 65], "① 99개만 온 쪽", k >= 1 ? on : 0, C.coral);
      lab(o, "stop", [380, 63, 202, 65], "여기서 멈춤", k >= 2 ? on : 0, C.coral);
      lab(o, "part", [828, 51, 232, 55], "② 일부만 온 응답", k >= 3 ? on : 0, C.coral);
      lab(o, "keep", [959, 368, 168, 57], "저장돼서\n계속 빈칸", k >= 3 ? on : 0, C.coral);
      lab(o, "tie", [1417, 47, 220, 66], "③ 순서가 흔들림", k >= 4 ? on : 0, C.coral);
      lab(o, "fix", [692, 586, 289, 62], "작게 쪼개 한 쪽에", k >= 5 ? on : 0, C.teal);
      txtBox(o, "z", [626, 486, 420, 70], k >= 6 ? "빈칸 641 → 3" : "에러 0 · 빈칸 641", on && (k === 0 || k === 6) ? 1 : 0, k >= 6 ? C.ok : C.bad, { max: 40 });
      hl(o, "h1", [0, 40, 600, 480], k === 1 || k === 2, t);
      hl(o, "h3", [610, 40, 500, 470], k === 3, t);
      hl(o, "h4", [1130, 40, 542, 470], k === 4, t);
      hl(o, "h5", [20, 650, 1632, 270], k === 5, t);
      if (k === 2) cnote(o, "n2", 860, "「덜 찼으니 끝」 → 고침: 빈 쪽에서만 멈춘다", 1, C.ink);
      if (k === 3) cnote(o, "n3", 860, "고침: 저장하지 않고 한 번 더 받는다", 1, C.ink);
      if (k === 4) cnote(o, "n4", 860, "고침: 100개 이하로 쪼개 한 쪽에 받는다", 1, C.ink);
      if (k === 5) cnote(o, "n5", 860, "재현 테스트 먼저 → 실패를 보고 → 고친다", 1, C.ok);
      if (k === 6) cnote(o, "n6", 860, "다시 돌리니 65,921 / 65,924", 1, C.ok);
      return o;
    },
  });

  /* ── T1-C 주 시작 스타가 음수가 된 이유 (무대 p91_a03) ── */
  IT.define({
    id: "a91_03", fig: "움직이는 그림 T1-C", title: "주 시작 스타가 음수가 된 이유", sec: "4주만 먼저 · 이상한 숫자", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["이상한 줄", "주 시작 = 마이너스?", "두 시각", "위에서 빼면", "아래서 쌓으면", "큰 쪽을 쓴다", "주마다 40~60줄"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p91_a03.jpg");
      tx(o, "nm", 412, 140, "deepseek-ai/DeepInfer", on, 30, C.ink, { mono: true });
      txtBox(o, "end", [260, 255, 300, 52], "주 끝 21,988", on, C.ink);
      txtBox(o, "gain", [260, 600, 300, 52], "한 주 증가 22,015", on, C.coral);
      lab(o, "neg", [62, 790, 193, 51], "주 시작 = −27?", k >= 1 ? on : 0, C.bad);
      lab(o, "c1", [592, 56, 193, 54], "사진 찍은 때", k >= 2 ? on : 0, C.ink);
      lab(o, "c2", [886, 55, 192, 55], "기록 받은 때", k >= 2 ? on : 0, C.ink);
      lab(o, "dn", [30, 170, 203, 58], "위에서 빼기", k >= 3 ? on : 0, C.coral);
      lab(o, "up", [1499, 327, 155, 58], "아래서 쌓기", k >= 4 ? on : 0, C.teal);
      lab(o, "max", [740, 397, 197, 50], "큰 쪽을 쓴다", k >= 5 ? on : 0, C.blue);
      hl(o, "h1", [290, 650, 100, 230], k === 1, t);
      hl(o, "h2", [630, 115, 415, 205], k === 2, t);
      hl(o, "h3", [185, 235, 460, 445], k === 3, t);
      hl(o, "h4", [1080, 470, 350, 230], k === 4, t);
      hl(o, "h5", [660, 460, 350, 260], k === 5, t);
      if (k === 2) cnote(o, "n2", 860, "찍은 뒤 받기까지 그사이 별이 더 늘었다", 1, C.ink, 1100);
      if (k === 3) cnote(o, "n3", 860, "늘어난 몫까지 빼서 바닥 밑으로", 1, "alert", 1100);
      if (k === 4) cnote(o, "n4", 860, "쌓아 올리면 마이너스가 될 수 없다", 1, C.ok, 1100);
      if (k === 5) cnote(o, "n5", 860, "둘 다 조금 작게 나온다 → 큰 쪽이 더 정확", 1, C.ink, 1100);
      if (k === 6) cnote(o, "n6", 860, "주마다 44~61줄 → 고친 뒤 0줄", 1, C.ok, 1100);
      return o;
    },
  });

  /* ── T1-D 누가 검색하나 (무대 p91_a04) ── */
  IT.define({
    id: "a91_04", fig: "움직이는 그림 T1-D", title: "누가 검색하나", sec: "근거는 어디서 찾나", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["두 가지를 재 봤다", "Claude 에게 검색까지", "5개 · 75센트 · 0건", "같은 검색어 반복", "우리 코드가 검색", "검색 1번 · 6건", "남는 쪽을 골랐다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p91_a04.jpg");
      tx(o, "L", 418, 30, "① Claude 가 검색", on, 26, C.ink, { z: 9 }); tx(o, "R", 1255, 30, "② 우리 코드가 검색", on, 26, C.ink, { z: 9 });
      lab(o, "a", [176, 53, 273, 71], "Claude 에게 검색까지", k >= 1 ? on : 0, C.ink);
      lab(o, "r1", [50, 721, 245, 69], "5개 · 75센트", k >= 2 ? on : 0, C.coral);
      lab(o, "tray", [585, 363, 224, 69], "찾아온 글 0개", k >= 2 ? on : 0, C.coral);
      lab(o, "b", [876, 83, 250, 70], "우리 코드가 검색", k >= 4 ? on : 0, C.teal);
      lab(o, "file", [1414, 167, 239, 71], "주소 목록 파일", k >= 4 ? on : 0, C.teal);
      lab(o, "r2", [912, 748, 241, 69], "검색 1번 · 6건", k >= 5 ? on : 0, C.teal);
      mark(o, "x", 640, 560, false, k >= 3 ? on : 0, 96);
      mark(o, "v", 1372, 236, true, k >= 6 ? on : 0, 96);
      hl(o, "h1", [10, 130, 800, 560], k === 1, t);
      hl(o, "h2", [390, 440, 420, 260], k === 2, t);
      hl(o, "h4", [850, 380, 820, 330], k === 4, t);
      hl(o, "h5", [1130, 730, 320, 190], k === 5, t);
      if (k === 0) cnote(o, "n0", 860, "실제로 돈을 내고 두 방법을 재 봤다", 1, C.ink);
      if (k === 3) cnote(o, "n3", 860, "같은 검색어 반복 → 횟수 제한 → 빈손", 1, "alert", 420);
      if (k === 5) cnote(o, "n5", 860, "리뷰와 사용기 6건", 1, C.ok, 1255);
      if (k === 6) cnote(o, "n6", 860, "무엇을 봤는지 우리 쪽에 남는다", 1, C.ok, 1255);
      return o;
    },
  });

  IT.define({
    id: "e91", fig: "마치며", title: "바이브코딩 실전 T1", sec: "마치며", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "마치며", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "바이브코딩 실전 T1", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "GitHub 스타로 AI 트렌드 읽기", size: 66, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "문서 · 그림 · 예제 저장소 주소는 설명란과 강의 자료 페이지에", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/github-ai-star-trend", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });
})();
