const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const href = (value) => { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? escapeHtml(u.href) : "#"; } catch { return "#"; } };
const external = (url, label, cls = "") => '<a class="' + cls + '" href="' + href(url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
const searchUrl = (query) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
const icons = {
  arrow:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.6"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.6"/></svg>'
};
const KEY = "hk-macau-trip-v1";
let data, foods = [], loaded = false, lastMapQuery = "", toastTimer, mapTimer;
const state = {day:0,tab:"plan",selected:null,food:null,keyword:"",payment:"all",priority:"main",showOptional:true,visited:new Set()};
try { const saved = JSON.parse(localStorage.getItem(KEY) || "{}"); state.day = Number.isInteger(saved.day) ? saved.day : 0; state.visited = new Set(Array.isArray(saved.visited) ? saved.visited.filter(x => typeof x === "string") : []); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({day:state.day,visited:[...state.visited]})); } catch {} };
const day = () => data.days[state.day];
const selectedStop = () => day().segments.find(s => s.id === state.selected);
const modeName = {walking:"도보",transit:"대중교통",driving:"차량",ferry:"선사 시간표"};
const kindName = {flight:"항공편",food:"식사·간식",sight:"산책·관광",shopping:"쇼핑",hotel:"숙소·휴식",transport:"이동",free:"여유 시간"};
const paymentLabel = {card:"카드 확인",cash:"신용카드 불가",verify:"결제 확인 필요"};
const priorityLabel = {main:"일정에 포함",option:"선택 방문",backup:"대체·보류"};
const pill = (text, type = "") => '<span class="pill ' + type + '">' + escapeHtml(text) + '</span>';
function toast(message) { $("#toast").textContent = message; $("#toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2500); }
function setInitialStop() {
  const stops = day().segments.filter(s => state.showOptional || !s.optional);
  const focus = stops.find(s => s.query === day().focusQuery) || stops.find(s => s.query && (s.kind === "sight" || s.kind === "hotel" || s.kind === "food"));
  state.selected = (focus || stops.find(s => s.query) || stops[0]).id;
}
function foodForStop(stop) {
  if (!stop) return null;
  if (stop.foodId) return foods.find(f => f.id === stop.foodId) || null;
  if (stop.query) { const exact = foods.find(f => f.query && f.query.toLowerCase() === stop.query.toLowerCase()); if (exact) return exact; }
  return null;
}
function renderNav() {
  document.querySelectorAll("[data-tab]").forEach(b => {
    const active = b.dataset.tab === state.tab;
    b.classList.toggle("active",active);
    if (active) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
  });
  $("#dayNav").classList.toggle("hidden",state.tab !== "plan");
  $("#dayNav").innerHTML = data.days.map((d,i) => '<button class="day-button ' + (i === state.day ? "active" : "") + '" data-action="day" data-day="' + i + '" aria-pressed="' + (i === state.day) + '"><span><b>' + escapeHtml(d.dateLabel) + '</b><small>' + escapeHtml(d.weekday) + '</small></span><p>' + escapeHtml(["도착·침사추이","셩완·센트럴","완차이·쇼핑","마카오","귀국"][i]) + '</p></button>').join("");
  if (state.tab === "plan") {
    $("#daySummary").innerHTML = '<div><h2>' + escapeHtml(day().title) + '</h2><p>' + escapeHtml(day().subtitle) + '</p></div><span class="summary-note">' + escapeHtml(day().tip) + '</span>';
  } else if (state.tab === "food") {
    $("#daySummary").innerHTML = '<div><h2>오늘은 어디서 먹을까?</h2><p>카드 결제와 공간 정보까지 함께 보는 ' + foods.length + '곳.</p></div><span class="summary-note">마라·카레는 제외하고, 순한 메뉴를 골라 주문해요.</span>';
  } else {
    $("#daySummary").innerHTML = '<div><h2>출발 전에 꺼내 볼 메모</h2><p>항공편, 쇼핑, 페리와 우리 여행의 기준.</p></div>';
  }
  $("#workspace").classList.toggle("notes",state.tab === "notes");
}
function routeMarkup(route) {
  const notes = route.note || "";
  return '<div class="route-item"><h4>' + escapeHtml(route.from) + ' <span aria-hidden="true">→</span> ' + escapeHtml(route.to) + '</h4><p>' + escapeHtml(notes) + '</p><div class="route-meta"><span>' + escapeHtml(route.allowance).replace(/\n/g," · ") + '</span>' + external(route.url, escapeHtml(modeName[route.mode] || "길찾기") + " ↗") + '</div></div>';
}
function renderAgenda() {
  const d = day(), stops = d.segments.filter(s => state.showOptional || !s.optional);
  const visited = d.segments.filter(s => state.visited.has(s.id)).length;
  const cards = stops.map(s => {
    const originalIndex = d.segments.indexOf(s), done = state.visited.has(s.id), food = foodForStop(s);
    return '<article class="stop-card ' + (state.selected === s.id ? "selected " : "") + (done ? "visited" : "") + '" id="stop-' + escapeHtml(s.id) + '"><button class="stop-head" data-action="stop" data-id="' + escapeHtml(s.id) + '" aria-label="' + escapeHtml(s.title) + ' 선택"><span class="stop-number">' + String(originalIndex + 1).padStart(2,"0") + '</span><span class="stop-info"><span class="stop-time">' + escapeHtml(s.time) + '</span><span class="stop-title" style="display:block">' + escapeHtml(s.title) + '</span><span class="pill-row">' + (s.optional ? pill("선택","warm") : pill(kindName[s.kind] || "일정","neutral")) + (food ? pill(paymentLabel[food.paymentStatus],food.paymentStatus) : "") + '</span><span class="stop-description" style="display:block">' + escapeHtml(s.description) + '</span></span></button><div class="stop-bottom"><button class="visit-button" data-action="visit" data-id="' + escapeHtml(s.id) + '" aria-pressed="' + done + '"><span class="visit-circle">' + (done ? "✓" : "") + '</span>' + (done ? "다녀왔어요" : "방문 체크") + '</button>' + (s.query ? '<button class="map-mini" data-action="show-map" data-id="' + escapeHtml(s.id) + '">지도 보기 ↑</button>' : "") + '</div></article>';
  }).join("");
  const areas = (d.areaMaps || []).map(a => '<div class="area-link">' + external(a.url,'<span>' + escapeHtml(a.label).replace(/\n/g," ") + '</span><span>↗</span>') + '<p>' + escapeHtml(a.note) + '</p></div>').join("");
  $("#contentPanel").innerHTML = '<div class="agenda-toolbar"><span>' + visited + ' / ' + d.segments.length + ' 일정 체크</span><label><input type="checkbox" id="optionalToggle" ' + (state.showOptional ? "checked" : "") + '>선택 코스 표시</label></div><div class="progress-line" aria-hidden="true"><span style="width:' + Math.round(visited / d.segments.length * 100) + '%"></span></div><div class="timeline">' + cards + '</div><p class="local-note">방문 기록은 이 기기의 브라우저에 저장돼요.</p>' + (areas ? '<div class="area-links"><h3>여러 장소를 잇는 동선 지도</h3>' + areas + '<p>Google 지도에서 방문 순서와 경로를 펼쳐봐요.</p></div>' : "") + '<details class="route-section"><summary>이날의 이동 구간 ' + d.routes.length + '개</summary><p>선택 코스와 생략 후 직행하는 대안이 함께 있어요. 모두 이동하는 일정은 아니에요.</p>' + d.routes.map(routeMarkup).join("") + '</details>';
}
function relatedRoutes(stop) {
  if (!stop) return [];
  return (stop.routeIds || []).map(id => day().routes.find(r => r.id === id)).filter(Boolean);
}
function foodDetail(food) {
  if (!food) return "";
  const sources = (food.sourceUrls || []).slice(0,4).map((url,i) => external(url,"출처 " + (i + 1))).join("");
  return '<div class="detail-section"><h4>주문할 메뉴</h4><p>' + escapeHtml(food.menu) + '</p></div><div class="detail-section"><h4>결제 · 1인 예산</h4><p>' + escapeHtml(food.payment) + '\n' + escapeHtml(food.budget) + '</p></div><div class="detail-section"><h4>공간 · 화장실</h4><p>' + escapeHtml(food.facility) + '</p><p style="font-size:10px;margin-top:7px">현재 청결과 혼잡도는 방문 시 확인해요.</p></div><details class="detail-section"><summary style="font-size:11px;cursor:pointer">확인한 내용과 출처</summary><p style="margin-top:10px">' + escapeHtml(food.detail) + '</p><div class="source-links">' + sources + '</div></details>';
}
function updateMap(query, title, url) {
  $("#mapHeading").textContent = title;
  $("#mapExternal").href = url || (query ? searchUrl(query) : data.wishlistUrl);
  if (!query) {
    clearTimeout(mapTimer);
    lastMapQuery = "";
    $("#googleMap").removeAttribute("src");
    $("#mapWait").classList.remove("hidden");
    $("#mapWait").innerHTML = "<span>아직 정확한 업장을 확인하지 못했어요.</span>";
    return;
  }
  if (query !== lastMapQuery) {
    lastMapQuery = query;
    $("#mapWait").innerHTML = '<span class="loading-dot"></span><span>Google 지도를 불러오는 중</span>';
    $("#mapWait").classList.remove("hidden");
    $("#googleMap").title = title + " Google 지도";
    $("#googleMap").src = "https://www.google.com/maps?hl=ko&q=" + encodeURIComponent(query) + "&z=15&output=embed";
    clearTimeout(mapTimer);
    mapTimer = setTimeout(() => $("#mapWait").classList.add("hidden"),7000);
  }
}
function renderPlace(options = {}) {
  let place, food = null, routes = [];
  if (options.hotel) {
    place = {title:data.hotel.name,time:"4박의 베이스",description:data.hotel.address,kind:"hotel",query:data.hotel.query,mapUrl:data.hotel.mapUrl};
  } else if (state.tab === "food") {
    food = foods.find(f => f.id === state.food);
    if (!food) {
      updateMap("","조건에 맞는 장소가 없어요",data.wishlistUrl);
      $("#mapWait").innerHTML = "<span>검색어나 결제 필터를 바꿔보세요.</span>";
      $("#placeDetails").innerHTML = '<p class="place-body">목록에서 식당을 고르면 이곳에 지도와 상세 정보가 표시돼요.</p>';
      return;
    }
    place = {title:food.name,time:food.area,description:food.plan,kind:"food",query:food.query,mapUrl:food.mapUrl};
  } else {
    place = selectedStop();
    if (!place) return;
    food = foodForStop(place);
    routes = relatedRoutes(place);
  }
  updateMap(place.query,place.title,place.mapUrl);
  const status = food ? pill(paymentLabel[food.paymentStatus],food.paymentStatus) : pill(kindName[place.kind] || "선택 장소","neutral");
  const locationLink = external(place.mapUrl || searchUrl(place.query),icons.arrow + "Google 지도 열기","button primary");
  const copy = place.query ? '<button class="button" data-action="copy" data-query="' + escapeHtml(place.query) + '">' + icons.copy + "위치 복사</button>" : "";
  let next = "";
  if (routes.length) next = '<details class="route-section" open><summary>이 일정에 연결되는 이동 ' + routes.length + '개</summary>' + routes.map(routeMarkup).join("") + '</details>';
  $("#placeDetails").innerHTML = '<div class="place-top"><div><h3>' + escapeHtml(place.title) + '</h3><p class="place-sub">' + escapeHtml(place.time) + '</p></div>' + status + '</div><p class="place-body">' + escapeHtml(place.description) + '</p><div class="place-actions">' + locationLink + copy + '</div>' + next + foodDetail(food);
}
function filteredFoods() {
  const key = state.keyword.trim().toLowerCase();
  const ranks = {card:0,verify:1,cash:2};
  return foods.filter(f => (!key || [f.name,f.area,f.menu,f.plan].join(" ").toLowerCase().includes(key)) && (state.payment === "all" || f.paymentStatus === state.payment) && (state.priority === "all" || f.priority === state.priority)).sort((a,b) => ranks[a.paymentStatus] - ranks[b.paymentStatus]);
}
function syncFoodSelection() {
  const visible = filteredFoods();
  if (!visible.some(f => f.id === state.food)) state.food = visible[0]?.id || null;
}
function renderFoodResults() {
  const filtered = filteredFoods();
  $("#foodCount").textContent = filtered.length + "곳 · 카드 확인 매장 우선 · 선택하면 지도·상세가 열려요.";
  $("#foodResults").innerHTML = filtered.length ? filtered.map(f => '<button class="food-card ' + (f.id === state.food ? "selected" : "") + '" data-action="food" data-id="' + escapeHtml(f.id) + '"><p class="food-area">' + escapeHtml(f.area) + '</p><h3 class="food-name">' + escapeHtml(f.name) + '</h3><div class="pill-row">' + pill(paymentLabel[f.paymentStatus],f.paymentStatus) + pill(priorityLabel[f.priority],"neutral") + '</div><p class="food-menu">' + escapeHtml(f.menu) + '</p><div class="food-footer"><span>' + escapeHtml(f.budget) + '</span><span>지도·상세 ↗</span></div></button>').join("") : '<div class="empty">이 조건에 맞는 장소가 없어요.<br>검색어나 필터를 바꿔보세요.</div>';
  document.querySelectorAll("[data-filter]").forEach(b => { const active = state[b.dataset.filter] === b.dataset.value; b.classList.toggle("active",active); b.setAttribute("aria-pressed",String(active)); });
}
function renderFoods() {
  syncFoodSelection();
  const buttons = (type, pairs) => pairs.map(([v,label]) => '<button class="filter-chip ' + (state[type] === v ? "active" : "") + '" data-action="filter" data-filter="' + type + '" data-value="' + v + '" aria-pressed="' + (state[type] === v) + '">' + label + '</button>').join("");
  $("#contentPanel").innerHTML = '<div class="food-controls"><div class="search-wrap"><input id="foodSearch" type="search" placeholder="식당, 지역, 메뉴 검색" aria-label="맛집 검색" value="' + escapeHtml(state.keyword) + '"></div><div class="filter-row" aria-label="방문 우선순위">' + buttons("priority",[["main","일정에 포함"],["all","전체 38곳"],["option","선택"],["backup","대체·보류"]]) + '</div><div class="filter-row" aria-label="결제 수단">' + buttons("payment",[["all","모든 결제"],["card","카드 확인"],["cash","신용카드 불가"],["verify","확인 필요"]]) + '</div></div><p id="foodCount" class="food-count"></p><div id="foodResults" class="food-grid"></div>';
  renderFoodResults();
}
function renderNotes() {
  const notes = (data.notes || []).map(n => '<article class="note-card"><h3>' + escapeHtml(n.title) + '</h3><p>' + escapeHtml(n.body) + '</p></article>').join("");
  $("#contentPanel").innerHTML = '<div class="notes-grid"><article class="note-card wide"><p class="eyebrow">FLIGHTS</p><h3 style="margin-top:5px">출발과 돌아오는 날</h3><div class="flight-grid"><div class="flight"><p>12월 30일 수요일 · YP801</p><div class="route"><b>ICN 09:15</b><small>→</small><b>HKG 12:05</b></div><p>인천 T1 → 홍콩 T1<br>도착 후 입국·짐 찾기와 가벼운 점심.</p></div><div class="flight"><p>1월 3일 일요일 · YP802</p><div class="route"><b>HKG 13:40</b><small>→</small><b>ICN 18:20</b></div><p>홍콩 T1 → 인천 T1<br>12:30 쇼핑 종료, 13:00 탑승구 도착 목표.</p></div></div><p style="margin-top:12px;font-size:10px">항공편은 제공한 항공권 기준이며, 모든 시각은 해당 공항 현지 시각이에요.</p></article>' + notes + '<article class="note-card"><h3>지도와 이동시간 보는 법</h3><p>장소를 누르면 사이트 지도에서 위치를 볼 수 있어요.\n\n정확한 경로·거리·조회 시점 예상시간은 Google 지도 길찾기 버튼으로 확인해요. 여행 전에는 출발 날짜와 시간을 바꾸고, 현장에서는 출발지를 내 위치로 설정하세요.\n\n표시한 이동 여유는 계획값이에요. 택시 대기, 출입국, 식사·쇼핑 시간은 별도입니다.</p><div class="source-links">' + external("https://support.google.com/maps/answer/144339?hl=ko","Google 지도 도움말 ↗") + '</div></article><article class="note-card"><h3>원래 자료 열기</h3><p>일정표의 방문 순서와 결제·시설 정보를 이 사이트에 담았어요. 원본 시트의 이후 변경은 사이트에 자동 반영되지 않아요.</p><div class="place-actions">' + external(data.sheetUrl,"Google 일정표 ↗","button") + external(data.wishlistUrl,"위시리스트 지도 ↗","button") + '</div><p style="margin-top:16px;font-size:10px">방문 체크는 브라우저별 저장이며, 친구의 기기와 자동 동기화되지 않아요.</p></article></div>';
}
function render() {
  renderNav();
  if (state.tab === "plan") { renderAgenda(); renderPlace(); }
  else if (state.tab === "food") { renderFoods(); renderPlace(); }
  else renderNotes();
}
function showMap() { $("#mapPanel").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth",block:"start"}); }
document.addEventListener("click", async event => {
  const b = event.target.closest("[data-action]");
  if (!b || !loaded) return;
  const action = b.dataset.action;
  if (action === "day") { const i = Number(b.dataset.day); if (!Number.isInteger(i) || !data.days[i]) return; state.day = i; setInitialStop(); save(); render(); }
  if (action === "tab") { state.tab = b.dataset.tab; if (state.tab === "food" && !state.food) state.food = (foods.find(f => f.priority === "main") || foods[0]).id; render(); }
  if (action === "stop" || action === "show-map") { state.selected = b.dataset.id; renderAgenda(); renderPlace(); if (action === "show-map") showMap(); }
  if (action === "visit") { const id = b.dataset.id; if (state.visited.has(id)) state.visited.delete(id); else state.visited.add(id); save(); renderAgenda(); }
  if (action === "hotel") { if (state.tab === "notes") { state.tab = "plan"; render(); } renderPlace({hotel:true}); showMap(); }
  if (action === "food") { state.food = b.dataset.id; renderFoodResults(); renderPlace(); if (matchMedia("(max-width:850px)").matches) showMap(); }
  if (action === "filter") { state[b.dataset.filter] = b.dataset.value; syncFoodSelection(); renderFoodResults(); renderPlace(); }
  if (action === "map-toggle") { const expanded = $("#mapPanel").classList.toggle("expanded"); b.textContent = expanded ? "작게 보기" : "크게 보기"; }
  if (action === "copy") { try { await navigator.clipboard.writeText(b.dataset.query); toast("위치를 복사했어요."); } catch { toast("복사가 제한되어 있어요. Google 지도 열기를 이용해주세요."); } }
});
document.addEventListener("input", e => { if (e.target.id === "foodSearch") { state.keyword = e.target.value; syncFoodSelection(); renderFoodResults(); renderPlace(); } });
document.addEventListener("change", e => { if (e.target.id === "optionalToggle") { state.showOptional = e.target.checked; if (!state.showOptional && selectedStop()?.optional) setInitialStop(); renderAgenda(); renderPlace(); } });
$("#googleMap").addEventListener("load", () => { if (lastMapQuery) { clearTimeout(mapTimer); $("#mapWait").classList.add("hidden"); } });
async function init() {
  try {
    const [tripResponse, foodResponse] = await Promise.all([fetch("trip-data.json"),fetch("food-data.json")]);
    if (!tripResponse.ok || !foodResponse.ok) throw new Error("data-unavailable");
    [data,foods] = await Promise.all([tripResponse.json(),foodResponse.json()]);
    if (!data.days?.length || !Array.isArray(foods)) throw new Error("data-invalid");
    if (!data.days[state.day]) state.day = 0;
    const allIds = new Set(data.days.flatMap(d => d.segments.map(s => s.id)));
    state.visited = new Set([...state.visited].filter(id => allIds.has(id)));
    $("#sheetLink").href = data.sheetUrl;
    setInitialStop();
    loaded = true;
    render();
  } catch {
    $("#mapPanel").classList.add("hidden");
    $("#contentPanel").innerHTML = '<div class="empty"><h2 style="font-size:17px;margin-bottom:10px">일정을 불러오지 못했어요.</h2><p>연결을 확인하고 새로고침해주세요.</p>' + external("https://docs.google.com/spreadsheets/d/1577x6LtDShZBWabthCpKgWdvCAGEix43o9-z5VUx-kw/edit","원본 일정표 열기 ↗","button") + '</div>';
  }
}
init();
