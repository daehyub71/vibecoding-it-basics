/* 1장 움직이는 그림 — 혼합 판(2026-10-19): 제미나이 무대 그림(빈 라벨 상자) 위에 라벨·강조·신호를 얹는다.
   좌표는 무대 그림(1672×941) 기준. 상자 좌표는 제작도구/it_label_fill.py detect 결과. */
(function () {
  const W = 1672, H = 941, L = IT.lerp, poly = IT.poly, plen = IT.plen;
  const C = { coral: "#B53A24", teal: "#03807F", blue: "#1B66C9", ink: "#1F3A5F" };

  /* 빈 상자에 라벨 얹기: [x,y,w,h] */
  function lab(o, id, b, text, on, color, opt) {
    const [x, y, w, h] = b, n = [...String(text)].length;
    const size = Math.min(h * 0.46, (w - 26) / Math.max(1, n * 0.98));
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


  /* ── 그림 7장: 말하는 순간 그 자리 라벨이 뜨고 강조된다 ── */
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
  figAnim("p01_01", "그림 1-1", "같은 휴대전화가 다른 일을 하는 이유", "1.1 같은 휴대전화", "p01_01.jpg",
    { 1: [535, 54, 206, 71, "카메라", C.coral], 2: [1439, 104, 209, 70, "카메라 앱 · 사진 찍기", C.coral], 3: [603, 184, 207, 70, "CPU · 계산", C.teal], 4: [642, 331, 173, 70, "배터리", C.blue], 5: [1439, 446, 209, 71, "지도 앱 · 길 찾기", C.teal], 6: [1439, 681, 209, 70, "메신저 앱 · 대화", C.blue], 7: [357, 808, 252, 67, "화면", C.blue] },
    [{ tag: "꺼진 전화", hl: [20, 150, 420, 680] }, { tag: "본체 속 부품", show: [1, 3, 4, 7], hl: [220, 40, 650, 860] }, { tag: "세 가지 일", show: [2, 5, 6], hl: [900, 30, 760, 870] }, { tag: "바뀐 것은 프로그램", note: [940, 20, "바뀐 것은 프로그램", C.teal] }]);
  figAnim("p01_02", "그림 1-2", "빵집의 장비와 작업 절차", "1.2 본체와 일하는 방법", "p01_02.jpg",
    { 1: [47, 58, 237, 61, "오븐", C.coral], 2: [356, 90, 241, 60, "반죽기", C.teal], 3: [716, 117, 219, 49, "작업 절차(레시피)", C.blue], 4: [44, 790, 247, 60, "진열장", C.blue], 5: [392, 786, 215, 60, "계산대", C.coral] },
    [{ tag: "장비", show: [1, 2, 4, 5], hl: [10, 40, 650, 860] }, { tag: "작업 절차", show: [3], hl: [640, 90, 370, 640] }, { tag: "한 팀", hl: [990, 30, 670, 870] }]);
  figAnim("p01_03", "그림 1-3", "일하는 사람, 펼친 책상, 서류 보관함", "1.3 CPU·메모리·저장장치", "p01_03.jpg",
    { 1: [443, 39, 224, 52, "일하는 사람", C.coral], 2: [1102, 40, 224, 51, "서류 보관함", C.blue], 3: [366, 797, 238, 65, "CPU", C.coral], 4: [762, 797, 231, 65, "메모리 · 펼친 책상", C.teal], 5: [1180, 797, 231, 66, "저장장치(SSD)", C.blue] },
    [{ tag: "숫자 셋", show: [3, 4, 5], hl: [10, 470, 1652, 460] }, { tag: "사무실 비유", show: [1, 2], hl: [10, 20, 1652, 450] }, { tag: "좁은 책상", hl: [380, 100, 700, 330], note: [1080, 520, "책상(메모리)이 좁으면 느려진다", C.teal] }]);
  figAnim("p01_04", "그림 1-4", "화상회의에서 카메라가 안 나올 때", "1.4 소프트웨어의 층", "p01_04.jpg",
    { 1: [1405, 62, 235, 66, "앱 설정", C.coral], 2: [293, 92, 385, 83, "카메라가 안 나와요", C.coral], 3: [1404, 340, 236, 69, "운영체제 권한", C.teal], 4: [1394, 799, 243, 67, "장치 · 드라이버", C.blue] },
    [{ tag: "세 층", show: [1, 3, 4], hl: [930, 40, 730, 850] }, { tag: "증상", show: [2], hl: [20, 40, 910, 850] }, { tag: "앱·운영체제·장치", hl: [930, 300, 730, 590] }, { tag: "원인은 여러 층", note: [300, 830, "증상은 하나, 원인은 여러 층", "alert"] }]);
  figAnim("p01_05", "그림 1-5", "아파트 관리사무소와 운영체제", "1.6 운영체제는 왜 필요할까", "p01_05.jpg",
    { 1: [68, 66, 199, 71, "아파트 = 컴퓨터", C.coral], 2: [823, 63, 222, 70, "엘리베이터", C.coral], 3: [1116, 99, 217, 67, "보일러", C.teal], 4: [1411, 97, 221, 68, "전기 배전반", C.blue], 5: [640, 408, 206, 66, "운영체제 · 관리사무소", C.teal], 6: [311, 818, 283, 71, "앱 · 주민", C.coral] },
    [{ tag: "관리사무소", show: [1, 5], hl: [600, 380, 430, 380] }, { tag: "설비는 직접 못 만짐", show: [6, 2, 3, 4], hl: [790, 20, 870, 760], note: [80, 300, "주민은 설비를 직접 만지지 않는다", "alert"] }, { tag: "운영체제 = 관리자", hl: [600, 380, 430, 380], note: [1050, 820, "운영체제 = 관리자", C.teal] }]);
  figAnim("p01_06", "그림 1-6", "AI에게 내 컴퓨터를 먼저 소개하기", "1.7 바이브코딩 장면", "p01_06.jpg",
    { 1: [661, 45, 350, 75, "AI가 내 환경에 맞춰 답한다", C.blue], 2: [1296, 63, 256, 69, "맥용 안내", C.coral], 3: [1296, 476, 256, 68, "윈도우용 안내", C.blue], 4: [303, 563, 194, 61, "운영체제", C.coral], 5: [321, 643, 195, 60, "칩", C.teal], 6: [354, 723, 180, 60, "메모리", C.blue] },
    [{ tag: "AI의 설치 안내", show: [1], hl: [560, 30, 640, 880] }, { tag: "실행 환경", show: [2, 3], hl: [1270, 30, 400, 880] }, { tag: "내 컴퓨터 소개", show: [4, 5, 6], hl: [150, 520, 420, 340] }]);
  figAnim("p01_07", "그림 1-7", "배달 주문과 우리 집 부엌", "1.9 사양 읽기", "p01_07.jpg",
    { 1: [31, 42, 395, 63, "AI 서비스 쓰기 = 배달 주문", C.coral], 2: [682, 71, 263, 58, "서비스 제공자의 컴퓨터", C.blue], 3: [1254, 42, 384, 63, "모델 직접 돌리기 = 집에서 요리", C.coral], 4: [236, 341, 225, 51, "질문만 보낸다", C.teal] },
    [{ tag: "사양표" }, { tag: "배달 주문", show: [1, 2, 4], hl: [10, 30, 1020, 880] }, { tag: "집에서 요리", show: [3], hl: [1030, 30, 630, 880] }]);

  /* ── 엔드카드: 다음 시간 + 구독·좋아요·알림 설정·댓글 (말하는 순간 차례로 켜짐) ── */
  IT.define({
    id: "e01", fig: "다음 시간", title: "Part1-2 파일 · 폴더 · 경로의 정체", sec: "다음 장", view: [W, H], rest: 5, blank: { k: -1 },
    steps: [{ tag: "다음 시간", set: { k: 0 } }, { tag: "구독", set: { k: 1 }, dur: 0.6 }, { tag: "좋아요", set: { k: 2 }, dur: 0.6 }, { tag: "알림 설정", set: { k: 3 }, dur: 0.6 }, { tag: "댓글", set: { k: 4 }, dur: 0.6 }, { tag: "감사합니다", set: { k: 5 } }],
    layout(s, t) {
      const o = {}, k = s.k;
      o.card = { type: "rect", x: 240, y: 40, w: 1190, h: 300, rx: 30, fill: "#FFFFFF", stroke: "sw", sw: 4, op: k >= 0 ? 1 : 0, z: 1, from: { y: 80 } };
      o.ck = { type: "text", x: 300, y: 115, text: "다음 시간 · Part1-2", size: 36, weight: 700, fill: "sw", op: k >= 0 ? 1 : 0, z: 2 };
      o.ct = { type: "text", x: 300, y: 205, text: "파일 · 폴더 · 경로의 정체", size: 74, weight: 700, fill: "fg", op: k >= 0 ? 1 : 0, z: 2, from: { x: 340 } };
      o.cs = { type: "text", x: 300, y: 280, text: "AI가 말하는 파일 주소를 읽는 법", size: 34, fill: "muted", op: k >= 0 ? 1 : 0, z: 2 };
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
      o.repo = { type: "text", x: 836, y: 752, text: "예제 저장소  github.com/daehyub71/seoul-location-services-app", size: 30, weight: 700, anchor: "middle", fill: "muted", op: k >= 0 ? 1 : 0, z: 3 };
      o.chn = { type: "text", x: 836, y: 820, text: "백발개발자의 바이브코딩 · @50VibeLog", size: 46, weight: 700, anchor: "middle", fill: "sw", op: k >= 5 ? 1 : 0, z: 3, from: { sc: 0.7 } };
      return o;
    },
  });

  /* ── 1-A 두 세계의 경계 (무대 p01_a1) ── */
  const A1 = { app: [1353, 132, 278, 75], os: [1353, 314, 278, 76], scr: [45, 449, 263, 69], cam: [1354, 478, 277, 68], cpu: [103, 604, 263, 67], mem: [1353, 616, 278, 68], spk: [1353, 756, 278, 77] };
  IT.define({
    id: "a01_01", fig: "움직이는 그림 1-A", title: "두 세계의 경계", sec: "1.2 본체와 일하는 방법", view: [W, H], rest: 6,
    blank: { on: 0, hw: 0, app: 0, os: 0, req: 0, cam: 0, osname: "macOS" },
    steps: [
      { tag: "하드웨어", say: "아래층은 손으로 만질 수 있는 부품, 하드웨어입니다. 화면, CPU, 메모리, 카메라, 스피커가 있습니다.", set: { on: 1, hw: 1 }, dur: 1.6 },
      { tag: "앱", say: "위층은 우리가 누르는 앱, 소프트웨어입니다.", set: { app: 1 } },
      { tag: "운영체제", say: "그 사이에 운영체제가 있습니다. 윈도우, macOS, 안드로이드 같은 이름들입니다.", set: { os: 1 } },
      { tag: "부탁", say: "지도 앱이 화면에 목록을 그리고 싶으면 운영체제에게 부탁합니다.", set: { req: 1 }, dur: 1.4 },
      { tag: "화면", say: "운영체제가 화면 장치를 움직이고, 목록이 나타납니다.", set: { req: 2 }, dur: 1.4 },
      { tag: "권한", say: "카메라를 쓸 때도 앱은 운영체제의 허락을 거칩니다.", set: { req: 0, cam: 1 }, dur: 1.4 },
      { tag: "맥용·윈도우용", say: "그래서 같은 앱도 윈도우용과 맥용이 따로 나옵니다. 부탁하는 상대가 다르기 때문입니다.", set: { cam: 0, osname: "Windows" }, dur: 1.2 },
    ],
    layout(s, t) {
      const o = {}; img(o, "p01_a1.jpg"); veil(o, !s.on);
      const hw = s.on && s.hw ? 1 : 0;
      lab(o, "scr", A1.scr, "화면", hw, C.blue, { lag: 0 }); lab(o, "cpu", A1.cpu, "CPU", hw, C.teal, { lag: 0.1 });
      lab(o, "cam", A1.cam, "카메라", hw, C.coral, { lag: 0.2 }); lab(o, "mem", A1.mem, "메모리", hw, C.blue, { lag: 0.3 }); lab(o, "spk", A1.spk, "스피커", hw, C.coral, { lag: 0.4 });
      o["hwb"] = { type: "rect", x: 48, y: 800, w: 300, h: 72, rx: 16, fill: "#FFFFFF", stroke: "#1F3A5F", sw: 4, op: hw, z: 3 };
      o["hwt"] = { type: "text", x: 198, y: 848, text: "하드웨어", size: 34, weight: 700, anchor: "middle", fill: C.ink, op: hw, z: 4 };
      lab(o, "app", A1.app, s.osname === "Windows" ? "앱 · 윈도우용" : "앱 · 맥용", s.on && s.app ? 1 : 0, C.coral);
      lab(o, "os", A1.os, "운영체제", s.on && s.os ? 1 : 0, C.teal);
      o.osc = { type: "rect", x: 390, y: 300, w: 190, h: 56, rx: 28, fill: "#FFFFFF", stroke: "sw", sw: 3, op: s.on && s.os ? 1 : 0, z: 4 };
      o.osct = { type: "text", x: 485, y: 338, text: s.osname, size: 28, weight: 700, anchor: "middle", fill: C.teal, op: s.on && s.os ? 1 : 0, z: 5 };
      hl(o, "hw", [370, 395, 900, 510], s.on && s.hw && !s.app, t);
      hl(o, "app", [375, 55, 935, 215], s.on && s.app && !s.os, t);
      hl(o, "os", [345, 232, 980, 240], s.on && s.os && !s.req && !s.cam && s.osname !== "Windows", t);
      /* 부탁 쪽지: 지도 → 유리판 → 화면 */
      const r1 = [[548, 175], [600, 345]], r2 = [[600, 345], [470, 470]];
      if (s.req === 1) { o.d = { type: "dot", path: r1, pid: "r1", u: 1, r: 16, fill: "hot", stroke: "#FFFFFF", sw: 5, z: 6, from: { u: 0 } }; note(o, "q", 650, 175, "“목록을 그려 줘”", 1); }
      if (s.req === 2) { o.d = { type: "dot", path: r2, pid: "r2", u: 1, r: 16, fill: "hot", stroke: "#FFFFFF", sw: 5, z: 6, from: { u: 0 } }; hl(o, "scr2", [365, 392, 535, 170], 1, t); note(o, "q2", 520, 590, "화면에 목록이 뜬다", 1, C.blue); }
      o.tr1 = { type: "path", d: poly(r1), len: plen(r1), draw: 1, stroke: "hot", sw: 7, fill: "none", op: s.req >= 1 ? 0.7 : 0, z: 5, from: { draw: 0 } };
      o.tr2 = { type: "path", d: poly(r2), len: plen(r2), draw: 1, stroke: "hot", sw: 7, fill: "none", op: s.req >= 2 ? 0.7 : 0, z: 5, from: { draw: 0 } };
      /* 카메라: 바로 가면 × , 유리판을 거치면 ✓ */
      const cam = s.cam ? 1 : 0, bad = [[830, 200], [1050, 500]], good = [[830, 200], [930, 345], [1050, 500]];
      o.bad = { type: "path", d: poly(bad), stroke: "alert", sw: 6, dash: "12 10", fill: "none", op: cam * 0.8, z: 5 };
      o.badx = { type: "text", x: 965, y: 372, text: "×", size: 70, weight: 700, anchor: "middle", fill: "alert", op: cam, z: 6 };
      o.good = { type: "path", d: poly(good), len: plen(good), draw: 1, stroke: "sw", sw: 7, fill: "none", mark: "sw", op: cam, z: 5, from: { draw: 0 } };
      o.ok = { type: "circle", cx: 930, cy: 345, r: 26, fill: "sw", op: cam, z: 6, from: { r: 6 } };
      o.okm = { type: "path", d: "M917,345 l9,9 l17,-18", stroke: "#FFFFFF", sw: 5, fill: "none", op: cam, z: 7 };
      if (cam) note(o, "c", 1020, 250, "운영체제의 허락", 1, C.teal);
      return o;
    },
    sandbox: {
      init: { app: "map", osname: "macOS" },
      derive(s) { return Object.assign({}, s, { on: 1, hw: 1, app: 1, os: 1, req: s.app === "map" ? 2 : 0, cam: s.app === "cam" ? 1 : 0 }); },
      controls: [
        { id: "map", label: "지도 앱 → 화면", act(s) { s.app = "map"; return s; } },
        { id: "cam", label: "카메라 앱 → 카메라", act(s) { s.app = "cam"; return s; } },
        { id: "os", label: (s) => (s.osname === "macOS" ? "운영체제를 Windows로" : "운영체제를 macOS로"), act(s) { s.osname = s.osname === "macOS" ? "Windows" : "macOS"; return s; } },
      ],
      status(s) { return `<p>${s.app === "cam" ? "카메라 앱이 카메라를 바로 만지려 하면 막히고, 운영체제의 허락을 거쳐야 이어집니다." : "지도 앱의 부탁이 운영체제를 거쳐 화면 장치까지 내려갑니다."} 지금 운영체제는 <b>${s.osname}</b>입니다.</p>`; },
    },
  });

  /* ── 1-B 컴퓨터 속 세 장소 (무대 p01_a2) ── */
  const RAM = [[645, 314, 40, 73], [695, 314, 38, 73], [743, 314, 38, 73], [792, 314, 37, 73], [840, 314, 38, 73], [889, 314, 38, 73], [937, 314, 38, 73], [985, 314, 39, 73],
               [641, 471, 41, 78], [692, 472, 39, 77], [742, 471, 38, 78], [791, 471, 39, 78], [841, 471, 38, 78], [890, 471, 39, 78], [940, 471, 39, 78], [989, 471, 40, 78]];
  const B2 = { ram: [616, 148, 436, 87], cpu: [1220, 148, 346, 87], ssd: [110, 151, 333, 85] };
  const FILES = [["map", "지도 앱", 92, 330], ["doc", "문서", 290, 330], ["photo", "사진", 92, 455], ["movie", "영화", 290, 455]];
  const SCR = [104, 725, 1461, 125];
  IT.define({
    id: "a01_02", fig: "움직이는 그림 1-B", title: "컴퓨터 속 세 장소", sec: "1.3 CPU·메모리·저장장치", view: [W, H], rest: 3,
    blank: { on: 0, files: 0, focus: null, map: 0, cpu: "idle", screen: "off", doc: 0, edited: 0, saved: 0, power: 1, tabs: 0, movie: 1, flow: null, note: null },
    steps: [
      { tag: "세 장소", say: "컴퓨터 안에는 성격이 다른 세 장소가 있습니다. 저장장치, 메모리, 그리고 CPU입니다.", set: { on: 1 }, dur: 1.4 },
      { tag: "보관", say: "저장장치는 프로그램과 문서를 오래 보관합니다. 전원이 꺼져도 그대로 남습니다.", set: { files: 1, focus: "ssd" } },
      { tag: "실행", say: "지도 앱을 실행하면, 저장장치에 있던 프로그램이 메모리로 올라옵니다.", set: { map: 1, focus: "ram", flow: "load" }, dur: 1.5 },
      { tag: "처리", say: "CPU는 메모리에 펼쳐진 명령을 하나씩 가져와 처리하고, 그 결과가 화면에 나타납니다.", set: { cpu: "run", screen: "map", focus: "cpu", flow: null } },
      { tag: "고치기", say: "문서를 열어 고치는 동안, 바뀐 내용은 아직 메모리에만 있습니다.", set: { doc: 1, edited: 1, screen: "doc", focus: "ram" }, dur: 1.3 },
      { tag: "저장", say: "저장 단추를 눌러야, 그 내용이 저장장치에 기록됩니다.", set: { edited: 0, saved: 1, focus: "ssd", flow: "save" }, dur: 1.5 },
      { tag: "전원 끔", say: "전원을 끄면 메모리는 깨끗이 비워지지만, 저장장치의 파일은 그대로 남아 있습니다.", set: { power: 0, map: 0, doc: 0, cpu: "idle", screen: "off", flow: null, focus: "ram" }, dur: 1.3 },
      { tag: "탭 수십 개", say: "다시 켜서 브라우저 탭을 수십 개 열면 메모리가 가득 찹니다. 그러면 운영체제가 내용을 저장장치로 옮겼다가 다시 가져오느라, 컴퓨터가 느려집니다.", set: { power: 1, map: 1, tabs: 20, cpu: "wait", screen: "tabs", flow: "swap", focus: "ram" }, dur: 1.6 },
      { tag: "파일 삭제", say: "이때 영화 파일을 삭제해서 저장장치를 비워도, 가득 찬 메모리는 그대로입니다. 느린 원인이 있는 장소가 다르기 때문입니다.", set: { movie: 0, focus: "ssd", note: "ram-full" }, dur: 1.3 },
    ],
    layout(s, t) {
      const o = {}; img(o, "p01_a2.jpg"); veil(o, !s.on); const Z = s.on ? 1 : 0, pw = s.power ? 1 : 0;
      lab(o, "ssd", B2.ssd, "저장장치 SSD", Z, C.coral, { lag: 0 }); lab(o, "ram", B2.ram, "메모리 RAM · 펼친 책상", Z, C.teal, { lag: 0.15 }); lab(o, "cpu", B2.cpu, "CPU · 일하는 사람", Z, C.blue, { lag: 0.3 });
      hl(o, "ssd", [70, 300, 440, 290], Z && s.focus === "ssd", t); hl(o, "ram", [610, 290, 450, 300], Z && s.focus === "ram", t); hl(o, "cpu", [1150, 330, 260, 260], Z && s.focus === "cpu", t);
      /* 저장장치 위 파일 */
      for (const [id, label, x, y] of FILES) {
        const on = Z && s.files && (id !== "movie" || s.movie) ? 1 : 0;
        o["f-" + id] = { type: "rect", x, y, w: 185, h: 105, rx: 16, fill: "#FFFFFF", stroke: "#2FA39E", sw: 4, op: on * 0.96, z: 3, from: { y: y + 20 }, to: id === "movie" ? { sc: 0.4, op: 0 } : undefined };
        o["ft-" + id] = { type: "text", x: x + 92, y: y + 64, text: label, size: 30, weight: 700, anchor: "middle", fill: C.teal, op: on, z: 4, from: { y: y + 84 } };
      }
      const sv = Z && s.files && s.saved ? 1 : 0;
      o.ok = { type: "circle", cx: 466, cy: 336, r: 20, fill: "sw", op: sv, z: 5, from: { r: 4 } }; o.okm = { type: "path", d: "M456,336 l7,7 l13,-14", stroke: "#FFFFFF", sw: 4, fill: "none", op: sv, z: 6 };
      /* 메모리 칸 */
      const mapOn = Z && pw && s.map ? 1 : 0, docOn = Z && pw && s.doc ? 1 : 0;
      const used = []; if (mapOn) used.push("map", "map", "map", "map"); if (docOn) used.push("doc", "doc");
      const tabsN = Z && pw ? s.tabs || 0 : 0; const total = used.length + tabsN, over = Math.max(0, total - 16);
      for (let i = 0; i < Math.min(tabsN, 16 - used.length); i++) used.push("tab");
      RAM.forEach((c, i) => {
        const k = used[i]; const [x, y, w, h] = c;
        if (!k) return;
        const fill = k === "map" ? "#2FA39E" : k === "doc" ? "#3B82E0" : over ? "#E8705C" : "#9ED3CF";
        o["c" + i] = { type: "rect", x, y, w, h, rx: 6, fill, op: 0.95, z: 3, from: k === "map" ? { x: 120 + (i % 2) * 60, y: 345, op: 0 } : k === "doc" ? { x: 320, y: 345, op: 0 } : { y: y - 50, op: 0 }, lag: k === "tab" ? Math.min(0.6, (i - 4) * 0.04) : 0 };
      });
      o.mapt = { type: "text", x: 742, y: 300, text: "지도 앱", size: 26, weight: 700, anchor: "middle", fill: C.teal, op: mapOn, z: 4 };
      o.doct = { type: "text", x: 869, y: 300, text: s.edited ? "문서 · 고침" : "문서", size: 26, weight: 700, anchor: "middle", fill: s.edited ? "#B53A24" : C.blue, op: docOn, z: 4 };
      const full = Z && over > 0 ? 1 : 0;
      o.full = { type: "rect", x: 615, y: 295, w: 440, h: 290, rx: 18, fill: "alert", op: 0.16 * full, z: 2 };
      o.cnt = { type: "rect", x: 640, y: 596, w: 400, h: 50, rx: 25, fill: "#FFFFFF", stroke: full ? "alert" : "sw", sw: 3, op: Z, z: 4 };
      o.cntt = { type: "text", x: 840, y: 630, text: s.note === "ram-full" ? "저장장치를 비워도 메모리는 그대로" : full ? `가득 참 · 넘친 탭 ${over}개는 저장장치로` : `메모리 ${Math.min(16, total)}/16칸 사용`, size: 23, weight: 700, anchor: "middle", fill: full ? "alert" : "sw", op: Z, z: 5 };
      /* CPU */
      const run = Z && pw && s.cpu === "run", wait = Z && pw && s.cpu === "wait", ph = Math.sin(t * 5.2);
      o.ring = { type: "circle", cx: 1270, cy: 462, r: 125 + 10 * ph, fill: "none", stroke: "hot", sw: 6, op: run ? 0.6 + 0.3 * ph : wait ? 0.25 : 0, z: 3 };
      o.cst = { type: "rect", x: 1180, y: 596, w: 190, h: 50, rx: 25, fill: "#FFFFFF", stroke: wait ? "alert" : "hw", sw: 3, op: Z, z: 4 };
      o.cstt = { type: "text", x: 1275, y: 630, text: run ? "처리 중" : wait ? "기다리는 중" : "쉬는 중", size: 24, weight: 700, anchor: "middle", fill: wait ? "alert" : C.ink, op: Z, z: 5 };
      for (let i = 0; i < 3; i++) { const u = (t * (wait ? 0.12 : 0.6) + i / 3) % 1; o["ins" + i] = { type: "rect", x: L(1040, 1165, u), y: L(395, 450, u), w: 20, h: 20, rx: 5, fill: "sw", op: (run || wait) && mapOn ? Math.sin(Math.PI * u) : 0, z: 5 }; }
      /* 화면(아래 검은 띠) */
      const scr = !Z || !pw ? "off" : s.screen; const [sx, sy, sw_, sh] = SCR;
      o.sOn = { type: "rect", x: sx + 6, y: sy + 6, w: sw_ - 12, h: sh - 12, rx: 8, fill: "#FFFFFF", op: scr !== "off" ? 1 : 0, z: 2 };
      o.sm1 = { type: "path", d: `M${sx + 200},${sy + 95} C${sx + 500},${sy + 20} ${sx + 800},${sy + 110} ${sx + 1250},${sy + 35}`, stroke: "#9ED3CF", sw: 14, fill: "none", op: scr === "map" ? 1 : 0, z: 3 };
      o.sm2 = { type: "circle", cx: sx + 820, cy: sy + 62, r: 16, fill: "hot", op: scr === "map" ? 1 : 0, z: 3 };
      for (let i = 0; i < 3; i++) o["sd" + i] = { type: "rect", x: sx + 160, y: sy + 26 + i * 26, w: i === 2 ? 600 : 1100, h: 12, rx: 6, fill: "#B7C3D0", op: scr === "doc" ? 1 : 0, z: 3 };
      for (let i = 0; i < 12; i++) o["st" + i] = { type: "rect", x: sx + 40 + i * 116, y: sy + 22, w: 104, h: 26, rx: 6, fill: "#E3F2F0", stroke: "sw", sw: 2, op: scr === "tabs" ? 1 : 0, z: 3 };
      o.spin = { type: "circle", cx: sx + sw_ / 2, cy: sy + 86, r: 18, fill: "none", stroke: "alert", sw: 6, dash: "56 60", off: -t * 140, op: scr === "tabs" ? 1 : 0, z: 4 };
      o.sl = { type: "text", x: sx + 70, y: sy + sh - 20, text: scr === "off" ? "화면 꺼짐" : "", size: 22, weight: 600, fill: "#8A98A8", op: Z && scr === "off" ? 1 : 0, z: 3 };
      o.pw = { type: "circle", cx: 70, cy: 686, r: 30, fill: "none", stroke: pw ? "sw" : "alert", sw: 6, op: Z, z: 4 };
      o.pwt = { type: "text", x: 112, y: 694, text: pw ? "전원 켜짐" : "전원 꺼짐", size: 24, weight: 700, fill: pw ? "sw" : "alert", op: Z, z: 4 };
      /* 흐름 화살표 */
      const fl = Z ? s.flow : null, fop = s.flowOp == null ? 1 : s.flowOp;
      const load = [[185, 330], [300, 262], [560, 262], [700, 312]], save = [[869, 312], [600, 262], [400, 262], [380, 330]];
      o.fl = { type: "path", d: poly(load), len: plen(load), draw: 1, stroke: "sw", sw: 8, fill: "none", mark: "sw", op: fl === "load" ? fop : 0, z: 5, from: { draw: 0 } };
      o.fs = { type: "path", d: poly(save), len: plen(save), draw: 1, stroke: "hw", sw: 8, fill: "none", mark: "hw", op: fl === "save" ? fop : 0, z: 5, from: { draw: 0 } };
      const sw = fl === "swap" ? 1 : 0;
      o.sw1 = { type: "path", d: "M700,300 C620,250 470,250 400,318", stroke: "alert", sw: 6, dash: "14 10", off: -t * 40, fill: "none", mark: "alert", op: sw, z: 5 };
      o.sw2 = { type: "path", d: "M330,318 C420,232 640,232 740,300", stroke: "alert", sw: 6, dash: "14 10", off: -t * 40, fill: "none", mark: "alert", op: sw, z: 5 };
      return o;
    },
    sandbox: {
      init: { power: 1, map: 1, doc: 0, edited: 0, saved: 0, tabs: 0, movie: 1, lost: 0, flowAt: -99, flowKind: null },
      derive(s, now) {
        const base = (s.power && s.map ? 4 : 0) + (s.power && s.doc ? 2 : 0); const total = base + (s.power ? s.tabs : 0); const over = Math.max(0, total - 16);
        const busy = s.power && (s.map || s.doc || s.tabs); const age = now - (s.flowAt || -99); const recent = age < 2.4 ? s.flowKind : null;
        return Object.assign({}, s, { on: 1, files: 1, focus: null, note: over && !s.movie ? "ram-full" : null, cpu: !busy ? "idle" : over ? "wait" : "run",
          screen: !s.power ? "off" : s.tabs ? "tabs" : s.doc ? "doc" : s.map ? "map" : "idle", flow: recent || (over ? "swap" : null),
          flowOp: recent ? IT.clamp(1 - (age - 1.8) / 0.6, 0, 1) : 1, over, total });
      },
      controls: [
        { id: "run", label: (s) => (s.map ? "지도 앱 닫기" : "지도 앱 실행"), act(s, now) { s.map = s.map ? 0 : 1; if (s.map) { s.flowKind = "load"; s.flowAt = now; } s.lost = 0; return s; }, off: (s) => !s.power },
        { id: "edit", label: "문서 열고 고치기", act(s) { s.doc = 1; s.edited = 1; s.lost = 0; return s; }, off: (s) => !s.power || (s.doc && s.edited) },
        { id: "save", label: "저장", act(s, now) { s.edited = 0; s.saved = 1; s.flowKind = "save"; s.flowAt = now; return s; }, off: (s) => !s.power || !s.edited },
        { id: "tabs", label: "탭 6개 열기", act(s) { s.tabs += 6; return s; }, off: (s) => !s.power || s.tabs >= 24 },
        { id: "close", label: "탭 모두 닫기", act(s) { s.tabs = 0; return s; }, off: (s) => !s.tabs },
        { id: "movie", label: (s) => (s.movie ? "영화 파일 삭제" : "영화 파일 되살리기"), act(s) { s.movie = s.movie ? 0 : 1; return s; } },
        { id: "power", label: (s) => (s.power ? "전원 끄기" : "전원 켜기"), act(s) { if (s.power) { s.lost = s.doc && s.edited ? 1 : 0; s.power = 0; s.map = 0; s.doc = 0; s.edited = 0; s.tabs = 0; } else { s.power = 1; s.lost = 0; } return s; } },
      ],
      status(s) {
        const cpu = s.cpu === "run" ? "처리 중" : s.cpu === "wait" ? "기다리는 중" : "쉬는 중";
        let h = `<p>메모리 <b>${Math.min(16, s.total)}/16칸</b>${s.over ? ` · <span class="warn">넘침 ${s.over}칸</span>` : ""} · CPU <b>${cpu}</b></p>`;
        if (s.lost) h += `<p class="warn">저장하지 않은 고친 내용이 사라졌습니다. 전원을 끄기 전에 저장을 눌러 보세요.</p>`;
        else if (s.over && !s.movie) h += `<p class="warn">영화 파일을 지워도 메모리는 그대로입니다. 탭을 닫아야 빨라집니다.</p>`;
        else if (s.over) h += `<p class="warn">메모리가 가득 차서 느려졌습니다. 영화 파일을 지우면 빨라질까요?</p>`;
        else if (s.edited) h += `<p>고친 내용은 아직 메모리에만 있습니다. 저장을 누르면 저장장치에 기록됩니다.</p>`;
        else h += `<p>앱을 실행하고, 문서를 고치고, 탭을 열어 보세요.</p>`;
        return h;
      },
    },
  });

  /* ── 1-C 설치에서 실행까지 (무대 p01_a3) ── */
  const B3 = { cloud: [385, 88, 232, 66], laptop: [983, 230, 235, 61], table: [1395, 233, 229, 61], apps: [476, 335, 250, 60], dl: [108, 786, 229, 61] };
  const TBL = [1350, 395, 300, 230]; const SCR3 = [900, 370, 425, 290];
  IT.define({
    id: "a01_03", fig: "움직이는 그림 1-C", title: "설치에서 실행까지", sec: "1.5 설치와 실행", view: [W, H], rest: 4,
    blank: { on: 0, box: 0, inst: 0, run1: 0, run2: 0, why: 0, focus: null },
    steps: [
      { tag: "내려받기", say: "먼저 설치 파일을 내려받습니다. 아직은 상자 하나일 뿐입니다.", set: { on: 1, box: 1, focus: "dl" }, dur: 1.6 },
      { tag: "설치", say: "설치는 상자를 풀어 필요한 파일을 제자리에 놓는 일입니다.", set: { inst: 1, focus: "apps" }, dur: 1.6 },
      { tag: "아직 안 일함", say: "설치가 끝나도 프로그램은 아직 일하지 않습니다. 실행 목록은 비어 있습니다.", set: { focus: "table" } },
      { tag: "실행", say: "아이콘을 누르면 운영체제가 프로그램을 메모리에 올리고, 프로세스가 하나 생깁니다.", set: { run1: 1, focus: "laptop" }, dur: 1.4 },
      { tag: "하나 더", say: "실행할 때마다 운영체제는 프로세스를 만들고 자원을 나눠 줍니다.", set: { run2: 1, focus: "table" } },
      { tag: "닫기", say: "앱을 닫으면 프로세스는 사라지지만, 설치된 파일은 그대로 남습니다.", set: { run1: 0, focus: "apps" }, dur: 1.3 },
      { tag: "세 가지 고장", say: "설치, 실행, 빈 화면은 서로 다른 단계의 문제입니다.", set: { why: 1, focus: null }, dur: 1.4 },
    ],
    layout(s, t) {
      const o = {}; img(o, "p01_a3.jpg"); veil(o, !s.on); const Z = s.on ? 1 : 0;
      lab(o, "cloud", B3.cloud, "인터넷", Z, C.coral); lab(o, "dl", B3.dl, "다운로드 폴더", Z && s.box ? 1 : 0, C.teal);
      lab(o, "apps", B3.apps, "응용 프로그램 폴더", Z && s.inst ? 1 : 0, C.blue); lab(o, "laptop", B3.laptop, "화면", Z && s.inst ? 1 : 0, C.teal);
      lab(o, "table", B3.table, "실행 중인 프로그램", Z && s.inst ? 1 : 0, C.blue);
      hl(o, "dl", [100, 500, 300, 250], Z && s.focus === "dl", t); hl(o, "apps", [420, 430, 480, 250], Z && s.focus === "apps", t);
      hl(o, "table", [1335, 345, 330, 300], Z && s.focus === "table", t); hl(o, "laptop", [880, 350, 465, 330], Z && s.focus === "laptop", t);
      /* 설치 파일 상자 */
      o.pkg = { type: "rect", x: 205, y: 560, w: 120, h: 92, rx: 12, fill: "#C9A46A", stroke: "#8A6A3A", sw: 4, op: Z && s.box && !s.inst ? 1 : 0, z: 4, from: { y: 300 } };
      o.pkgt = { type: "text", x: 265, y: 616, text: "설치 파일", size: 22, weight: 700, anchor: "middle", fill: "#FFFFFF", op: Z && s.box && !s.inst ? 1 : 0, z: 5, from: { y: 356 } };
      for (let i = 0; i < 4; i++) {
        const on = Z && s.inst ? 1 : 0;
        o["fl" + i] = { type: "rect", x: 470 + i * 58, y: 470, w: 46, h: 56, rx: 6, fill: ["#3B82E0", "#2FA39E", "#E8705C", "#7B8794"][i], op: on, z: 4, from: { x: 240, y: 590, op: 1 }, lag: i * 0.12 };
      }
      o.icon = { type: "rect", x: 935, y: 405, w: 70, h: 70, rx: 16, fill: "#2FA39E", op: Z && s.inst ? 1 : 0, z: 3, from: { sc: 0.3 } };
      o.icont = { type: "text", x: 970, y: 500, text: "지도 앱", size: 20, weight: 700, anchor: "middle", fill: C.ink, op: Z && s.inst ? 1 : 0, z: 3 };
      /* 창이 열림 */
      const w1 = Z && s.run1 ? 1 : 0;
      o.win = { type: "rect", x: 1030, y: 395, w: 270, h: 230, rx: 12, fill: "#FFFFFF", stroke: "sw", sw: 4, op: w1, z: 4, from: { sc: 0.4 } };
      o.winm = { type: "path", d: "M1045,600 C1110,470 1190,560 1285,440", stroke: "#9ED3CF", sw: 12, fill: "none", op: w1, z: 5 };
      o.winp = { type: "circle", cx: 1200, cy: 500, r: 12, fill: "hot", op: w1, z: 5 };
      /* 실행 목록 표 */
      const [tx, ty, tw] = TBL; const rows = [];
      if (s.run1) rows.push(["지도 앱", "120MB", "r1"]); if (s.run2) rows.push(["메모장", "40MB", "r2"]);
      rows.forEach(([n, m, id], i) => {
        o[id] = { type: "rect", x: tx + 10, y: ty + 10 + i * 56, w: tw - 20, h: 46, rx: 8, fill: "#E3F2F0", stroke: "sw", sw: 2, z: 4, from: { x: tx + 60, op: 0 } };
        o[id + "n"] = { type: "text", x: tx + 26, y: ty + 41 + i * 56, text: n, size: 22, weight: 700, fill: C.teal, z: 5, from: { x: tx + 76 } };
        o[id + "m"] = { type: "text", x: tx + tw - 26, y: ty + 41 + i * 56, text: m, size: 21, weight: 600, anchor: "end", fill: C.ink, z: 5, from: { x: tx + tw + 24 } };
      });
      if (Z && s.inst && !rows.length && !s.why) note(o, "empty", 1360, 650, "아직 비어 있다", 1, C.blue);
      if (Z && s.focus === "apps" && s.run2) note(o, "keep", 470, 760, "파일은 그대로 남는다", 1, C.blue);
      /* 세 가지 고장 */
      const why = Z && s.why ? 1 : 0;
      note(o, "w1", 440, 700, "「설치가 안 돼요」", why, "alert"); note(o, "w2", 1360, 660, "「실행이 안 돼요」", why, "alert"); note(o, "w3", 905, 760, "「화면이 비어 있어요」", why, "alert");
      return o;
    },
    sandbox: {
      init: { inst: 0, run1: 0, run2: 0, box: 1 },
      derive(s) { return Object.assign({}, s, { on: 1, why: 0, focus: null }); },
      controls: [
        { id: "inst", label: (s) => (s.inst ? "삭제(제거)" : "설치"), act(s) { s.inst = s.inst ? 0 : 1; if (!s.inst) { s.run1 = 0; s.run2 = 0; } return s; } },
        { id: "run", label: (s) => (s.run1 ? "지도 앱 닫기" : "지도 앱 실행"), act(s) { s.run1 = s.run1 ? 0 : 1; return s; }, off: (s) => !s.inst },
        { id: "run2", label: (s) => (s.run2 ? "메모장 닫기" : "메모장 실행"), act(s) { s.run2 = s.run2 ? 0 : 1; return s; } },
      ],
      status(s) { return `<p>${!s.inst ? "아직 설치하지 않았습니다. 설치 파일 상자만 다운로드 폴더에 있습니다." : !s.run1 && !s.run2 ? "설치는 됐지만 실행 중인 프로그램은 없습니다." : `실행 중인 프로세스 <b>${(s.run1 ? 1 : 0) + (s.run2 ? 1 : 0)}개</b>. 닫으면 목록에서 사라지고, 설치된 파일은 그대로입니다.`}</p>`; },
    },
  });

  /* ── 1-D 손가락 한 번의 여행 (무대 p01_a4) ── */
  const B4 = { touch: [40, 132, 201, 70], app: [1423, 151, 203, 68], disp: [40, 283, 201, 70], cpu: [40, 446, 201, 70], os: [1422, 567, 204, 70], mem: [40, 571, 201, 70] };
  const P = { btn: [460, 190], app: [1150, 270], os: [1150, 640] };
  const SEG = [
    [[460, 190], [374, 194]],
    [[374, 194], [900, 194], [900, 640], [1150, 640]],
    [[1150, 640], [1010, 640], [1010, 270], [1150, 270]],
    [[1150, 270]],
    [[1150, 270], [1010, 270], [1010, 640], [1150, 640]],
    [[1150, 640], [940, 640], [940, 326], [352, 326]],
  ];
  const SEGC = ["hw", "sw", "sw", null, "sw", "hw"];
  const CHIPS = [["터치 센서", "hw"], ["운영체제", "sw"], ["지도 앱", "sw"], ["CPU·메모리", "hw"], ["지도 앱", "sw"], ["운영체제", "sw"], ["화면 장치", "hw"]];
  IT.define({
    id: "a01_04", fig: "움직이는 그림 1-D", title: "손가락 한 번의 여행", sec: "1.10 손가락 한 번의 여행", view: [W, H], rest: 6,
    blank: { on: 0, at: -1, list: 0, chips: 0, server: 0, quiz: 0 },
    steps: [
      { tag: "터치", say: "손가락이 단추에 닿으면, 화면 아래 터치 센서가 그 위치를 전기 신호로 바꿉니다.", set: { on: 1, at: 0 }, dur: 1.4 },
      { tag: "운영체제", say: "운영체제가 신호를 받아 ‘여기를 눌렀다’는 사건으로 만듭니다.", set: { at: 1 }, dur: 1.5 },
      { tag: "지도 앱", say: "그리고 지금 화면에 떠 있는 지도 앱에게 전합니다.", set: { at: 2 }, dur: 1.4 },
      { tag: "CPU·메모리", say: "앱이 무엇을 할지 정하는 동안, 계산은 CPU가 하고 필요한 값은 메모리에 있습니다.", set: { at: 3 } },
      { tag: "부탁", say: "앱이 운영체제에게, 목록을 그려 달라고 부탁합니다.", set: { at: 4 }, dur: 1.4 },
      { tag: "화면", say: "운영체제가 화면 장치를 움직이면, 목록이 나타납니다.", set: { at: 5, list: 1 }, dur: 1.8 },
      { tag: "번갈아", say: "단추 하나를 누르는 동안, 하드웨어와 소프트웨어가 번갈아 일했습니다.", set: { at: 6, chips: 1 }, dur: 1.2 },
      { tag: "서버", say: "실제 지도 앱은 여기서 멀리 있는 서버에도 물어보는데, 그 길은 3장에서 따라갑니다.", set: { at: 7, server: 1 }, dur: 1.2 },
    ],
    layout(s, t) {
      const o = {}; img(o, "p01_a4.jpg"); veil(o, !s.on); const Z = s.on ? 1 : 0, at = s.at;
      lab(o, "touch", B4.touch, "터치 센서", Z && at >= 0 ? 1 : 0, C.coral); lab(o, "os", B4.os, "운영체제", Z && at >= 1 ? 1 : 0, C.teal);
      lab(o, "app", B4.app, "지도 앱", Z && at >= 2 ? 1 : 0, C.blue); lab(o, "cpu", B4.cpu, "CPU", Z && at >= 3 ? 1 : 0, C.blue);
      lab(o, "mem", B4.mem, "메모리", Z && at >= 3 ? 1 : 0, C.coral); lab(o, "disp", B4.disp, "화면 장치", Z && at >= 5 ? 1 : 0, C.teal);
      const HL = { 0: ["touch"], 1: ["os"], 2: ["app"], 3: ["cpu", "mem"], 4: ["os"], 5: ["disp"], 7: ["app"] }[at] || [];
      const R = { touch: [270, 110, 330, 120], disp: [250, 270, 380, 110], cpu: [340, 400, 170, 150], mem: [520, 500, 170, 120], app: [1090, 110, 290, 330], os: [1090, 470, 290, 330] };
      for (const k in R) hl(o, k, R[k], Z && HL.includes(k), t);
      const rp = (t * 1.1) % 1;
      o.rip = { type: "circle", cx: 460, cy: 190, r: 26 + 34 * rp, fill: "none", stroke: "hot", sw: 5, op: Z && at === 0 ? 1 - rp : 0, z: 5 };
      for (let k = 0; k < SEG.length; k++) {
        if (!SEGC[k] || at < k || !Z) continue;
        const glow = at >= 6 ? 0.6 + 0.35 * Math.sin(t * 3.2 + k * 1.3) : 0.6;
        o["tr" + k] = { type: "path", d: poly(SEG[k]), len: plen(SEG[k]), draw: 1, stroke: SEGC[k] === "hw" ? "#1F3A5F" : "#2FA39E", sw: 9, fill: "none", op: glow, z: 2, from: { draw: 0, op: 0.6 } };
      }
      if (Z && at >= 0 && at <= 5) o.sig = { type: "dot", path: SEG[at], pid: "s" + at, u: 1, r: 18, fill: "hot", stroke: "#FFFFFF", sw: 6, z: 6, from: { u: 0, op: 0.3 } };
      const k3 = Z && at === 3 ? 1 : 0;
      o.xc = { type: "line", x1: 1150, y1: 270, x2: 425, y2: 476, stroke: "hot", sw: 5, dash: "14 10", off: -t * 40, op: k3, z: 2 };
      o.xm = { type: "line", x1: 1150, y1: 300, x2: 590, y2: 558, stroke: "hot", sw: 5, dash: "14 10", off: -t * 40, op: k3, z: 2 };
      note(o, "n1", 930, 470, "‘여기를 눌렀다’", Z && at === 1 ? 1 : 0); note(o, "n2", 930, 120, "누른 곳: 주변 문화공간", Z && at === 2 ? 1 : 0);
      note(o, "n3", 700, 380, "계산은 CPU · 값은 메모리", k3); note(o, "n4", 700, 450, "“목록을 그려 줘”", Z && at === 4 ? 1 : 0);
      note(o, "n5", 560, 380, "화면 장치를 움직인다", Z && at === 5 ? 1 : 0);
      /* 목록 카드 */
      const lst = Z && s.list ? 1 : 0;
      o.lc = { type: "rect", x: 620, y: 40, w: 250, h: 200, rx: 16, fill: "#FFFFFF", stroke: "sw", sw: 4, op: lst, z: 4, from: { y: 60 } };
      o.lct = { type: "text", x: 745, y: 80, text: "주변 문화공간", size: 22, weight: 700, anchor: "middle", fill: C.teal, op: lst, z: 5 };
      for (let i = 0; i < 3; i++) { o["li" + i] = { type: "rect", x: 640, y: 98 + i * 44, w: 210, h: 34, rx: 8, fill: "#E3F2F0", op: lst, z: 5, from: { y: 112 + i * 44 } }; o["ld" + i] = { type: "circle", cx: 660, cy: 115 + i * 44, r: 7, fill: "hot", op: lst, z: 6 }; }
      /* 순서 막대 */
      const ch = Z && s.chips ? 1 : 0;
      CHIPS.forEach(([name, kind], i) => {
        const x = 230 + i * 176; let fill = kind === "hw" ? "#1F3A5F" : "#2FA39E", tc = "#FFFFFF", text = name, stroke = "none";
        if (s.quiz) { const g = (s.guess || [])[i]; if (s.checked) text = (g === kind ? "✓ " : "✗ ") + name; else if (g == null) { fill = "#EEF1F4"; tc = "#5E6A79"; text = "? " + name; stroke = "#C9D2DC"; } else { fill = g === "hw" ? "#E4EBF4" : "#DCEFEC"; tc = g === "hw" ? "#1F3A5F" : "#0F7F7C"; stroke = tc; } }
        o["ch" + i] = { type: "rect", x, y: 830, w: 162, h: 56, rx: 28, fill, stroke, sw: 3, op: ch, z: 5, from: { y: 860 }, lag: i * 0.06 };
        o["ct" + i] = { type: "text", x: x + 81, y: 867, text, size: 22, weight: 700, anchor: "middle", fill: tc, op: ch, z: 6, from: { y: 897 }, lag: i * 0.06 };
      });
      const sv = Z && s.server ? 1 : 0;
      o.srv = { type: "rect", x: 1150, y: 30, w: 200, h: 62, rx: 31, fill: "#FFFFFF", stroke: "#8A98A8", sw: 3, dash: "8 8", op: sv, z: 4 };
      o.srvt = { type: "text", x: 1250, y: 70, text: "서버 (3장)", size: 24, weight: 700, anchor: "middle", fill: "#5E6A79", op: sv, z: 5 };
      o.srvl = { type: "path", d: "M1230,140 L1240,96", stroke: "#8A98A8", sw: 4, dash: "8 8", fill: "none", mark: "muted", op: sv, z: 4 };
      return o;
    },
    sandbox: {
      init: { guess: [null, null, null, null, null, null, null], checked: 0 },
      derive(s) { return Object.assign({}, s, { on: 1, at: 6, list: 1, chips: 1, server: 0, quiz: 1 }); },
      controls: CHIPS.map(([name], i) => ({ id: "q" + i, label: (s) => `${i + 1}. ${name} · ${s.guess[i] == null ? "?" : s.guess[i] === "hw" ? "하드웨어" : "소프트웨어"}`,
        act(s) { const g = s.guess.slice(); g[i] = g[i] == null ? "hw" : g[i] === "hw" ? "sw" : null; s.guess = g; s.checked = 0; return s; } })).concat([
        { id: "check", label: "정답 확인", act(s) { s.checked = 1; return s; }, off: (s) => s.guess.some((g) => g == null) },
        { id: "again", label: "다시 풀기", act(s) { s.guess = [null, null, null, null, null, null, null]; s.checked = 0; return s; } }]),
      status(s) {
        if (!s.checked) return `<p>순서 막대의 일곱 정거장이 하드웨어인지 소프트웨어인지 골라 보세요.</p>`;
        const n = s.guess.filter((g, i) => g === CHIPS[i][1]).length;
        return `<p>맞힌 개수 <b>${n}/7</b> — 터치 센서, CPU·메모리, 화면 장치는 부품(하드웨어), 운영체제와 지도 앱은 프로그램(소프트웨어)입니다.</p>`;
      },
    },
  });
})();
