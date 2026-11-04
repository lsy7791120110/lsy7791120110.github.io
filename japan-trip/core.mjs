/**
 * Local Japan travel planner data and Maps URL helpers.
 * No network calls, DOM access, storage side effects, or third-party libraries.
 *
 * Maps URL contract:
 * https://developers.google.com/maps/documentation/urls/get-started
 */
export const CITY_IDS = Object.freeze(["fukuoka", "sapporo", "osaka", "tokyo"]);
export const STORAGE_KEY = "japan-trip-notes-v1";

const APP = "japan-trip-notes";
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const MAX_MAP_URL_LENGTH = 2048;
const PLACE_CATEGORIES = ["sight", "food", "cafe", "shop", "hotel", "other"];
const EXPENSE_CATEGORIES = ["food", "transport", "stay", "shop", "other"];
const TRAVEL_MODES = ["walking", "transit", "driving", "bicycling", "two-wheeler"];
const CHECKS = [
  ["passport", "여권 확인"],
  ["flight", "항공편 예약"],
  ["hotel", "숙소 예약"],
  ["esim", "eSIM·로밍 준비"],
  ["transport", "공항 이동·교통편 확인"],
  ["card", "결제 카드·현금 준비"],
  ["charger", "충전기·어댑터 챙기기"],
  ["clothes", "날씨에 맞는 옷 준비"]
];
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isRecord = value => value !== null && typeof value === "object"
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

function fail(label, detail = "형식이 올바르지 않아요.") {
  throw new Error(label + ": " + detail);
}

function record(value, label) {
  if (!isRecord(value)) fail(label);
  return value;
}

function text(value, label, max = 300, fallback = "", trim = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") fail(label);
  if (value.length > max) fail(label, max + "자까지 저장할 수 있어요.");
  const clean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return trim ? clean.trim() : clean;
}

function number(value, label, {min = 0, max = 1e9, fallback = 0, integer = false} = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "number" && typeof value !== "string") fail(label);
  if (typeof value === "string" && !/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())) fail(label);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    fail(label, min + "에서 " + max + " 사이의 " + (integer ? "정수" : "숫자") + "를 입력해 주세요.");
  }
  return n;
}

function list(value, label, max, fallback = []) {
  if (value === undefined || value === null) return fallback;
  if (!Array.isArray(value)) fail(label);
  if (value.length > max) fail(label, max + "개까지 저장할 수 있어요.");
  return value;
}

function identifier(value, label) {
  const s = text(value, label, 120);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(s) || ["__proto__", "prototype", "constructor"].includes(s)) {
    fail(label, "장소·항목 식별자가 올바르지 않아요.");
  }
  return s;
}

function enumValue(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

function safeUrl(value, label) {
  const raw = text(value, label, 2048);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function uniqueItems(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) fail(label, "중복된 항목 식별자가 있어요.");
    seen.add(item.id);
  }
  return items;
}

function uniqueIds(value, label) {
  return [...new Set(list(value, label, 1000).map((item, i) => identifier(item, label + " " + (i + 1))))];
}

function defaultCity() {
  return {
    trip: {startDate: "", days: 3, hotel: "", hotelQuery: "", budgetYen: 0, exchangeRate: 0},
    savedIds: [],
    visitedIds: [],
    customPlaces: [],
    placeNotes: {},
    plan: [],
    expenses: [],
    checklist: CHECKS.map(([key, title]) => ({id: "check-" + key, title, checked: false})),
    memo: ""
  };
}

export function createDefaultState() {
  return {
    version: 1,
    activeCity: CITY_IDS[0],
    cities: Object.fromEntries(CITY_IDS.map(city => [city, defaultCity()]))
  };
}

function cleanPlace(value, index) {
  const label = "직접 추가한 장소 " + (index + 1);
  const place = record(value, label);
  const name = text(place.name, label + " 이름", 180);
  if (!name) fail(label, "장소 이름을 입력해 주세요.");
  const nameEn = text(place.nameEn, label + " 영문 이름", 180);
  return {
    id: identifier(place.id, label),
    name,
    nameEn,
    category: enumValue(place.category, PLACE_CATEGORIES, "other"),
    area: text(place.area, label + " 지역", 150),
    query: text(place.query, label + " 지도 검색어", 500, nameEn || name) || nameEn || name,
    mapUrl: safeUrl(place.mapUrl, label + " 지도 링크"),
    note: text(place.note, label + " 메모", 5000, "", false),
    payment: enumValue(place.payment, ["unknown", "card", "cash"], "unknown"),
    facility: enumValue(place.facility, ["unknown", "confirmed"], "unknown"),
    sourceUrl: safeUrl(place.sourceUrl, label + " 출처 링크")
  };
}

