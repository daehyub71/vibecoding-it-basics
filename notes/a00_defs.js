/* IT 기본지식 강의 소개 — 움직이는 그림 (2026-10-19)
   그림 p00_01·p00_02 (라벨 채움 애니) · 무대 p00_a1(AI가 하는 낯선 말) · p00_a2(39편 여정 지도) · 엔드카드 e00.
   좌표는 무대 그림(1672×941) 기준. Q 의 상자 좌표는 그림을 받은 뒤 제작도구/it_label_fill.py detect 결과로 채운다. */
(function () {
  const W = 1672, H = 941;
  const C = { coral: "#B53A24", teal: "#03807F", blue: "#1B66C9", ink: "#1F3A5F" };
  const PC = ["#1B66C9", "#03807F", "#7A4FB5", "#B53A24", "#C27A00", "#2D7A4E", "#D2453A"];   // 파트 색 1~7

  /* ⭐그림 좌표 — 그림을 받으면 detect 결과로 바꾼다 [x, y, w, h] */
  const Q = {
    p00_01: [[154, 80, 332, 67], [908, 78, 388, 70], [616, 744, 281, 75], [964, 744, 293, 76], [1319, 744, 305, 75]],
    p00_02: [[94, 82, 395, 77], [643, 82, 387, 77], [1186, 82, 392, 77], [137, 763, 309, 67], [681, 763, 311, 67], [1221, 763, 315, 66]],
    bub: [[400, 95, 440, 200], [965, 75, 465, 200], [1110, 365, 500, 200], [1095, 645, 515, 200]],   // 말풍선 속 글자 자리(손으로 읽음)
    disc: [[375, 858], [389, 653], [736, 605], [802, 451], [210, 366], [706, 283], [288, 161]],      // 길 순서: 집→가게→창고→공방→항구→연구소→발사대
    st: [[419, 834, 155, 50], [432, 629, 149, 47], [780, 581, 150, 48], [846, 427, 147, 47], [254, 342, 150, 47], [748, 259, 142, 46], [332, 137, 150, 48]],
  };

  function lab(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].length;
    const size = Math.min(h * 0.46, (w - 26) / Math.max(1, n * 0.98));
    o["lb-" + id] = { type: "rect", x: x + 4, y: y + 4, w: w - 8, h: h - 8, rx: h * 0.22, fill: "#FFFFFF", op: on, z: 3, from: { sc: 0.7 }, lag: opt && opt.lag };
    o["lt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", fill: color, op: on, z: 4, from: { y: y + h / 2 + size * 0.36 + 10 }, lag: opt && opt.lag };
  }
  function hl(o, id, r, on, t) { const [x, y, w, h] = r; o["hl-" + id] = { type: "rect", x, y, w, h, rx: 22, fill: "none", stroke: "hot", sw: 7, op: on ? 0.75 + 0.25 * Math.sin((t || 0) * 4) : 0, z: 2 }; }
  function note(o, id, x, y, text, on, color) {
    const n = [...text].length, w = n * 24 + 44;
    o["nb-" + id] = { type: "rect", x, y, w, h: 54, rx: 16, fill: "#FFFFFF", stroke: color || "hot", sw: 3, op: on, z: 5, from: { y: y + 14 } };
    o["nt-" + id] = { type: "text", x: x + w / 2, y: y + 36, text, size: 25, weight: 700, anchor: "middle", fill: color || "hot-ink", op: on, z: 6, from: { y: y + 50 } };
  }
  function img(o, href) { o.bg = { type: "image", href, x: 0, y: 0, w: W, h: H, z: 0 }; }

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
  const bx = (arr, labels, colors) => Object.fromEntries(arr.map((b, i) => [i + 1, [...b, labels[i], colors[i]]]));

  /* ── 그림: 두 강의, 두 부류의 시청자 ── */
  figAnim("p00_01", "그림 0-1", "두 강의, 두 부류의 시청자", "왜 이 강의인가", "p00_01.jpg",
    bx(Q.p00_01, ["코드를 아는 분", "서비스를 만들 분", "아이디어", "AI와 함께 만들기", "서비스 런칭"], [C.blue, C.coral, C.teal, C.blue, C.coral]),
    [{ tag: "파이썬 강의" }, { tag: "코드를 아는 분", show: [1], hl: [8, 56, 548, 806] },
     { tag: "서비스를 만들 분", show: [2], hl: [566, 56, 1098, 806] }, { tag: "아이디어 → 런칭", show: [3, 4, 5] },
     { tag: "최소한의 IT 지식", note: [1000, 180, "최소한의 IT 지식", C.coral] }]);

  /* ── 그림: 이 강의가 필요한 세 가지 이유 ── */
  figAnim("p00_02", "그림 0-2", "이 강의가 필요한 세 가지 이유", "왜 필요한가", "p00_02.jpg",
    bx(Q.p00_02, ["① 알아듣기", "② 정확히 말하기", "③ 확인하고 지키기", "오류·안내문 읽기", "내 환경·증상 알리기", "틀린 답·비밀 지키기"], [C.blue, C.teal, C.coral, C.blue, C.teal, C.coral]),
    [{ tag: "세 가지 이유" }, { tag: "알아듣기", show: [1, 4], hl: [18, 70, 542, 770] }, { tag: "정확히 말하기", show: [2, 5], hl: [570, 70, 532, 770] },
     { tag: "확인하고 지키기", show: [3, 6], hl: [1112, 70, 540, 770] }, { tag: "결정은 내 몫", note: [622, 846, "코드는 AI, 결정과 확인은 나", C.coral] }]);

  /* ── 무대: AI가 하는 낯선 말 (p00_a1) — 말풍선이 하나씩 채워진다 ── */
  const SAY = [[["localhost:5173에서", "확인해 보세요"], "5장 localhost와 포트"], [["8000번 포트가", "이미 사용 중입니다"], "5장 localhost와 포트"],
    [[".env 파일에", "API 키를 넣어 주세요"], "28장 지켜야 하는 비밀"], [["커밋하고 푸시할까요?", "이제 배포하면 됩니다"], "22장 Git · 24장 배포"]];
  IT.define({
    id: "a00_01", fig: "움직이는 그림 0-A", title: "AI가 하는 낯선 말", sec: "왜 필요한가", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "AI가 코드를 써 준다", set: { k: 0 } }, { tag: "localhost", set: { k: 1 } }, { tag: "포트", set: { k: 2 } }, { tag: ".env", set: { k: 3 } },
      { tag: "커밋·배포", set: { k: 4 } }, { tag: "알아듣는 건 나", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k; img(o, "p00_a1.jpg");
      SAY.forEach(([msg, ch], i) => {
        const [x, y, w, h] = Q.bub[i], on = k >= i + 1 ? 1 : 0, [l1, l2] = msg;
        const size = Math.min(40, (w - 40) / (Math.max([...l1].length, [...l2].length) * 0.62));
        o["m1" + i] = { type: "text", x: x + w / 2, y: y + h / 2 - 6, text: l1, size, weight: 700, anchor: "middle", fill: "fg", op: on, z: 4, from: { y: y + h / 2 + 8 } };
        o["m2" + i] = { type: "text", x: x + w / 2, y: y + h / 2 + size + 2, text: l2, size, weight: 700, anchor: "middle", fill: "fg", op: on, z: 4, from: { y: y + h / 2 + size + 16 } };
        o["mc" + i] = { type: "text", x: x + w / 2, y: y + h - 14, text: ch, size: 22, weight: 700, anchor: "middle", fill: C.teal, op: k >= 5 ? 1 : 0, z: 4 };
        hl(o, "b" + i, [x - 8, y - 8, w + 16, h + 16], k === i + 1, t);
      });
      if (k >= 5) note(o, "me", 40, 850, "알아듣고 다음 행동을 정하는 건 나", C.coral);
      return o;
    },
  });

  /* ── 무대: 39편 여정 지도 (p00_a2) — 오른쪽 45%에 목차 카드 ── */
  const PART = [
    ["컴퓨터와 인터넷의 정체", "컴퓨터·인터넷", ["하드웨어 vs 소프트웨어", "파일·폴더·경로의 정체", "네트워크 vs 인터넷 vs 웹", "IP 주소 vs 도메인", "localhost와 포트", "서버 vs 클라이언트"]],
    ["웹사이트는 어떻게 움직일까", "웹의 동작", ["프론트엔드 vs 백엔드", "요청 vs 응답", "GET vs POST · HTTP vs HTTPS", "UI vs API", "HTML · CSS · JavaScript의 역할", "JSON vs YAML"]],
    ["프로그램과 데이터의 기본 원리", "프로그램·데이터", ["데이터 vs 정보", "파일 vs 데이터베이스", "관계형 DB vs NoSQL", "리스트 vs 딕셔너리", "변수·조건문·반복문·함수", "동기 vs 비동기", "프로세스 vs 스레드"]],
    ["AI가 코드를 만들 때 등장하는 도구들", "개발 도구", ["터미널 vs 코드 에디터", "라이브러리 vs 프레임워크", "Git vs GitHub", "테스트 vs 디버깅", "로컬 실행 vs 배포", "온프레미스 vs 클라우드"]],
    ["세상에 공개하고 안전하게 운영하기", "공개·운영", ["가상머신 vs 컨테이너", "CI vs CD", "공개 정보 vs 지켜야 하는 비밀"]],
    ["AI와 바이브코딩", "AI", ["전통적인 프로그램 vs LLM", "학습 vs 추론", "LLM vs sLLM", "프롬프트 · 토큰 · 컨텍스트 윈도우", "RAG vs 파인튜닝", "AI 챗봇 vs AI 에이전트", "직접 API 연결 vs MCP", "AI의 Skills · Tools · Hooks", "AI가 틀렸을 때 검증하기"]],
    ["실전 바이브코딩", "실전", ["아이디어부터 배포까지 완주하기", "바이브코딩에서 흔한 오류 10가지"]],
  ];
  const SHORT = ["컴퓨터", "웹", "데이터", "도구", "운영", "AI", "실전"];
  IT.define({
    id: "a00_02", fig: "움직이는 그림 0-B", title: "39편 여정 지도", sec: "전체 목차", view: [W, H], rest: 8, blank: { k: -1 },
    steps: [{ tag: "전체 지도", set: { k: 0 }, dur: 1.4 }, ...PART.map((p, i) => ({ tag: `Part ${i + 1} ${p[1]}`, set: { k: i + 1 }, dur: 1.0 })), { tag: "바뀔 수 있음", set: { k: 8 }, dur: 1.2 }],
    layout(s, t) {
      const o = {}, k = s.k; img(o, "p00_a2.jpg");
      // 정거장: 번호 원판 + 이름 상자
      PART.forEach((p, i) => {
        const [cx, cy] = Q.disc[i], lit = k === 0 || k >= i + 1, now = k === i + 1 && k <= 7;
        o["dc" + i] = { type: "circle", cx, cy, r: 33, fill: lit ? PC[i] : "#FFFFFF", stroke: PC[i], sw: 4, op: k >= 0 ? 1 : 0, sc: now ? 1 + 0.08 * Math.sin(t * 6) : 1, z: 3, from: { sc: 0.4 }, lag: k === 0 ? i * 0.12 : 0 };
        o["dn" + i] = { type: "text", x: cx, y: cy + 12, text: String(i + 1), size: 32, weight: 700, anchor: "middle", fill: lit ? "#FFFFFF" : PC[i], op: k >= 0 ? 1 : 0, z: 4, lag: k === 0 ? i * 0.12 : 0 };
        lab(o, "st" + i, Q.st[i], SHORT[i], k >= 0 ? 1 : 0, PC[i], { lag: k === 0 ? i * 0.12 : 0 });
        const rp = (t * 1.3) % 1;
        o["dr" + i] = { type: "circle", cx, cy, r: 33 + 26 * rp, fill: "none", stroke: PC[i], sw: 4, op: now ? 0.8 * (1 - rp) : 0, z: 2 };
      });
      // 목차 카드 (오른쪽 45%)
      const X = 1012, Y = 40, CW = 630, CH = 860;
      o.card = { type: "rect", x: X, y: Y, w: CW, h: CH, rx: 26, fill: "#FFFFFF", stroke: k >= 1 && k <= 7 ? PC[k - 1] : "line", sw: 4, op: k >= 0 ? 1 : 0, z: 2, from: { x: X + 60 } };
      // 0단계: 일곱 파트 한눈에
      o.ov = { type: "text", x: X + 44, y: Y + 82, text: "39편 · 7개 파트", size: 50, weight: 700, fill: "fg", op: k === 0 || k === 8 ? 1 : 0, z: 3 };
      PART.forEach((p, i) => {
        const y = Y + 162 + i * (k === 8 ? 76 : 92), on = k === 0 || k === 8 ? 1 : 0;
        o["ob" + i] = { type: "rect", x: X + 44, y: y - 40, w: 112, h: 56, rx: 28, fill: PC[i], op: on, z: 3, lag: i * 0.1 };
        o["obt" + i] = { type: "text", x: X + 100, y: y - 2, text: `Part ${i + 1}`, size: 24, weight: 700, anchor: "middle", fill: "#FFFFFF", op: on, z: 4, lag: i * 0.1 };
        o["obn" + i] = { type: "text", x: X + 176, y: y, text: p[0], size: p[0].length > 16 ? 26 : 29, weight: 700, fill: "fg", op: on, z: 3, lag: i * 0.1 };
              });
      // 1~7단계: 그 파트의 장 목록
      let base = 0;
      PART.forEach((p, i) => {
        const on = k === i + 1 ? 1 : 0, n = p[2].length, gap = n > 7 ? 64 : 76;
        o["ph" + i] = { type: "text", x: X + 44, y: Y + 74, text: `Part ${i + 1}`, size: 34, weight: 700, fill: PC[i], op: on, z: 3 };
        o["pt" + i] = { type: "text", x: X + 44, y: Y + 132, text: p[0], size: p[0].length > 16 ? 34 : 42, weight: 700, fill: "fg", op: on, z: 3, from: { x: X + 80 } };
        o["pl" + i] = { type: "line", x1: X + 44, y1: Y + 162, x2: X + CW - 44, y2: Y + 162, stroke: "line", sw: 2, op: on, z: 3 };
        p[2].forEach((c, j) => {
          const y = Y + 226 + j * gap;
          o[`cb${i}_${j}`] = { type: "rect", x: X + 44, y: y - 34, w: 88, h: 46, rx: 23, fill: PC[i], op: on, z: 3, lag: 0.15 + j * 0.08 };
          o[`cn${i}_${j}`] = { type: "text", x: X + 88, y: y - 2, text: `${i + 1}-${j + 1}`, size: 24, weight: 700, anchor: "middle", fill: "#FFFFFF", op: on, z: 4, lag: 0.15 + j * 0.08 };
          o[`ct${i}_${j}`] = { type: "text", x: X + 150, y: y, text: c, size: 30, weight: 600, fill: "fg", op: on, z: 3, from: { x: X + 180 }, lag: 0.15 + j * 0.08 };
        });
        o["pc" + i] = { type: "text", x: X + CW - 40, y: Y + CH - 32, text: `${base + 1}~${base + n}장 · ${n}편`, size: 26, anchor: "end", fill: "muted", op: on, z: 3 };
        base += n;
      });
      // 8단계: 목차는 진행하며 바뀔 수 있다
      const ch = k === 8 ? 1 : 0;
      o.chb = { type: "rect", x: X + 28, y: Y + CH - 168, w: CW - 56, h: 132, rx: 18, fill: "#FDF3CF", stroke: "#E9A400", sw: 3, op: ch, z: 4, from: { y: Y + CH - 140 } };
      o.cht1 = { type: "text", x: X + CW / 2, y: Y + CH - 112, text: "목차는 강의를 진행하며 바뀔 수 있습니다", size: 28, weight: 700, anchor: "middle", fill: "#7E5B00", op: ch, z: 5 };
      o.cht2 = { type: "text", x: X + CW / 2, y: Y + CH - 66, text: "바뀌면 강의 목차 페이지에 바로 반영합니다", size: 24, weight: 600, anchor: "middle", fill: "#7E5B00", op: ch, z: 5 };
      return o;
    },
  });

  /* ── 엔드카드: 다음 시간 Part1-1 + 구독·좋아요·알림 설정·댓글 ── */
  IT.define({
    id: "e00", fig: "다음 시간", title: "Part1-1 하드웨어 vs 소프트웨어", sec: "다음 시간", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · 첫 강의 Part1-1", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "하드웨어 vs 소프트웨어", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "컴퓨터의 본체와 일하는 방법을 나누는 법", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.ch = { type: "text", x: 836, y: 690, text: "궁금한 점은 댓글로 남겨 주세요", size: 40, weight: 700, anchor: "middle", fill: "fg", op: k >= 4 ? 1 : 0, z: 3, from: { y: 710 } };
      o.chn = { type: "text", x: 836, y: 800, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });
})();
