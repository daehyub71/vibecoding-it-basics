/* 6장 움직이는 그림 — 혼합 판(2026-10-23): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 문 번호 · 터미널 글자를 얹는다. 예제 저장소 = yt-trend-radar.
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
    p06_01: [[58, 112, 241, 76], [338, 95, 227, 75], [664, 92, 235, 78], [1341, 92, 263, 77], [707, 708, 254, 77]],
    p06_02: [[458, 124, 198, 70], [819, 125, 189, 61], [1400, 98, 181, 69], [36, 188, 170, 66], [217, 195, 180, 67], [1029, 201, 177, 67]],
    p06_03: [[252, 88, 236, 70], [602, 137, 246, 81], [984, 115, 226, 70], [1352, 114, 241, 77], [1059, 758, 278, 80]],
    p06_04: [[315, 48, 277, 69], [1091, 49, 270, 68], [448, 242, 280, 60], [1167, 224, 266, 58]],
    p06_05: [[287, 109, 177, 67], [581, 109, 189, 67], [1216, 127, 168, 66], [1437, 130, 191, 76]],
    p06_06: [[121, 81, 299, 74], [1419, 70, 227, 68], [731, 124, 267, 67], [1055, 135, 242, 70]],
    p06_07: [[734, 162, 246, 60], [1281, 193, 310, 60], [288, 234, 236, 58]],
  };
  figAnim("p06_01", "그림 6-1", "키오스크와 주방으로 이해하는 서버·클라이언트", "6.1 분식집 비유", "p06_01.jpg",
    bx(D.p06_01, [[1, "손님 = 클라이언트", C.coral], [2, "주문 화면", C.blue], [3, "요청(주문서)", C.teal], [4, "주방 = 서버", C.coral], [5, "응답(음식)", C.blue]]),
    [{ tag: "손님이 주문", show: [1, 2], hl: [0, 60, 560, 760] }, { tag: "주문서 → 주방", show: [3, 4], hl: [560, 40, 1112, 700] }, { tag: "음식이 돌아온다", show: [5], hl: [380, 560, 760, 300] }]);
  figAnim("p06_02", "그림 6-2", "한 가게도 다음 관계에서는 손님이 된다", "6.3 역할은 관계로", "p06_02.jpg",
    bx(D.p06_02, [[4, "손님", C.coral], [5, "첫 번째 관계", C.teal], [1, "손님에겐 서버", C.coral], [2, "도매상에겐 손님", C.blue], [6, "두 번째 관계", C.teal], [3, "도매상", C.blue]]),
    [{ tag: "손님 앞에서는 주방", show: [1, 2, 3], hl: [0, 80, 1000, 700] }, { tag: "도매상 앞에서는 손님", show: [4, 5, 6], hl: [980, 60, 692, 760] }, { tag: "서버도 클라이언트가 된다", show: [], note: [420, 860, "서버 프로그램도 다른 서버에 요청하면 그 관계에선 클라이언트", C.coral] }]);
  figAnim("p06_03", "그림 6-3", "같은 노트북 안에서도 역할은 둘", "6.4 한 기기 두 역할", "p06_03.jpg",
    bx(D.p06_03, [[1, "요리하는 나", C.blue], [2, "먹는 나", C.coral], [3, "브라우저 = 손님", C.teal], [4, "연습 서버 = 주방", C.blue], [5, "기기는 한 대", C.blue]]),
    [{ tag: "요리사이면서 손님", show: [1, 2], hl: [0, 60, 830, 840] }, { tag: "노트북 안의 두 프로그램", show: [3, 4], hl: [830, 60, 842, 840] }, { tag: "기기는 한 대, 역할은 둘", show: [5] }]);
  figAnim("p06_04", "그림 6-4", "“품절입니다”라고 답하는 가게와 문이 닫힌 가게", "6.6 응답 vs 연결 실패", "p06_04.jpg",
    bx(D.p06_04, [[1, "답은 왔다(404·500)", C.teal], [3, "“없습니다”", C.coral], [2, "답이 없다(연결 실패)", C.blue], [4, "아무도 없음", C.blue]]),
    [{ tag: "품절이라고 답한다", show: [1, 2], hl: [0, 20, 840, 900] }, { tag: "셔터가 내려져 있다", show: [3, 4], hl: [840, 20, 832, 900] }, { tag: "답이 왔나, 아예 없나", show: [], note: [380, 860, "서버가 꺼져 있으면 상태 코드도 없이 ‘연결할 수 없음’", C.coral] }]);
  figAnim("p06_05", "그림 6-5", "주문이 쌓이는 주방", "6.7 과부하", "p06_05.jpg",
    bx(D.p06_05, [[1, "쌓이는 요청", C.coral], [2, "처리 능력의 한계", C.blue], [3, "서버를 늘리기", C.teal], [4, "잠시 기억(캐시)", C.blue]]),
    [{ tag: "손님 백 명", show: [], hl: [0, 220, 830, 700] }, { tag: "주문서가 쌓인다", show: [1, 2], hl: [230, 160, 600, 400] }, { tag: "과부하와 대응", show: [3, 4], hl: [900, 100, 772, 820] }]);
  figAnim("p06_06", "그림 6-6", "숨긴 단추와 주방 창구의 확인", "6.8 검사는 서버에서", "p06_06.jpg",
    bx(D.p06_06, [[1, "화면에서 숨긴 단추", C.coral], [3, "직접 들어온 요청", C.teal], [4, "서버가 권한 확인", C.blue], [2, "비밀값은 서버에만", C.blue]]),
    [{ tag: "단추를 숨겼다", show: [1], hl: [0, 60, 640, 860] }, { tag: "창구로 직접", show: [2], hl: [640, 60, 400, 860] }, { tag: "주방이 권한을 확인", show: [3, 4], hl: [1040, 40, 632, 880] }]);
  figAnim("p06_07", "그림 6-7", "네트워크 기록을 함께 보며 AI와 원인을 좁히기", "6.10 바이브코딩 현장", "p06_07.jpg",
    bx(D.p06_07, [[3, "“저장되었습니다”만 떴다", C.coral], [1, "네트워크 기록", C.teal], [2, "다섯 구간 따라가기", C.blue]]),
    [{ tag: "어디서 끊겼나", show: [1], hl: [0, 120, 600, 700] }, { tag: "주소 · 메서드 · 상태 코드", show: [2], hl: [600, 120, 560, 700] }, { tag: "끊긴 정거장부터", show: [3], hl: [1160, 120, 512, 700] }]);

  /* ── 6-A 버튼 한 번의 여행 (무대 p06_a01) ── */
  const A1 = { btn: [253, 662], ph: [300, 420], srv: [853, 470], cache: [1333, 287], db: [1359, 575] };
  IT.define({
    id: "a06_01", fig: "움직이는 그림 6-A", title: "버튼 한 번의 여행", sec: "6.2 요청과 응답", view: [W, H], rest: 7, blank: { k: -1 },
    steps: ["단추를 누른다", "브라우저 → 서버", "캐시: 없음", "서버 → DB", "2시간 기억", "카드가 그려진다", "다시 오면 캐시", "서버가 꺼지면"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, off = k === 7; img(o, "p06_a01.jpg");
      lab(o, "ph", [174, 148, 271, 58], k >= 1 ? "브라우저 = 클라이언트" : "휴대전화 · 브라우저", on, C.blue);
      lab(o, "srv", [720, 142, 256, 57], off ? "서버 · 꺼짐" : k === 3 ? "서버 = DB의 손님" : "서버(백엔드)", on, off ? "#CF3F33" : C.coral);
      lab(o, "ca", [1499, 236, 161, 58], "캐시", on, C.teal); lab(o, "db", [1499, 529, 161, 58], "데이터베이스", on, C.ink);
      lab(o, "bt", [277, 682, 253, 58], "분야 · 형식 단추", on, C.coral);
      o.url = { type: "text", x: 300, y: 80, text: "GET /?category=food&format=short", size: 26, weight: 700, font: "mono", fill: C.coral, op: k >= 1 && k <= 6 ? 1 : 0, z: 6 };
      hl(o, "hb", [180, 620, 160, 90], k === 0, t);
      const go = [A1.ph, [560, 380], A1.srv];
      route(o, "req", go, k >= 1, off ? "#CF3F33" : C.coral, off ? "10 10" : "");
      route(o, "toc", [A1.srv, [1100, 300], A1.cache], k === 2 || k === 4 || k === 6, C.teal);
      route(o, "todb", [A1.srv, [1100, 560], A1.db], k === 3, C.ink);
      route(o, "res", [A1.srv, [560, 560], A1.ph], k === 5 || k === 6, C.blue);
      if (k === 1 || k === 7) dot(o, "d", go, 1, C.coral);
      else if (k === 2 || k === 6) dot(o, "d", [A1.srv, [1100, 300], A1.cache], 1, C.teal);
      else if (k === 3) dot(o, "d", [A1.srv, [1100, 560], A1.db], 1, C.ink);
      else if (k === 5) dot(o, "d", [A1.srv, [560, 560], A1.ph], 1, C.blue);
      else o.d = { type: "dot", path: go, pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      mark(o, "cx", 1333, 230, false, k === 2 ? 1 : 0); mark(o, "cok", 1333, 230, true, k === 6 ? 1 : 0); mark(o, "sx", 853, 400, false, off ? 1 : 0);
      txtBox(o, "keep", [1150, 360, 330, 54], "찾은 결과 2시간 기억", k === 4 ? 1 : 0, C.teal);
      ["급상승 1위 · 영상", "급상승 2위 · 영상", "급상승 3위 · 영상"].forEach((c, i) => txtBox(o, "card" + i, [160, 270 + i * 90, 200, 60], c, k >= 5 && !off ? 1 : 0, C.blue, { lag: i * 0.1 }));
      if (k === 6) note(o, "n6", 520, 870, "같은 요청이 다시 오면 기억해 둔 답으로 더 빨리", 1, C.teal);
      if (off) note(o, "n7", 520, 870, "받아 줄 곳이 없다 → 연결 실패", 1, "alert");
      return o;
    },
  });

  /* ── 6-B 요청의 사슬, 바뀌는 역할 (무대 p06_a02) ── */
  const B2 = { br: [296, 488], yt: [200, 166], srv: [714, 436], ca: [1045, 261], db: [1132, 575], api: [1480, 296], bot: [1463, 784], url: [383, 775] };
  const ROLE = (o, id, x, y, text, on, col) => chip(o, id, x, y, text, on, col, 20);
  IT.define({
    id: "a06_02", fig: "움직이는 그림 6-B", title: "요청의 사슬, 바뀌는 역할", sec: "6.5 요청의 사슬", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["프로그램 일곱", "브라우저 → 서버", "서버 → DB", "썸네일은 직접", "분야는 주소에", "수집기가 미리", "역할은 화살표마다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, all = k === 6; img(o, "p06_a02.jpg");
      lab(o, "yt", [224, 32, 232, 54], "유튜브 이미지 서버", on, C.coral); lab(o, "api", [1387, 81, 252, 55], "YouTube Data API", on, C.coral);
      lab(o, "ca", [929, 104, 252, 56], "캐시(2시간)", on, C.teal); lab(o, "srv", [586, 165, 253, 55], "Vercel의 서버", on, C.blue);
      lab(o, "br", [86, 300, 252, 55], "브라우저", on, C.blue); lab(o, "db", [1003, 390, 246, 54], "데이터베이스", on, C.ink);
      lab(o, "bot", [1374, 581, 244, 55], "수집기(GitHub Actions)", on, C.teal); lab(o, "url", [240, 661, 262, 54], "주소 뒤 ?category=", on, C.ink);
      const A = (id, a, b, show, col) => route(o, id, [a, b], show, col);
      A("r1", B2.br, B2.srv, k === 1 || all, C.blue); A("r2", B2.srv, B2.db, k === 2 || all, C.ink); A("r3", B2.br, B2.yt, k === 3 || all, C.coral);
      A("r4", B2.br, B2.url, k === 4 || all, C.ink); A("r5", B2.bot, B2.api, k === 5 || all, C.teal); A("r6", B2.bot, B2.db, k === 5 || all, C.teal);
      if (k === 1) dot(o, "d", [B2.br, B2.srv], 1, C.blue); else if (k === 2) dot(o, "d", [B2.srv, B2.db], 1, C.ink);
      else if (k === 3) dot(o, "d", [B2.br, B2.yt], 1, C.coral); else if (k === 4) dot(o, "d", [B2.br, B2.url], 1, C.ink);
      else if (k === 5) dot(o, "d", [B2.bot, B2.api], 1, C.teal); else o.d = { type: "dot", path: [B2.br, B2.srv], pid: "none", u: 0, r: 13, fill: C.blue, op: 0, z: 7 };
      ROLE(o, "c1", 420, 440, "클라이언트", k === 1 || all ? 1 : 0, C.blue); ROLE(o, "s1", 720, 360, "서버", k === 1 || all ? 1 : 0, C.coral);
      ROLE(o, "c2", 860, 560, "이번엔 클라이언트", k === 2 || all ? 1 : 0, C.ink); ROLE(o, "s2", 1180, 660, "서버", k === 2 || all ? 1 : 0, C.coral);
      ROLE(o, "c3", 380, 230, "직접 받으러", k === 3 ? 1 : 0, C.coral); ROLE(o, "c4", 600, 610, "서버로 안 감", k === 4 ? 1 : 0, C.ink);
      ROLE(o, "c5", 1300, 500, "미리 모아 둔다", k === 5 ? 1 : 0, C.teal);
      if (k === 0) note(o, "n0", 520, 870, "이 앱에도 생각보다 많은 프로그램이 요청을 주고받는다", 1, C.ink);
      if (k === 5) note(o, "n5", 470, 870, "사용자가 누를 때마다 YouTube를 부르지 않는다", 1, C.teal);
      if (all) note(o, "n6", 470, 870, "서버·클라이언트는 기계가 아니라 화살표마다 정해지는 역할", 1, C.coral);
      return o;
    },
  });

  /* ── 6-C ‘저장이 안 돼요’를 다섯 단계로 (무대 p06_a03) ── */
  const S3 = [[174, 470], [505, 436], [784, 453], [1132, 470], [1515, 453]];
  const T3 = [[45, 205, 294, 55], [391, 244, 234, 53], [692, 171, 252, 63], [1032, 241, 249, 54], [1366, 202, 261, 55]];
  const U3 = [[[63, 266, 114, 43], [181, 266, 140, 43]], [[393, 305, 105, 41], [503, 305, 117, 41]], [[703, 236, 105, 41], [813, 236, 119, 41]], [[1042, 304, 110, 41], [1157, 304, 118, 41]], [[1378, 264, 116, 41], [1499, 264, 119, 41]]];
  const N3 = ["① 클릭", "② 요청", "③ 응답", "④ 저장소", "⑤ 새로고침"], W3 = [["화면 코드", "콘솔"], ["Network", "주소·메서드"], ["상태 코드", "서버 로그"], ["DB 표", "행 확인"], ["다시 GET", "값 비교"]];
  IT.define({
    id: "a06_03", fig: "움직이는 그림 6-C", title: "‘저장이 안 돼요’를 다섯 단계로", sec: "6.9 다섯 정거장", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["눌렸나", "요청이 나갔나", "상태 코드", "저장소에 들어갔나", "다시 불러오나", "다섯 곳 모두 통과", "저장소를 건너뛰는 경우"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, skip = k === 6; img(o, "p06_a03.jpg");
      N3.forEach((nm, i) => {
        const lit = skip ? i === 0 || i === 4 : k >= i;
        lab(o, "t" + i, T3[i], skip && i === 3 ? "④ 건너뜀" : nm, on, skip && i === 3 ? "#5D6470" : lit ? C.coral : C.ink);
        U3[i].forEach((b, j) => lab(o, "u" + i + j, b, skip && i === 3 ? "" : W3[i][j], !skip && k >= i ? 1 : 0, C.teal, { lag: j * 0.1 }));
        mark(o, "m" + i, S3[i][0], S3[i][1] - 30, true, (!skip && k >= i && k <= 5) || (skip && (i === 0 || i === 4)) ? 1 : 0);
      });
      const path = skip ? [S3[0], [383, 775], [1254, 760], S3[4]] : S3.slice(0, Math.min(k, 4) + 1);
      route(o, "p", path.length > 1 ? path : [S3[0], S3[0]], path.length > 1 || skip, skip ? C.ink : C.coral, skip ? "10 10" : "");
      if (k >= 1 && k <= 4) dot(o, "d", [S3[k - 1], S3[k]], 1, C.coral); else o.d = { type: "dot", path: [S3[0], S3[1]], pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      txtBox(o, "st", [700, 560, 230, 54], "201 Created", k === 2 ? 1 : 0, "#2D7A4E", { mono: true });
      if (k === 5) note(o, "n5", 560, 870, "다섯 정거장을 모두 지나야 정말로 저장된 것", 1, C.coral);
      if (skip) note(o, "n6", 420, 870, "분야 선택처럼 주소·브라우저 안에만 남으면 저장소는 건너뛴다", 1, C.ink);
      return o;
    },
  });

  /* ── 6-D Part 1의 모든 개념을 잇는 지도 (무대 p06_a04) ── */
  const P4 = { lap: [209, 523], rt: [488, 488], cl: [731, 261], dns: [993, 453], gate: [1271, 366], srv: [1515, 244], loop: [1393, 732] };
  const R4 = [P4.lap, P4.rt, P4.cl, P4.dns, P4.gate, P4.srv];
  IT.define({
    id: "a06_04", fig: "움직이는 그림 6-D", title: "Part 1의 모든 개념을 잇는 지도", sec: "6.11 Part 1 정리", view: [W, H], rest: 7, blank: { k: -1 },
    steps: ["1장 본체와 브라우저", "3장 네트워크 · 인터넷 · 웹", "4장 DNS", "5장 포트 443", "6장 요청과 응답", "2장 파일과 경로", "주소 한 줄에 여섯 장", "localhost 지름길"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, lo = k === 7; img(o, "p06_a04.jpg");
      lab(o, "url", [523, 25, 626, 70], lo ? "http://localhost:3000" : "https://yt-trend-radar-blond.vercel.app/", on, C.ink);
      lab(o, "lap", [52, 286, 206, 52], "1장 하드웨어·SW", on, k === 0 ? C.coral : C.ink);
      lab(o, "rt", [357, 269, 214, 52], "3장 집 네트워크", k >= 1 ? 1 : 0, k === 1 ? C.coral : C.ink);
      lab(o, "cl", [631, 127, 205, 52], "3장 인터넷 · 웹", k >= 1 ? 1 : 0, k === 1 ? C.coral : C.ink);
      lab(o, "dns", [912, 266, 207, 52], "4장 DNS", k >= 2 ? 1 : 0, k === 2 ? C.coral : C.ink);
      lab(o, "gate", [1179, 176, 179, 52], "5장 443번 문", k >= 3 ? 1 : 0, k === 3 ? C.coral : C.ink);
      lab(o, "srv", [1427, 70, 203, 52], k >= 5 ? "6장 서버 · 2장 경로" : "6장 서버", k >= 4 ? 1 : 0, k === 4 || k === 5 ? C.coral : C.ink);
      lab(o, "loop", [1288, 585, 243, 47], "localhost 지름길", lo ? 1 : 0, C.teal);
      const n = Math.min(R4.length, [1, 3, 4, 5, 6, 6, 6, 1][k]);
      route(o, "go", R4.slice(0, Math.max(2, n)), k >= 1 && !lo, C.coral);
      route(o, "back", [P4.srv, [1100, 640], [600, 700], P4.lap], (k === 4 || k === 5 || k === 6), C.blue, "12 8");
      if (k >= 1 && k <= 3) dot(o, "d", R4.slice(0, n), 1, C.coral);
      else if (k === 4) dot(o, "d", [P4.srv, [1100, 640], [600, 700], P4.lap], 1, C.blue);
      else if (lo) dot(o, "d", [[1300, 700], [1393, 660], [1500, 730], [1393, 800], [1300, 700]], 1, C.teal);
      else o.d = { type: "dot", path: R4, pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      txtBox(o, "ip", [880, 520, 260, 50], "→ 203.0.113.10 (예)", k === 2 ? 1 : 0, C.ink, { mono: true });
      txtBox(o, "path", [1330, 420, 320, 50], "/ → index 파일", k === 5 ? 1 : 0, C.ink, { mono: true });
      if (k === 6) note(o, "n6", 520, 870, "주소 한 줄에 Part 1의 여섯 장이 모두 들어 있다", 1, C.coral);
      if (lo) note(o, "n7", 420, 870, "인터넷도 DNS도 거치지 않지만 문 · 요청 · 응답은 그대로", 1, C.teal);
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
    id: "e06", fig: "다음 시간", title: "Part2-1 프론트엔드 vs 백엔드", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part2-1", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "프론트엔드 vs 백엔드", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "손님 쪽 화면과 주방 쪽 규칙 · 데이터", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/yt-trend-radar", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