function cleanPlan(value, index) {
  const label = "일정 " + (index + 1);
  const item = record(value, label);
  const time = text(item.time, label + " 시간", 5);
  if (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) fail(label, "시간은 00:00부터 23:59까지 입력해 주세요.");
  return {
    id: identifier(item.id, label),
    placeId: identifier(item.placeId, label + " 장소"),
    day: number(item.day, label + " 날짜", {min: 1, max: 30, integer: true, fallback: 1}),
    time,
    duration: number(item.duration, label + " 체류 시간", {min: 0, max: 1440, integer: true, fallback: 60}),
    note: text(item.note, label + " 메모", 5000, "", false)
  };
}

function cleanExpense(value, index) {
  const label = "지출 " + (index + 1);
  const item = record(value, label);
  const title = text(item.title, label + " 이름", 180);
  if (!title) fail(label, "지출 이름을 입력해 주세요.");
  return {
    id: identifier(item.id, label),
    title,
    category: enumValue(item.category, EXPENSE_CATEGORIES, "other"),
    amount: number(item.amount, label + " 금액", {max: 1e9})
  };
}

function cleanCheck(value, index) {
  const label = "준비물 " + (index + 1);
  const item = record(value, label);
  const title = text(item.title, label + " 이름", 250);
  if (!title) fail(label, "준비물 이름을 입력해 주세요.");
  return {id: identifier(item.id, label), title, checked: item.checked === true};
}

function cleanCity(value, cityId) {
  const city = record(value, cityId + " 여행");
  const trip = record(city.trip, cityId + " 여행 설정");
  const startDate = text(trip.startDate, "출발 날짜", 10);
  if (startDate && !validDate(startDate)) fail("출발 날짜", "실제 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.");
  const days = number(trip.days, "여행 일수", {min: 1, max: 30, integer: true, fallback: 3});
  const plan = uniqueItems(list(city.plan, "일정", 900).map(cleanPlan), "일정");
  const customPlaces = uniqueItems(list(city.customPlaces, "직접 추가한 장소", 500).map(cleanPlace), "직접 추가한 장소");
  const notes = city.placeNotes === undefined || city.placeNotes === null ? {} : record(city.placeNotes, "장소 메모");
  const noteKeys = Object.keys(notes);
  if (noteKeys.length > 1000) fail("장소 메모", "1000개까지 저장할 수 있어요.");
  const placeNotes = {};
  for (const key of noteKeys) {
    const validKey = identifier(key, "장소 메모");
    placeNotes[validKey] = text(notes[key], "장소 메모", 5000, "", false);
  }
  return {
    trip: {
      startDate,
      // A reduced day count must never hide later saved itinerary entries.
      days: Math.max(days, ...plan.map(item => item.day)),
      hotel: text(trip.hotel, "숙소 이름", 200),
      hotelQuery: text(trip.hotelQuery, "숙소 지도 검색어", 500),
      budgetYen: number(trip.budgetYen, "전체 예산", {max: 1e9}),
      // Zero means the user has not supplied a manual exchange rate yet.
      exchangeRate: number(trip.exchangeRate, "직접 입력한 환율", {max: 1e6})
    },
    savedIds: uniqueIds(city.savedIds, "저장한 장소"),
    visitedIds: uniqueIds(city.visitedIds, "방문한 장소"),
    customPlaces,
    placeNotes,
    plan,
    expenses: uniqueItems(list(city.expenses, "지출", 1000).map(cleanExpense), "지출"),
    checklist: uniqueItems(list(city.checklist, "준비물", 200, defaultCity().checklist).map(cleanCheck), "준비물"),
    memo: text(city.memo, "여행 메모", 30000, "", false)
  };
}

/**
 * Return a newly allocated, allowlisted state. Invalid structural data and
 * oversized collections are rejected, never silently dropped from a backup.
 */
export function sanitizeState(raw) {
  const state = record(raw, "여행 데이터");
  if (state.version !== 1) fail("여행 데이터", "지원하지 않는 버전이에요.");
  const cities = record(state.cities, "도시별 여행 데이터");
  if (Object.keys(cities).some(key => !CITY_IDS.includes(key)) || CITY_IDS.some(key => !own(cities, key))) {
    fail("도시별 여행 데이터", "후쿠오카·삿포로·오사카·도쿄 데이터가 모두 필요해요.");
  }
  if (!CITY_IDS.includes(state.activeCity)) fail("선택한 도시");
  return {
    version: 1,
    activeCity: state.activeCity,
    cities: Object.fromEntries(CITY_IDS.map(key => [key, cleanCity(cities[key], key)]))
  };
}

function checkBackupSize(value) {
  if (value.length > MAX_BACKUP_BYTES || new TextEncoder().encode(value).length > MAX_BACKUP_BYTES) {
    fail("백업 파일", "2MB 이하의 파일을 선택해 주세요.");
  }
}

