/* 5장 움직이는 그림 — 혼합 판(2026-10-21): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 문 번호 · 터미널 글자를 얹는다. 예제 저장소 = etf-portfolio-lab.
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

  const D = {
    p05_01: [[318, 52, 195, 51], [48, 390, 168, 52], [336, 386, 182, 52], [604, 391, 167, 51], [837, 400, 177, 50], [1014, 753, 165, 51], [1218, 791, 167, 52], [1431, 820, 177, 52]],
    p05_02: [[749, 216, 188, 49], [62, 290, 182, 53], [1424, 288, 175, 54], [364, 377, 156, 54], [1152, 377, 167, 54]],
    p05_03: [[291, 49, 196, 44], [805, 49, 204, 43], [1365, 49, 204, 43], [274, 392, 233, 44], [847, 392, 213, 44], [1387, 392, 221, 44]],
    p05_04: [[176, 88, 220, 66], [1250, 70, 229, 64], [98, 233, 212, 57], [656, 265, 200, 57], [393, 295, 216, 66], [1406, 485, 209, 56]],
    p05_05: [[723, 46, 226, 39], [1390, 78, 222, 40], [443, 144, 179, 40], [84, 278, 233, 39], [1394, 459, 217, 40]],
    p05_06: [[540, 92, 211, 54], [1123, 126, 224, 55], [1462, 154, 192, 55], [761, 264, 208, 60], [39, 551, 184, 55]],
    p05_07: [[1266, 166, 150, 62], [1471, 168, 175, 60], [325, 244, 201, 62], [874, 242, 197, 63], [0, 0, 1, 1], [1268, 696, 179, 57], [1473, 696, 167, 60]],
  };
  figAnim("p05_01", "그림 5-1", "한 건물, 여러 출입문", "5.1 한 건물, 여러 출입문", "p05_01.jpg",
    bx(D.p05_01, [[1, "건물 주소 하나", C.blue], [2, "옆문", C.teal], [3, "정문", C.coral], [4, "뒷문", C.blue], [5, "내 노트북 = localhost", C.teal], [6, "5173번: 화면", C.coral], [7, "8000번: API 서버", C.teal], [8, "5432번: DB", C.blue]]),
    [{ tag: "주소는 하나", show: [1], hl: [0, 20, 760, 880] }, { tag: "문마다 다른 가게", show: [2, 3, 4], hl: [0, 300, 760, 520] }, { tag: "노트북 = 건물 · 포트 = 문", show: [5, 6, 7, 8], hl: [760, 60, 912, 880] }]);
  figAnim("p05_02", "그림 5-2", "같은 글자를 입력해도 가는 곳은 다르다", "5.2 localhost", "p05_02.jpg",
    bx(D.p05_02, [[2, "내가 친 localhost", C.teal], [3, "친구가 친 localhost", C.coral], [4, "내 노트북 안으로", C.teal], [5, "내 앱 없음", C.coral], [1, "링크만 보냈다", C.blue]]),
    [{ tag: "같은 주소", show: [1, 2] }, { tag: "내 쪽은 열린다", show: [3], hl: [0, 60, 700, 820] }, { tag: "친구 쪽은 비었다", show: [4, 5], hl: [980, 60, 692, 820] }]);
  figAnim("p05_03", "그림 5-3", "파일을 만든 것과 문을 연 것은 다르다", "5.5 서버 실행", "p05_03.jpg",
    bx(D.p05_03, [[4, "셔터 내린 가게", C.coral], [1, "파일만 있음", C.coral], [5, "셔터 올리기", C.teal], [2, "서버 실행", C.teal], [6, "손님을 맞는 가게", C.blue], [3, "요청에 응답", C.blue]]),
    [{ tag: "파일만 있다", show: [1, 2], hl: [0, 20, 560, 900] }, { tag: "문을 연다", show: [3, 4], hl: [560, 20, 560, 900] }, { tag: "손님을 받는다", show: [5, 6], hl: [1120, 20, 552, 900] }]);
  figAnim("p05_04", "그림 5-4", "서로 같은 창구를 열려고 하면", "5.6 포트 충돌", "p05_04.jpg",
    bx(D.p05_04, [[1, "8000번 문", C.coral], [3, "먼저 선 프로그램", C.teal], [4, "나중에 온 프로그램", C.blue], [5, "이미 사용 중", C.coral], [2, "다른 문(8001)으로", C.teal], [6, "누가 쓰는지 확인(lsof)", C.blue]]),
    [{ tag: "이미 앉아 있다", show: [1, 2], hl: [0, 40, 640, 880] }, { tag: "같은 문 → 막힘", show: [3, 4], hl: [300, 200, 600, 700] }, { tag: "옮기거나 확인", show: [5, 6], hl: [1180, 20, 492, 900] }]);
  figAnim("p05_05", "그림 5-5", "로컬 앱을 다른 기기에서 볼 때", "5.8 같은 와이파이", "p05_05.jpg",
    bx(D.p05_05, [[4, "노트북에서 켠 앱", C.blue], [1, "같은 와이파이", C.teal], [2, "localhost로는 실패", C.coral], [5, "사설 IP:포트로 접속", C.teal], [3, "방화벽 허용", C.coral]]),
    [{ tag: "같은 와이파이", show: [1, 2], hl: [0, 20, 1100, 880] }, { tag: "localhost ✗", show: [3], hl: [1370, 40, 280, 460] }, { tag: "IP:포트 + 허용", show: [4, 5], hl: [1370, 440, 280, 480] }]);
  figAnim("p05_06", "그림 5-6", "공구를 펼쳐 둔 작업실과 손님을 맞는 매장", "5.9 로컬 vs 배포", "p05_06.jpg",
    bx(D.p05_06, [[5, "개발용 오류·설정", C.coral], [1, "나만 드나드는 문", C.teal], [4, "배포", C.coral], [2, "잠금과 인증", C.blue], [3, "손님이 쓰는 서비스", C.teal]]),
    [{ tag: "내 작업실", show: [1, 2], hl: [0, 20, 760, 900] }, { tag: "손님을 맞는 매장", show: [3, 4, 5], hl: [760, 20, 912, 900] }, { tag: "책임이 다르다", show: [], note: [500, 860, "코드는 비슷해도 실행 환경과 책임이 달라진다", C.coral] }]);
  figAnim("p05_07", "그림 5-7", "‘사이트에 연결할 수 없습니다’ 앞에서", "5.10 바이브코딩 현장", "p05_07.jpg",
    bx(D.p05_07, [[3, "연결할 수 없음", C.blue], [4, "서버 로그 확인", C.coral], [1, "서버가 켜졌나", C.blue], [2, "포트가 같은가", C.coral], [6, "문을 뺏겼나", C.teal], [7, "같은 기기인가", C.coral]]),
    [{ tag: "연결할 수 없음", show: [1], hl: [0, 60, 560, 880] }, { tag: "로그부터", show: [2], hl: [560, 60, 560, 880] }, { tag: "네 가지 확인", show: [3, 4, 5, 6], hl: [1120, 60, 552, 880] }]);

  /* 글자 칸 */
  function txtBox(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].reduce((s, c) => s + (c >= "ᄀ" ? 1 : 0.6), 0);
    const size = Math.min((opt && opt.max) || h * 0.5, (w - 20) / Math.max(1, n));
    o["tb-" + id] = { type: "rect", x, y, w, h, rx: Math.min(14, h * 0.3), fill: (opt && opt.bg) || "#FFFFFF", stroke: color, sw: 3, op: on, z: 6, from: { sc: 0.85 } };
    o["tt-" + id] = { type: "text", x: x + w / 2, y: y + h / 2 + size * 0.36, text, size, weight: 700, anchor: "middle", font: opt && opt.mono ? "mono" : undefined, fill: (opt && opt.fg) || color, op: on, z: 7 };
  }
  const mark = (o, id, x, y, ok, on) => { o[id] = { type: "text", x, y, text: ok ? "✓" : "✗", size: 64, weight: 700, anchor: "middle", fill: ok ? "#2D7A4E" : "#CF3F33", op: on, z: 9 }; };

  /* ── 5-A 밖으로 나가지 않는 주소 (무대 p05_a01) ── */
  const A1 = { br: [470, 260], loop: [334, 650], srv: [719, 669], rt: [945, 490], cl: [1300, 250], dc: [1500, 300], fr: [1438, 690] };
  IT.define({
    id: "a05_01", fig: "움직이는 그림 5-A", title: "밖으로 나가지 않는 주소", sec: "5.2 localhost", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["웹사이트는 밖으로", "localhost는 안에서", "127.0.0.1 · ::1", "DNS에 묻지 않음", "와이파이를 꺼도", "친구의 localhost", "서버가 꺼지면"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.5 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p05_a01.jpg");
      lab(o, "br", [597, 134, 242, 67], "내 브라우저", on, C.blue); lab(o, "rt", [880, 266, 240, 66], k >= 4 ? "와이파이 꺼짐" : "공유기", on, k >= 4 ? "#CF3F33" : C.teal);
      lab(o, "cl", [1364, 76, 272, 70], "인터넷 · 웹사이트", on, C.ink); lab(o, "srv", [641, 764, 277, 66], k >= 6 ? "8000번 문 · 꺼짐" : "8000번 문 · 서버", on, k >= 6 ? "#CF3F33" : C.coral);
      lab(o, "lp", [54, 769, 262, 65], k >= 2 ? "루프백 127.0.0.1 · ::1" : "루프백", on, C.teal); lab(o, "fr", [1379, 500, 221, 66], "친구 노트북", k >= 5 ? 1 : 0, C.coral);
      o.url = { type: "text", x: 60, y: 200, text: k === 0 ? "https://example.com" : "http://localhost:8000", size: 26, weight: 700, font: "mono", fill: k === 0 ? C.blue : C.coral, op: on, z: 6 };
      route(o, "out", [A1.br, A1.rt, A1.cl, A1.dc], k === 0, C.blue);
      route(o, "lo", [A1.br, [250, 560], A1.loop, [460, 700], A1.srv], k >= 1 && k !== 5, k >= 6 ? "#CF3F33" : C.coral, k >= 6 ? "10 10" : "");
      if (k === 0) dot(o, "d", [A1.br, A1.rt, A1.cl, A1.dc], 1, C.blue);
      else if (k >= 1 && k <= 4) dot(o, "d", [A1.br, [250, 560], A1.loop, [460, 700], A1.srv], 1, C.coral);
      else if (k === 5) dot(o, "d", [[1438, 620], [1380, 720], [1500, 760], [1438, 690]], 1, C.coral);
      else o.d = { type: "dot", path: [A1.br, A1.srv], pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      txtBox(o, "hosts", [40, 40, 430, 60], "/etc/hosts → 127.0.0.1 localhost", k === 3 ? 1 : 0, C.ink, { mono: true });
      mark(o, "wx", 945, 430, false, k === 4 ? 1 : 0); mark(o, "ok4", 760, 610, true, k === 4 ? 1 : 0);
      mark(o, "fx", 1438, 640, false, k === 5 ? 1 : 0); mark(o, "sx", 760, 610, false, k === 6 ? 1 : 0);
      if (k === 1) note(o, "n1", 980, 860, "공유기 · 인터넷으로 나가지 않는다", 1, C.coral);
      if (k === 5) note(o, "n5", 980, 860, "친구의 localhost = 친구 자신 · 거기엔 내 앱이 없다", 1, C.coral);
      return o;
    },
  });

  /* ── 5-B 주소의 네 조각과 문 찾기 (무대 p05_a02) ── */
  const DX5 = [376, 677, 987, 1296];
  const URL5 = ["http://localhost:8000/docs", "http://localhost:8000/docs", "http://localhost:8000/docs", "http://localhost:8000/docs", "http://localhost:8000/docs", "http://localhost:5173", "http://localhost:3000", "http://localhost:8000/notice.html"];
  IT.define({
    id: "a05_02", fig: "움직이는 그림 5-B", title: "주소의 네 조각과 문 찾기", sec: "5.4 주소의 네 조각", view: [W, H], rest: 7, blank: { k: -1 },
    steps: ["네 조각", "방식 http", "호스트 = 이 건물", "포트 = 문", "경로 = 진열대", "5173번 문", "빈 문 3000", "없는 경로 404"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p05_a02.jpg");
      const u = URL5[k];
      o.url = { type: "text", x: 836, y: 76, text: u, size: 32, weight: 700, font: "mono", anchor: "middle", fill: C.ink, op: on, z: 6 };
      lab(o, "bld", [720, 116, 232, 43], "localhost = 이 건물", k >= 2 ? 1 : 0, C.teal);
      [["3000", "#5D6470"], ["5173 · 화면", C.blue], ["8000 · API 서버", C.coral], ["5432 · DB", "#5D6470"]].forEach(([nm, col], i) => lab(o, "door" + i, [[244, 324, 222, 44], [574, 325, 210, 43], [889, 325, 210, 43], [1206, 324, 218, 44]][i], nm, k >= 3 ? 1 : 0, col, { lag: i * 0.1 }));
      lab(o, "shelf", [47, 502, 189, 52], "진열대 = 경로", k >= 4 ? 1 : 0, C.ink);
      const parts = k >= 5 ? [] : ["http", "localhost", "8000", "/docs"];
      ["방식", "호스트", "포트", "경로"].forEach((nm, i) => {
        const b = [[222, 822, 210, 44], [558, 822, 218, 42], [892, 822, 231, 42], [1239, 822, 218, 42]][i];
        lab(o, "dl" + i, b, nm + (k >= i + 1 && k < 5 ? "  " + parts[i] : ""), on, [C.coral, C.teal, C.blue, "#5D6470"][i]);
      });
      const tgt = k === 3 || k === 4 || k === 7 ? 2 : k === 5 ? 1 : k === 6 ? 0 : -1;
      [0, 1, 2, 3].forEach((i) => hl(o, "dh" + i, [DX5[i] - 155, 250, 310, 400], tgt === i, t));
      txtBox(o, "docs", [820, 560, 330, 60], "API 문서(Swagger)", k === 4 ? 1 : 0, C.coral);
      txtBox(o, "scr", [520, 560, 310, 60], "ETF 화면", k === 5 ? 1 : 0, C.blue);
      txtBox(o, "none", [210, 560, 330, 60], "아무도 없음 · 연결 실패", k === 6 ? 1 : 0, "#CF3F33");
      txtBox(o, "nf", [820, 560, 330, 60], "404 · 그런 경로 없음", k === 7 ? 1 : 0, "#CF3F33");
      return o;
    },
  });

  /* ── 5-C 한 문에 두 프로그램 (무대 p05_a03) ── */
  const T1 = [520, 108, 290, 110], T2 = [888, 108, 312, 110];
  IT.define({
    id: "a05_03", fig: "움직이는 그림 5-C", title: "한 문에 두 프로그램", sec: "5.6 포트 충돌", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["서버 A가 8000에", "서버 B가 막힘", "Address already in use", "lsof로 주인 찾기", "B를 8001로", "A를 끄고 B를 8000에", "Vite는 5174로"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p05_a03.jpg");
      const vite = k === 6;
      lab(o, "tl", [735, 37, 204, 45], "터미널 1 · 터미널 2", on, C.ink);
      lab(o, "d1", [416, 242, 202, 45], vite ? "5173 · 다른 프로그램" : "8000번 문", on, C.teal);
      lab(o, "d2", [731, 264, 201, 44], vite ? "5174 · Vite" : "8001번 문", on, C.coral);
      lab(o, "d3", [1014, 279, 202, 44], vite ? "5175" : "8002번 문", on, "#5D6470");
      lab(o, "a", [434, 691, 201, 45], k === 5 ? "서버 A · 꺼짐" : vite ? "먼저 온 프로그램" : "서버 A", on, k === 5 ? "#CF3F33" : C.teal);
      lab(o, "b", [46, 817, 202, 45], vite ? "Vite" : "서버 B", k >= 1 ? 1 : 0, C.coral);
      lab(o, "g", [1385, 800, 233, 46], "lsof (관리인)", k === 3 ? 1 : 0, C.blue);
      lab(o, "bd", [1356, 326, 209, 45], "명부", k === 3 ? 1 : 0, C.blue);
      const t1 = vite ? "" : k === 5 ? "^C  서버 A 종료" : "Uvicorn running on :8000";
      const t2 = vite ? "Port 5173 is in use, trying another one…" : k === 1 ? "$ … 8000" : k >= 2 && k <= 3 ? "Address already in use" : k === 4 ? "running on :8001" : k === 5 ? "running on :8000" : "";
      o.t1 = { type: "text", x: T1[0] + 14, y: T1[1] + 64, text: t1, size: 17, weight: 600, font: "mono", fill: "#9ED39B", op: on, z: 6 };
      o.t2 = { type: "text", x: T2[0] + 14, y: T2[1] + 64, text: t2, size: vite ? 13 : 17, weight: 600, font: "mono", fill: k >= 2 && k <= 3 ? "#FF8A7A" : "#9ED39B", op: on, z: 6 };
      o.no = { type: "text", x: 518, y: 760, text: "⛔", size: 90, anchor: "middle", op: k === 1 || k === 2 ? 1 : 0, z: 8 };
      txtBox(o, "row", [1290, 420, 360, 44], "Python · 24931 · 127.0.0.1:8000 (LISTEN)", k === 3 ? 1 : 0, C.blue, { mono: true });
      route(o, "mv", [[150, 760], [836, 650]], k === 4, C.coral);
      route(o, "mv2", [[150, 760], [518, 640]], k === 5, C.teal);
      route(o, "mv3", [[150, 760], [836, 650]], vite, C.coral, "10 8");
      if (k === 4) note(o, "n4", 600, 880, "주소도 localhost:8001 로 바뀐다", 1, C.coral);
      if (vite) note(o, "n6", 520, 880, "편하지만 주소가 바뀐 것을 놓치기 쉽다", 1, C.coral);
      return o;
    },
  });

  /* ── 5-D 누가 이 문까지 올 수 있나 (무대 p05_a04) ── */
  const P4 = { srv: [719, 413], br: [1137, 471], ph: [300, 380], rt: [761, 170], st: [1538, 220], fw: [836, 760] };
  IT.define({
    id: "a05_04", fig: "움직이는 그림 5-D", title: "누가 이 문까지 올 수 있나", sec: "5.7 127.0.0.1 vs 0.0.0.0", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["127.0.0.1에 묶기", "같은 노트북 ✓", "휴대전화 ✗", "0.0.0.0에 묶기", "방화벽", "바깥 인터넷", "안전하다는 뜻은 아님"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p05_a04.jpg");
      const all = k >= 3;
      lab(o, "srv", [654, 301, 137, 40], all ? "0.0.0.0:8000" : "127.0.0.1:8000", on, all ? C.coral : C.teal);
      lab(o, "in", [814, 298, 111, 39], "안쪽 문", on, C.teal); lab(o, "out", [948, 298, 97, 39], all ? "열림" : "닫힘", on, all ? C.coral : "#5D6470");
      lab(o, "br", [1107, 319, 155, 40], "같은 노트북", on, C.blue); lab(o, "ph", [213, 184, 155, 42], "휴대전화", on, C.blue);
      lab(o, "rt", [685, 53, 154, 41], "공유기", on, C.ink); lab(o, "st", [1473, 82, 153, 41], "낯선 컴퓨터", k >= 5 ? 1 : 0, "#CF3F33");
      lab(o, "fw", [906, 631, 160, 41], k === 4 ? (Math.floor(t * 0.8) % 2 ? "방화벽 허용" : "방화벽 막음") : "방화벽", on, C.coral);
      route(o, "rb", [P4.br, P4.srv], k >= 1, C.teal);
      route(o, "rp", [P4.ph, [500, 600], P4.fw, P4.srv], k === 2 || k >= 3, k === 2 ? "#CF3F33" : C.teal, k === 2 ? "10 10" : "");
      route(o, "rs", [P4.st, [1250, 120], P4.rt], k >= 5, "#CF3F33", "10 10");
      mark(o, "mb", 1137, 400, true, k >= 1 ? 1 : 0);
      mark(o, "mp", 300, 300, k >= 3 && !(k === 4 && Math.floor(t * 0.8) % 2 === 0), k >= 2 ? 1 : 0);
      mark(o, "ms", 761, 110, false, k >= 5 ? 1 : 0);
      o.warn = { type: "rect", x: 600, y: 360, w: 260, h: 140, rx: 20, fill: "#CF3F33", op: k === 6 ? 0.25 + 0.15 * Math.sin(t * 4) : 0, z: 4 };
      if (k === 5) note(o, "n5", 520, 880, "0.0.0.0 이 곧 전 세계 공개는 아니다", 1, C.ink);
      if (k === 6) note(o, "n6", 420, 880, "같은 네트워크의 누구나 이 서버가 보여 주는 것을 볼 수 있다", 1, "alert");
      return o;
    },
  });

  IT.define({
    id: "e05", fig: "다음 시간", title: "Part1-6 서버 vs 클라이언트", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part1-6", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "서버 vs 클라이언트", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "문을 두드리는 쪽과 문 안에서 답하는 쪽", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/etf-portfolio-lab", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
