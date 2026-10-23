/* 8장 움직이는 그림 — 혼합 판(2026-10-23): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨 · 신호 · 문 번호 · 터미널 글자를 얹는다. 예제 저장소 = seoul-subway-insight.
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

  /* 그림 7장 — 상자 좌표는 it_label_fill detect 결과(1672×941), p08_05 의 3번은 손으로 찾은 좌표 */
  const D = {
    p08_01: [[700, 162, 224, 63], [210, 212, 188, 57], [1440, 450, 206, 60], [805, 696, 210, 60]],
    p08_02: [[37, 100, 217, 66], [1458, 90, 192, 60], [62, 745, 266, 61], [1391, 716, 219, 64], [730, 837, 226, 54]],
    p08_03: [[1217, 76, 264, 83], [194, 97, 277, 88], [735, 735, 300, 84]],
    p08_04: [[550, 44, 187, 77], [935, 44, 187, 77], [1295, 72, 291, 75], [223, 278, 232, 69]],
    p08_05: [[288, 61, 274, 84], [1313, 53, 270, 88], [336, 692, 268, 98]],
    p08_06: [[72, 59, 266, 70], [1273, 59, 327, 70], [705, 109, 327, 87], [76, 468, 266, 67], [1281, 470, 324, 67]],
    p08_07: [[775, 76, 231, 58], [1266, 53, 345, 64], [353, 256, 213, 63], [1056, 369, 174, 64], [802, 755, 233, 64]],
  };
  figAnim("p08_01", "그림 8-1", "주문서는 가고 영수증은 돌아온다", "8.1 주문서와 영수증", "p08_01.jpg",
    bx(D.p08_01, [[2, "주문서", C.coral], [1, "요청(주문서)", C.coral], [4, "응답(영수증)", C.teal], [3, "준비 완료", C.blue]]),
    [{ tag: "요청", show: [1, 2], hl: [0, 60, 600, 820] }, { tag: "응답", show: [3], hl: [600, 60, 500, 820] }, { tag: "준비 완료", show: [4], hl: [1100, 60, 572, 820] }]);
  figAnim("p08_02", "그림 8-2", "카페 직원의 다섯 가지 대답", "8.4 상태 코드", "p08_02.jpg",
    bx(D.p08_02, [[1, "1xx 잠시만요", C.coral], [2, "2xx 성공", C.teal], [4, "3xx 저쪽으로", C.blue], [3, "4xx 주문서 확인", C.blue], [5, "5xx 주방에 문제", C.coral]]),
    [{ tag: "다섯 가지 대답", show: [], hl: [560, 120, 560, 520] }, { tag: "1xx · 2xx · 3xx", show: [1, 2, 3] }, { tag: "4xx · 5xx", show: [4, 5] }]);
  figAnim("p08_03", "그림 8-3", "주문은 들어갔는데 영수증이 나오지 않았다", "8.6 기다림과 타임아웃", "p08_03.jpg",
    bx(D.p08_03, [[2, "응답을 못 받았다", C.coral], [3, "처리됨 · 응답 끊김", C.blue], [1, "다시 누르면 두 번?", C.teal]]),
    [{ tag: "영수증이 안 나왔다", show: [1], hl: [0, 60, 520, 840] }, { tag: "주방은 이미", show: [2], hl: [520, 60, 600, 840] }, { tag: "다시 보내도 될까", show: [3], hl: [1120, 60, 552, 840] }]);
  figAnim("p08_04", "그림 8-4", "이사한 가게 문에 붙은 안내문", "8.8 리다이렉트", "p08_04.jpg",
    bx(D.p08_04, [[4, "301 이사했습니다", C.coral], [3, "새 주소(Location)", C.blue], [1, "첫 번째 요청", C.coral], [2, "두 번째 요청", C.teal]]),
    [{ tag: "옛 매장의 안내문", show: [1], hl: [0, 60, 760, 840] }, { tag: "새 매장으로", show: [2], hl: [760, 60, 912, 840] }, { tag: "리다이렉트", show: [3, 4], hl: [440, 20, 760, 220] }]);
  figAnim("p08_05", "그림 8-5", "아침에 구워 둔 빵과 주문받고 굽는 빵", "8.9 캐시", "p08_05.jpg",
    bx(D.p08_05, [[1, "캐시: 미리 만든 답장", C.blue], [2, "서버까지 가서 새로", C.coral], [3, "오래된 답장일 수도", C.teal]]),
    [{ tag: "바로 vs 기다림", show: [2], hl: [800, 20, 872, 640] }, { tag: "캐시", show: [1], hl: [0, 20, 800, 640] }, { tag: "빠르고 가볍게", show: [3] }]);
  figAnim("p08_06", "그림 8-6", "마지막 한 자리를 함께 누른 두 사람", "8.11 같은 버튼, 다른 응답", "p08_06.jpg",
    bx(D.p08_06, [[1, "사람 A", C.coral], [4, "사람 B", C.teal], [3, "먼저 도착한 요청부터", C.blue], [2, "201 신청 완료", C.coral], [5, "409 이미 마감", C.teal]]),
    [{ tag: "거의 동시에", show: [1, 2, 3], hl: [0, 20, 1180, 900] }, { tag: "201", show: [4], hl: [1220, 20, 452, 440] }, { tag: "409 · 업무상 거절", show: [5], hl: [1220, 440, 452, 480] }]);
  figAnim("p08_07", "그림 8-7", "통화 기록을 들고 AI와 함께 보기", "8.12 AI에게 말하기", "p08_07.jpg",
    bx(D.p08_07, [[3, "Network 탭", C.blue], [1, "요청 주소", C.blue], [4, "상태", C.coral], [5, "응답 본문", C.teal], [2, "추측 말고 기록에서", C.blue]]),
    [{ tag: "기록을 들고", show: [1, 2, 3, 4], hl: [0, 60, 1140, 860] }, { tag: "기록에서 출발", show: [5], hl: [1140, 20, 532, 900] }, { tag: "실패의 약속까지", show: [], note: [420, 880, "성공뿐 아니라 실패했을 때의 응답도 함께 설계해 달라고", C.coral] }]);

  /* ── 8-A 두 메시지의 안쪽 (무대 p08_a01) ── */
  const P1 = { lap: [274, 470], up: [836, 287], dn: [836, 666], srv: [1424, 418] };
  const REQ8 = ["GET /data/snapshot.json", "Accept: */* … (헤더)", "본문 없음"], RES8 = ["200 OK", "content-type: application/json", "{ 역 528곳 · 순위 … }"];
  IT.define({
    id: "a08_01", fig: "움직이는 그림 8-A", title: "두 메시지의 안쪽", sec: "8.3 URL과 메서드", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["요청 한 통", "첫 줄: 메서드 · 주소", "헤더 · 본문 없음", "서버가 처리", "응답 첫 줄: 200", "헤더 · 본문(JSON)", "화면이 그린다"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p08_a01.jpg");
      lab(o, "rq", [737, 71, 213, 48], "요청", on, C.coral); lab(o, "rs", [737, 472, 213, 48], "응답", k >= 4 ? 1 : 0, C.teal);
      [[978, 166, 140, 46], [982, 224, 133, 40], [982, 278, 133, 45]].forEach((b, i) => lab(o, "ql" + i, b, ["첫 줄", "헤더", "본문"][i], k >= [1, 2, 2][i] ? 1 : 0, C.coral));
      [[979, 567, 139, 46], [982, 624, 133, 40], [982, 679, 133, 42]].forEach((b, i) => lab(o, "sl" + i, b, ["첫 줄", "헤더", "본문"][i], k >= [4, 5, 5][i] ? 1 : 0, C.teal));
      REQ8.forEach((x, i) => txtBox(o, "q" + i, [60, 70 + i * 62, 560, 52], x, k >= [1, 2, 2][i] ? 1 : 0, C.coral, { mono: true }));
      RES8.forEach((x, i) => txtBox(o, "r" + i, [60, 700 + i * 62, 560, 52], x, k >= [4, 5, 5][i] ? 1 : 0, C.teal, { mono: true }));
      const go = [P1.lap, [560, 300], P1.up, [1150, 300], P1.srv], back = [P1.srv, [1150, 660], P1.dn, [560, 660], P1.lap];
      if (k === 0) dot(o, "d", [P1.lap, [560, 300], P1.up], 1, C.coral);
      else if (k === 3) dot(o, "d", go, 1, C.coral);
      else if (k === 4 || k === 6) dot(o, "d", k === 6 ? back : back.slice(0, 3), 1, C.teal);
      else o.d = { type: "dot", path: go, pid: "none", u: 0, r: 13, fill: C.coral, op: 0, z: 7 };
      hl(o, "srv", [1300, 220, 300, 420], k === 3, t);
      if (k === 3) note(o, "n3", 900, 870, "미리 만들어 둔 파일을 찾아 내준다", 1, C.ink);
      if (k === 6) note(o, "n6", 760, 870, "화면은 본문을 읽어 지도와 순위를 그린다", 1, C.teal);
      return o;
    },
  });

  /* ── 8-B 상태 코드 고르기 (무대 p08_a02) ── */
  const SLOT8 = [[408, 544, 145, 58], [580, 544, 146, 58], [754, 544, 150, 58], [934, 544, 147, 58], [1111, 544, 149, 58]];
  const CASE8 = [["", "", -1, ""], ["개요 데이터 GET", "200", 1, "JSON 데이터"], ["같은 주소에 POST", "405", 3, "(본문 없음)"], ["없는 파일", "404", 3, "안내 페이지(HTML)"],
    ["없는 배포 주소", "404", 3, "다른 모양의 404"], ["http:// 로 접속", "308", 2, "Location: https://…"], ["서버가 처리 실패 · 꺼짐", "5xx · 숫자 없음", 4, "연결 실패는 숫자도 없다"]];
  IT.define({
    id: "a08_02", fig: "움직이는 그림 8-B", title: "상태 코드 고르기", sec: "8.4 상태 코드", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["다섯 가족", "200 성공", "405 메서드", "404 안내 페이지", "모양이 다른 404", "308 저쪽으로", "5xx · 연결 실패"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0, c = CASE8[k]; img(o, "p08_a02.jpg");
      ["1xx", "2xx", "3xx", "4xx", "5xx"].forEach((nm, i) => lab(o, "s" + i, SLOT8[i], nm, on, [C.ink, "#2D7A4E", C.blue, C.coral, "#CF3F33"][i], { lag: i * 0.08 }));
      lab(o, "hd", [127, 319, 267, 71], "상황 카드", on, C.ink); lab(o, "pp", [1345, 374, 267, 71], "응답 본문", on, C.teal);
      SLOT8.forEach((b, i) => hl(o, "h" + i, [b[0] - 12, b[1] - 12, b[2] + 24, 140], c[2] === i, t));
      txtBox(o, "case", [40, 470, 380, 60], c[0], k >= 1 ? 1 : 0, C.ink);
      txtBox(o, "code", [860, 230, 260, 90], c[1], k >= 1 ? 1 : 0, c[2] === 1 ? "#2D7A4E" : c[2] === 2 ? C.blue : "#CF3F33", { max: 46, mono: true });
      txtBox(o, "body", [1300, 470, 340, 60], c[3], k >= 1 ? 1 : 0, C.teal);
      if (k === 4) note(o, "n4", 520, 880, "같은 숫자라도 어디서 왔는지 함께 본다", 1, C.coral);
      if (k === 6) note(o, "n6", 470, 880, "서버가 꺼져 있으면 숫자 없이 연결 자체가 실패", 1, "alert");
      return o;
    },
  });

  /* ── 8-C 캐시는 미리 만든 답장 (무대 p08_a03) ── */
  const P3 = { lap: [235, 418], wh: [836, 366], srv: [1424, 340] };
  const SHELF8 = [[748, 425, 182, 60], [749, 503, 181, 60], [748, 580, 182, 58]];
  IT.define({
    id: "a08_03", fig: "움직이는 그림 8-C", title: "캐시는 미리 만든 답장", sec: "8.9 캐시", view: [W, H], rest: 5, blank: { k: -1 },
    steps: ["첫 요청 · 한 부 보관", "같은 요청은 중간에서", "x-vercel-cache: HIT", "옛 답장이 보일 때", "ETag → 304", "이름에 지문 · 1년"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p08_a03.jpg");
      lab(o, "wh", [683, 90, 306, 69], "중간 서버(캐시)", on, C.teal); lab(o, "srv", [1307, 114, 286, 69], k === 3 ? "서버 · 데이터 바뀜" : "서버(원본)", on, k === 3 ? "#CF3F33" : C.coral);
      lab(o, "br", [87, 190, 299, 69], "브라우저", on, C.blue);
      lab(o, "r1", [445, 317, 193, 66], k === 4 ? "바뀌었나요?" : "요청 · 응답", on, C.coral); lab(o, "r2", [1049, 336, 194, 66], k === 1 || k === 2 ? "가지 않음" : "요청 · 응답", on, k === 1 || k === 2 ? "#5D6470" : C.teal);
      lab(o, "sh0", SHELF8[0], k === 3 ? "옛 사본" : "snapshot 사본", k >= 0 ? 1 : 0, k === 3 ? "#CF3F33" : C.teal);
      const full = [P3.lap, [540, 390], P3.wh, [1130, 360], P3.srv, [1130, 360], P3.wh, [540, 390], P3.lap], half = [P3.lap, [540, 390], P3.wh, [540, 390], P3.lap];
      route(o, "a", [P3.lap, [540, 390], P3.wh], 1, C.coral); route(o, "b", [P3.wh, [1130, 360], P3.srv], k === 0 || k === 4, C.coral, k === 4 ? "10 8" : "");
      if (k === 0) dot(o, "d", full, 1, C.coral); else if (k === 1 || k === 3 || k === 4) dot(o, "d", half, 1, k === 3 ? "#CF3F33" : C.teal);
      else o.d = { type: "dot", path: half, pid: "none", u: 0, r: 13, fill: C.teal, op: 0, z: 7 };
      txtBox(o, "hdr", [60, 700, 620, 56], "x-vercel-cache: HIT · age: 120 (예)", k === 2 ? 1 : 0, C.teal, { mono: true });
      txtBox(o, "et1", [60, 700, 620, 56], "If-None-Match: \"a1b2c3\" (예)", k === 4 ? 1 : 0, C.coral, { mono: true });
      txtBox(o, "et2", [60, 770, 620, 56], "304 Not Modified · 본문 없음", k === 4 ? 1 : 0, "#2D7A4E", { mono: true });
      txtBox(o, "fp", [60, 700, 760, 56], "app-3f9a2c.js (예) · max-age=31536000", k === 5 ? 1 : 0, C.ink, { mono: true });
      if (k === 1) note(o, "n1", 900, 870, "중간 서버에서 바로 돌아온다", 1, C.teal);
      if (k === 3) note(o, "n3", 860, 870, "잠시 옛 데이터가 보일 수 있다", 1, "alert");
      if (k === 5) note(o, "n5", 860, 870, "내용이 바뀌면 이름이 바뀐다 → 1년 다시 묻지 않음", 1, C.ink);
      return o;
    },
  });

  /* ── 8-D Network 탭 읽기 (무대 p08_a04) ── */
  const ROW8 = [190, 228, 266, 304, 342];
  IT.define({
    id: "a08_04", fig: "움직이는 그림 8-D", title: "Network 탭 읽기", sec: "8.10 Network 탭", view: [W, H], rest: 6, blank: { k: -1 },
    steps: ["이미 받은 줄들", "trend.json 새 줄", "Headers", "Payload", "Response", "favicon 404", "실패는 화면에도"].map((tag, i) => ({ tag, set: { k: i }, dur: 1.4 })),
    layout(s, t) {
      const o = {}, k = Math.max(0, s.k), on = s.k >= 0 ? 1 : 0; img(o, "p08_a04.jpg");
      lab(o, "nt", [1020, 80, 230, 61], "Network 탭", on, C.blue);
      lab(o, "url", [372, 127, 431, 27], "seoul-subway-insight", on, C.ink);
      const rows = [["snapshot.json", "200", C.ink], ["index.html", "200", C.ink], ["app.js", "200", C.ink], ["trend.json", "200", C.coral], ["favicon.ico", "404", "#CF3F33"]];
      rows.forEach(([nm, st, col], i) => txtBox(o, "row" + i, [860, ROW8[i] - 18, 315, 34], nm + "   " + st, (i < 3 || (i === 3 && k >= 1) || (i === 4 && k >= 5)) ? 1 : 0, col, { mono: true }));
      lab(o, "new", [1187, 192, 280, 59], k >= 5 ? "붉은 줄 = 고장?" : "새 줄: trend.json", k >= 1 ? 1 : 0, k >= 5 ? "#CF3F33" : C.coral);
      ["Headers", "Payload", "Response"].forEach((nm, i) => { const b = [[853, 465, 153, 57], [1042, 464, 153, 58], [1232, 465, 152, 57]][i]; lab(o, "tab" + i, b, nm, on, C.ink); hl(o, "ht" + i, [b[0] - 8, b[1] - 8, b[2] + 16, b[3] + 16], k === i + 2, t); });
      const det = k === 2 ? "GET · 200 · /data/trend.json" : k === 3 ? "보낸 값 없음(주소 뒤 조건 없음)" : k === 4 ? "{ \"s\": …, \"l\": …, \"t\": … }" : "";
      lab(o, "det", [1233, 640, 280, 59], "상세", on, C.ink);
      txtBox(o, "dt", [860, 720, 560, 56], det, det ? 1 : 0, C.ink, { mono: true });
      txtBox(o, "fail", [380, 400, 420, 70], "불러오지 못했습니다 (404)", k === 6 ? 1 : 0, "#CF3F33");
      if (k === 5) note(o, "n5", 520, 880, "탭 아이콘 404 — 화면에는 아무 문제 없음", 1, C.ink);
      if (k === 6) note(o, "n6", 440, 880, "데이터가 실패하면 안내와 상태 코드를 보여 준다 · 가짜 목록으로 덮지 않음", 1, "alert");
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
    id: "e08", fig: "다음 시간", title: "Part2-3 GET vs POST", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part2-3", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "GET vs POST", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "묻는 요청과 바꾸는 요청, 그리고 HTTPS", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/seoul-subway-insight", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

})();