export function parseBackup(value) {
  if (typeof value !== "string") fail("백업 파일", "텍스트 파일을 읽을 수 없어요.");
  checkBackupSize(value);
  let data;
  try {
    data = JSON.parse(value);
  } catch {
    fail("백업 파일", "올바른 JSON 파일이 아니에요.");
  }
  record(data, "백업 파일");
  if (data.app !== APP || data.version !== 1) {
    fail("백업 파일", "이 일본 여행 노트에서 내보낸 백업 파일을 선택해 주세요.");
  }
  return sanitizeState(data.state);
}

export function makeBackup(state) {
  const serialized = JSON.stringify({
    app: APP,
    version: 1,
    exportedAt: new Date().toISOString(),
    state: sanitizeState(state)
  }, null, 2);
  checkBackupSize(serialized);
  return serialized;
}

function mapQuery(value, label, required = true) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    fail(label, "장소 이름이나 주소를 입력해 주세요.");
  }
  const query = value.trim();
  if (!query && required) fail(label, "장소 이름이나 주소를 입력해 주세요.");
  return query;
}

function checkedMapUrl(url) {
  if (url.length > MAX_MAP_URL_LENGTH) fail("지도 링크", "장소 이름이나 주소가 너무 길어요. 검색어를 짧게 수정해 주세요.");
  return url;
}

export function searchUrl(query) {
  const params = new URLSearchParams({api: "1", query: mapQuery(query, "지도 검색어")});
  return checkedMapUrl("https://www.google.com/maps/search/?" + params.toString());
}

function buildDirections(origin, destination, mode, waypoints = []) {
  const params = new URLSearchParams({api: "1"});
  if (origin) params.set("origin", origin);
  params.set("destination", destination);
  params.set("travelmode", mode);
  if (waypoints.length) params.set("waypoints", waypoints.join("|"));
  return "https://www.google.com/maps/dir/?" + params.toString();
}

export function directionsUrl(origin, destination, mode = "transit") {
  return checkedMapUrl(buildDirections(
    mapQuery(origin, "출발 장소", false),
    mapQuery(destination, "도착 장소"),
    enumValue(mode, TRAVEL_MODES, "transit")
  ));
}

/**
 * Split a route into consecutive, overlapping chunks with at most three
 * intermediate waypoints, also respecting Maps' 2,048-character URL limit.
 * Returned indices are zero-based positions in the original queries array.
 */
export function routeLinks(queries, mode = "walking") {
  if (!Array.isArray(queries)) fail("이동 경로");
  const points = queries.map((query, index) => mapQuery(query, "이동 장소 " + (index + 1)));
  const travelmode = enumValue(mode, TRAVEL_MODES, "walking");
  if (points.some(point => point.includes("|"))) fail("이동 경로", "장소 검색어에서 | 기호를 제거해 주세요.");
  const links = [];
  let fromIndex = 0;
  while (fromIndex < points.length - 1) {
    // Transit routes are individual legs; multi-stop support varies by client.
    let toIndex = Math.min(fromIndex + (travelmode === "transit" ? 1 : 4), points.length - 1);
    let url;
    do {
      url = buildDirections(points[fromIndex], points[toIndex], travelmode, points.slice(fromIndex + 1, toIndex));
      if (url.length <= MAX_MAP_URL_LENGTH) break;
      toIndex -= 1;
    } while (toIndex > fromIndex);
    if (toIndex <= fromIndex) fail("지도 링크", "장소 이름이나 주소가 너무 길어요. 검색어를 짧게 수정해 주세요.");
    links.push({url, fromIndex, toIndex});
    fromIndex = toIndex;
  }
  return links;
}

export function dayLabel(startDate, day) {
  const dayNumber = Number.isInteger(Number(day)) && Number(day) >= 1 && Number(day) <= 30 ? Number(day) : 1;
  if (!validDate(startDate)) return dayNumber + "일차";
  const date = new Date(startDate + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + dayNumber - 1);
  return String(date.getUTCMonth() + 1).padStart(2, "0") + "."
    + String(date.getUTCDate()).padStart(2, "0") + " ("
    + ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()] + ")";
}

export function id(prefix = "item") {
  const safePrefix = String(prefix || "item").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 32).replace(/^[^A-Za-z0-9]+/, "") || "item";
  let unique;
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    unique = globalThis.crypto.randomUUID();
  } else if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    unique = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  } else {
    unique = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
  return safePrefix + "-" + unique;
}

export function yenToWon(yen, rate) {
  const amount = Number(yen);
  const exchangeRate = Number(rate);
  if (!Number.isFinite(amount) || !Number.isFinite(exchangeRate) || amount < 0 || exchangeRate <= 0) return 0;
  const won = amount * exchangeRate;
  return Number.isFinite(won) ? Math.round(won) : 0;
}

export function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
