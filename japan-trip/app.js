import {CITY_IDS, STORAGE_KEY, createDefaultState, sanitizeState, parseBackup, makeBackup, searchUrl, directionsUrl, routeLinks, dayLabel, id, yenToWon, escapeHtml as esc} from './core.mjs';
import {CITIES, CHECKED_AT} from './data.js';

const $ = s => document.querySelector(s);
const paths = {
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>',
  route:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h8"/>',
  checklist:'<rect x="4" y="3" width="16" height="19" rx="2"/><path d="m7 9 1 1 2-2m3 1h4m-10 7 1 1 2-2m3 1h4"/>',
  wallet:'<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6"/><path d="M20 12h-5a2 2 0 0 0 0 4h5"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-1.5 1-2 1.2-2 2.5m0 3h.01"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M7 17 17 7M7 7h10v10"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  circlecheck:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  coffee:'<path d="M3 8h14v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm14 1h2a3 3 0 0 1 0 6h-2M6 3v2m4-2v2m4-2v2M2 22h17"/>',
  shop:'<path d="M4 8h16l1 13H3L4 8Zm4 0V6a4 4 0 0 1 8 0v2"/>',
  food:'<path d="M4 3v5a3 3 0 0 0 6 0V3M7 3v18m12-18c-4 2-4 9 0 9h1m0-9v18"/>',
  hotel:'<path d="M3 21V6m18 15V9M3 17h18M3 9h8v8m0-6h7a3 3 0 0 1 3 3v3"/><circle cx="7" cy="13" r="1"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  up:'<path d="m6 15 6-6 6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  walk:'<circle cx="14" cy="4" r="2"/><path d="m9 22 3-7m-6-5 5-3 3 2 4 2m-7-4-2 8 7 7m-7-7-4 3"/>',
  train:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M12 3v8M8 18l-2 4m10-4 2 4M9 15h.01M15 15h.01"/>',
  car:'<path d="m5 6-2 7v7m16-14 2 7v7M3 16h18M3 12h18M5 6h14M5 19h2m10 0h2"/>',
  print:'<path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7Zm11-2h.01"/>',
  note:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>'
};
const icon = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[n]||paths.pin)+'</svg>';
const catName={sight:'관광·산책',food:'맛집',cafe:'카페',shop:'쇼핑',hotel:'숙소',other:'기타'};
const catIcon={sight:'pin',food:'food',cafe:'coffee',shop:'shop',hotel:'hotel',other:'note'};
const expName={food:'식사·카페',transport:'교통',stay:'숙박',shop:'쇼핑',other:'기타'};
const expIcon={food:'coffee',transport:'train',stay:'hotel',shop:'shop',other:'wallet'};
const money = n => '¥ '+new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(n);
const won = n => new Intl.NumberFormat('ko-KR').format(Math.round(n))+'원';
const safeUrl = value => {try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const link = (url,label,cls='') => '<a href="'+esc(safeUrl(url)||'#')+'" class="'+esc(cls)+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';
const badge = p => '<span class="category-badge '+esc(p.category)+'">'+icon(catIcon[p.category])+esc(catName[p.category]||'기타')+'</span>';
const fillIcons = () => document.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=icon(e.dataset.icon);});

let state=createDefaultState(), storageError=false, recoveredError='', toastTimer, pendingImport=null, dialogReturnFocus=null;
const ui={tab:'places',scope:'saved',category:'all',payment:'all',query:'',selected:null,day:1,mapOpen:false};
try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)state=sanitizeState(JSON.parse(saved));}catch(e){recoveredError='저장된 기록을 읽지 못했어요. 백업 파일이 있다면 가져와 주세요.';try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)localStorage.setItem(STORAGE_KEY+'-unreadable',raw);}catch{storageError=true;}}
const city=()=>CITIES[state.activeCity];
const data=()=>state.cities[state.activeCity];
const allPlaces=()=>[...data().customPlaces];
const placeById=k=>allPlaces().find(p=>p.id===k);
const dayItems=()=>data().plan.filter(p=>p.day===ui.day);
const placeQuery=p=>p.query||[p.name,city().en,'Japan'].join(' ');
function usableSearch(p){
  const original=typeof p==='string'?p:placeQuery(p);
  const name=typeof p==='string'?city().query:[p.nameEn||p.name,city().en,'Japan'].filter(Boolean).join(' ');
  const candidates=[original,name,typeof p==='string'?city().query:(p.nameEn||p.name),city().query];
  for(const query of candidates){try{const url=searchUrl(query);const embed='https://www.google.com/maps?hl=ko&q='+encodeURIComponent(query)+'&z=14&output=embed';if(embed.length<=2048)return {query,url};}catch{}}
  return {query:city().query,url:searchUrl(city().query)};
}
const mapQuery=p=>usableSearch(p).query;
const placeUrl=p=>safeUrl(p.mapUrl)||usableSearch(p).url;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function persist(){try{state=sanitizeState(state);localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageError=false;}catch(e){storageError=true;toast('자동저장에 실패했어요. 백업으로 기록을 보관해 주세요.');}renderSaveStatus();}
function renderSaveStatus(){$('#saveStatus').classList.toggle('error',storageError);$('#saveStatus').innerHTML='<span></span>'+(storageError?'자동저장 불가 · 백업 필요':'이 기기에 자동저장');}
function resetUI(){ui.query='';ui.category='all';ui.payment='all';ui.scope='saved';ui.selected=null;ui.day=1;ui.mapOpen=false;}
function ensureSelection(){if(ui.selected==='hotel'&&data().trip.hotel)return;if(!placeById(ui.selected))ui.selected=allPlaces()[0]?.id||null;}
function renderHeader(){
  $('#totalSaved').textContent=CITY_IDS.reduce((n,c)=>n+state.cities[c].savedIds.length,0);
  $('#cityNav').innerHTML=CITY_IDS.map(c=>'<button class="city-card '+c+(state.activeCity===c?' active':'')+'" data-action="city" data-city="'+c+'" aria-pressed="'+(state.activeCity===c)+'" aria-label="'+CITIES[c].name+' 선택"><img src="'+esc(CITIES[c].photo.imageUrl)+'" alt="'+esc(CITIES[c].photo.alt)+'" fetchpriority="high"><span class="city-chip">'+icon('heart')+state.cities[c].savedIds.length+'</span><span class="city-name"><small>'+CITIES[c].en+'</small><strong>'+CITIES[c].name+'</strong></span>'+(state.activeCity===c?'<span class="selected-tick">'+icon('check')+'</span>':'')+'</button>').join('');
  $('#cityEyebrow').textContent=city().en+' / '+city().jp;
  $('#cityHeading').textContent=city().name+' 여행 노트';
  const t=data().trip;
  $('#citySubtitle').textContent=(t.startDate?t.startDate.replaceAll('-','.')+' 출발':'날짜 미정')+' · '+t.days+'일로 구성'+(t.hotel?' · '+t.hotel:'');
  $('#savedBadge').textContent=data().savedIds.length;
  document.querySelectorAll('.tabs [data-tab]').forEach(b=>{const active=b.dataset.tab===ui.tab;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  renderSaveStatus();
}
function render(){ensureSelection();ui.day=Math.min(ui.day,data().trip.days);renderHeader();$('#workspace').classList.toggle('full',['prep','budget'].includes(ui.tab));({places:renderPlaces,plan:renderPlan,prep:renderPrep,budget:renderBudget}[ui.tab])();if(['places','plan'].includes(ui.tab))renderMap();fillIcons();}

function filteredPlaces(){const q=ui.query.trim().toLowerCase();return allPlaces().filter(p=>(ui.scope!=='saved'||data().savedIds.includes(p.id))&&(ui.category==='all'||p.category===ui.category)&&(ui.payment==='all'||p.payment===ui.payment)&&(!q||[p.name,p.nameEn,p.area,p.note,p.query,...(p.tags||[])].join(' ').toLowerCase().includes(q)));}
function renderPlaces(){
  $('#contentPanel').innerHTML='<div class="toolbar"><div class="segmented" aria-label="장소 목록"><button class="'+(ui.scope==='all'?'active':'')+'" data-action="scope" data-value="all" aria-pressed="'+(ui.scope==='all')+'">내 장소</button><button class="'+(ui.scope==='saved'?'active':'')+'" data-action="scope" data-value="saved" aria-pressed="'+(ui.scope==='saved')+'">저장한 곳 '+data().savedIds.length+'</button></div><div class="search-wrap">'+icon('search')+'<input id="placeSearch" type="search" placeholder="장소 이름이나 지역 검색" aria-label="장소 이름이나 지역 검색" value="'+esc(ui.query)+'"></div><button class="button primary" data-action="new-place">'+icon('plus')+'장소 추가</button></div><div class="filter-row" aria-label="장소 종류">'+[['all','전체'],['sight','관광·산책'],['food','맛집'],['cafe','카페'],['shop','쇼핑'],['hotel','숙소']].map(([v,n])=>'<button class="filter-chip '+(ui.category===v?'active':'')+'" data-action="category" data-value="'+v+'" aria-pressed="'+(ui.category===v)+'">'+n+'</button>').join('')+'<div class="filters-more"><select id="paymentFilter" aria-label="결제 수단 필터"><option value="all">결제 수단 전체</option><option value="card" '+(ui.payment==='card'?'selected':'')+'>카드 가능 확인</option><option value="cash" '+(ui.payment==='cash'?'selected':'')+'>현금 필요</option><option value="unknown" '+(ui.payment==='unknown'?'selected':'')+'>확인 필요</option></select></div></div><div class="result-line"><span id="resultCount"></span><button class="view-map-mobile" data-action="open-map">'+icon('pin')+'지도 보기</button></div><div id="placeGrid" class="place-grid"></div><p class="little-note">Google 지도에서 장소 공유 링크를 복사해 추가하세요. 장소 이름과 주소를 함께 입력하면 경로가 더 정확해져요.<br>실시간 길찾기와 교통요금은 Google 지도에서 확인해요.</p>';
  renderPlaceResults();
}
function renderPlaceResults(){
  const list=filteredPlaces();$('#resultCount').innerHTML='<b>'+list.length+'곳</b> '+(ui.scope==='saved'?'저장한 장소':'· '+city().name+'에서 둘러볼 곳');
  $('#placeGrid').innerHTML=list.length?list.map(p=>{const saved=data().savedIds.includes(p.id),visited=data().visitedIds.includes(p.id);return '<article class="place-card '+(p.id===ui.selected?'selected':'')+'" data-place-id="'+esc(p.id)+'"><div class="place-top">'+badge(p)+'<button class="icon-button '+(saved?'liked':'')+'" data-action="save-place" data-id="'+esc(p.id)+'" aria-label="'+esc(p.name)+(saved?' 저장 취소':' 저장')+'" aria-pressed="'+saved+'">'+icon('heart')+'</button></div><button class="place-body" data-action="select-place" data-id="'+esc(p.id)+'" aria-label="'+esc(p.name)+' 지도와 상세 보기"><p class="place-area">'+esc(p.area||city().name)+'</p><h3>'+esc(p.name)+'</h3><p class="place-note">'+esc(p.note||'마음에 드는 이유를 메모해 두세요.')+'</p></button><div class="place-bottom"><button class="visit '+(visited?'done':'')+'" data-action="visit" data-id="'+esc(p.id)+'" aria-pressed="'+visited+'" aria-label="'+esc(p.name)+' 방문 체크">'+icon('circlecheck')+(visited?'다녀왔어요':'방문 체크')+'</button><button class="add-plan" data-action="add-plan" data-id="'+esc(p.id)+'" aria-label="'+esc(p.name)+' 일정에 추가">'+icon('plus')+'일정에 추가</button></div></article>';}).join(''):'<div class="empty"><span class="empty-icon">'+icon(ui.scope==='saved'?'heart':'search')+'</span><h3>'+(ui.scope==='saved'?'여행의 첫 장소를 담아볼까요?':'조건에 맞는 장소가 없어요')+'</h3><p>'+(ui.scope==='saved'?'둘러볼 곳에서 하트를 누르거나<br>찾아둔 장소를 직접 추가해 보세요.':'검색어나 필터를 바꾸거나<br>마음에 둔 장소를 직접 추가해 보세요.')+'</p><button class="button soft" data-action="'+(ui.scope==='saved'?'show-all':'new-place')+'">'+(ui.scope==='saved'?'장소 추가하기':'장소 직접 추가')+'</button></div>';
}
function renderMap(){
  const hotel=ui.selected==='hotel'&&data().trip.hotel;
  const p=hotel?{id:'hotel',name:data().trip.hotel,category:'hotel',area:city().name,note:'여행의 시작과 끝을 함께할 숙소예요.',query:data().trip.hotelQuery||data().trip.hotel+' '+city().en,mapUrl:'',payment:'unknown',facility:'unknown'}:placeById(ui.selected);
  const q=mapQuery(p||city().query), name=p?p.name:city().name+' 한눈에';
  $('#mapPanel').classList.toggle('mobile-open',ui.mapOpen);
  $('#mapPanel').innerHTML='<div class="map-heading"><div><p class="eyebrow">ON THE MAP</p><h3>'+esc(name)+'</h3></div><span>'+icon('pin')+'</span><button class="icon-button map-close" data-action="close-map" aria-label="지도 닫기">'+icon('close')+'</button></div><div class="map-frame-wrap"><iframe title="'+esc(name)+' Google 지도" src="https://www.google.com/maps?hl=ko&q='+encodeURIComponent(q)+'&z=14&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><p class="map-hint">지도가 보이지 않으면 아래 Google 지도 버튼으로 열어주세요.</p><div class="map-content">'+(p?'<p class="area">'+esc(p.area||city().name)+'</p>'+badge(p)+'<p class="map-description">'+esc(p.note||city().subtitle)+'</p>':'<p class="map-description">'+esc(city().subtitle)+'</p>')+'<div class="map-actions">'+link(p?placeUrl(p):searchUrl(q),'Google 지도 '+icon('arrow'),'button primary')+(p&&!hotel?'<button class="button" data-action="add-plan" data-id="'+esc(p.id)+'">'+icon('plus')+'일정 추가</button>':'')+'</div>'+(p?'<div class="detail-info"><div class="detail-row"><span>결제 방식</span><span>'+({card:'공식 안내 / 입력 내용 확인',cash:'현금 필요',unknown:'확인 필요'}[p.payment]||'확인 필요')+'</span></div><div class="detail-row"><span>화장실·시설</span><span>'+(p.facility==='confirmed'?'직접 확인한 곳':'방문 전 확인')+'</span></div><div class="detail-row"><span>영업시간·가격</span><span>방문일 기준 확인</span></div></div>'+(p.paymentNote?'<p class="little-note">'+esc(p.paymentNote)+'</p>':'')+(!hotel?'<div class="detail-note"><label for="placeNote">예약·방문 메모</label><textarea id="placeNote" data-place="'+esc(p.id)+'" maxlength="5000" placeholder="먹고 싶은 메뉴, 예약할 것, 보고 싶은 매장…">'+esc(data().placeNotes[p.id]||'')+'</textarea></div><div class="detail-footer">'+(p.sourceUrl?link(p.sourceUrl,'공식 안내 ↗'):'<span>직접 추가한 장소</span>')+(data().customPlaces.some(x=>x.id===p.id)?'<button class="button quiet" data-action="edit-place" data-id="'+esc(p.id)+'">'+icon('edit')+'수정</button>':'<span>장소별 조건 확인</span>')+'</div>':''):'')+'</div>';
}

function legMarkup(a,b,label='이동시간 확인'){
  const modes=[['transit','train','대중교통'],['walking','walk','도보'],['driving','car','차량']];
  let pairs;
  for(const [from,to] of [[placeQuery(a),placeQuery(b)],[[a.nameEn||a.name,city().en,'Japan'].filter(Boolean).join(' '),[b.nameEn||b.name,city().en,'Japan'].filter(Boolean).join(' ')]]){
    try{pairs=modes.map(([mode,symbol,name])=>link(directionsUrl(from,to,mode),icon(symbol)+name)).join('');break;}catch{}
  }
  if(!pairs)pairs=link(placeUrl(a),icon('pin')+'출발지 지도')+link(placeUrl(b),icon('pin')+'도착지 지도')+'<span>지도 검색어를 짧게 수정하면 길찾기를 열 수 있어요.</span>';
  return '<div class="leg"><span>'+esc(label)+'</span>'+pairs+'</div>';
}
function renderPlan(){
  const items=dayItems(), t=data().trip, valid=items.filter(item=>placeById(item.placeId));
  let cards=items.map((item,i)=>{const p=placeById(item.placeId),prev=i>0?placeById(items[i-1].placeId):null;return (prev&&p?legMarkup(prev,p):'')+'<article class="schedule-card"><div class="schedule-order"><span class="number">'+String(i+1).padStart(2,'0')+'</span><div class="order-actions"><button class="icon-button" data-action="move-plan" data-id="'+esc(item.id)+'" data-direction="up" '+(i===0?'disabled':'')+' aria-label="'+esc(p?.name||'장소')+' 위로 이동">'+icon('up')+'</button><button class="icon-button" data-action="move-plan" data-id="'+esc(item.id)+'" data-direction="down" '+(i===items.length-1?'disabled':'')+' aria-label="'+esc(p?.name||'장소')+' 아래로 이동">'+icon('down')+'</button></div></div><div class="schedule-main"><div class="schedule-head"><button data-action="select-place" data-id="'+esc(item.placeId)+'"><span class="time">'+(item.time?esc(item.time):'시간 미정')+(item.duration?' · '+item.duration+'분 머물기':'')+'</span><h4>'+esc(p?.name||'찾을 수 없는 장소')+'</h4></button><button class="icon-button" data-action="edit-plan" data-id="'+esc(item.id)+'" aria-label="'+esc(p?.name||'일정')+' 일정 수정">'+icon('edit')+'</button></div><div class="schedule-meta">'+(p?badge(p):'')+'<span>'+esc(p?.area||city().name)+'</span><button data-action="visit" data-id="'+esc(item.placeId)+'">'+(data().visitedIds.includes(item.placeId)?'✓ 방문 완료':'방문 체크')+'</button><button data-action="remove-plan" data-id="'+esc(item.id)+'">일정에서 빼기</button></div>'+(item.note?'<p class="schedule-note">'+esc(item.note)+'</p>':'')+'</div></article>';}).join('');
  let routes='';if(valid.length>1){try{const links=routeLinks(valid.map(x=>mapQuery(placeById(x.placeId))),'walking');routes='<div class="route-bar"><p>방문 순서대로 도보 동선 보기<br><small>대중교통 예상시간은 각 구간에서 확인해요.</small></p><div class="route-links">'+links.map((r,i)=>link(r.url,(links.length>1?(r.fromIndex+1)+'–'+(r.toIndex+1)+'번':'오늘의 도보 동선')+' ↗','button soft')).join('')+'</div></div>';}catch(e){routes='<p class="little-note">'+esc(e.message)+'</p>';}}
  const hotel=t.hotel?{name:t.hotel,query:t.hotelQuery||t.hotel+' '+city().en}:null;
  let timeWarning=false,last='';items.forEach(x=>{if(x.time){if(last&&x.time<last)timeWarning=true;last=x.time;}});
  $('#contentPanel').innerHTML='<div class="day-nav" aria-label="여행 일차">'+Array.from({length:t.days},(_,i)=>'<button class="day-button '+(ui.day===i+1?'active':'')+'" data-action="day" data-day="'+(i+1)+'" aria-pressed="'+(ui.day===i+1)+'"><strong>'+(i+1)+'일차</strong><small>'+(t.startDate?esc(dayLabel(t.startDate,i+1)):data().plan.filter(x=>x.day===i+1).length+'개 일정')+'</small></button>').join('')+(t.days<30?'<button class="day-button add-day" data-action="add-day" aria-label="여행 하루 추가">'+icon('plus')+'</button>':'')+'</div><div class="plan-top"><div><h3>'+ui.day+'일차, '+city().name+'에서.</h3><p>'+items.length+'곳 · '+(t.startDate?esc(dayLabel(t.startDate,ui.day)):'날짜는 나중에 정해도 괜찮아요.')+'</p></div><div class="plan-top-actions"><button class="button print-button" data-action="print" aria-label="현재 일차 일정 인쇄">'+icon('print')+'</button><button class="button primary" data-action="pick-place">'+icon('plus')+'일정 추가</button></div></div><div class="city-hotel">'+icon('hotel')+'<span>'+esc(t.hotel||'숙소를 정하면 이동의 기준점이 돼요.')+'</span><button data-action="'+(t.hotel?'hotel':'settings')+'">'+(t.hotel?'지도 보기':'숙소 입력')+'</button></div>'+(timeWarning?'<p class="save-warning">입력한 시간이 방문 순서와 달라요. 순서나 시간을 확인해 주세요.</p>':'')+(hotel&&valid.length?legMarkup(hotel,placeById(valid[0].placeId),'숙소 → 첫 장소'):'')+'<div class="schedule-list">'+(cards||'<div class="empty"><span class="empty-icon">'+icon('route')+'</span><h3>아직 비어 있는 하루예요.</h3><p>Google 지도에서 찾은 장소를 넣고<br>위아래 버튼으로 방문 순서를 정해보세요.</p><button class="button soft" data-action="pick-place">첫 일정 추가하기</button></div>')+'</div>'+(hotel&&valid.length?legMarkup(placeById(valid.at(-1).placeId),hotel,'마지막 장소 → 숙소'):'')+routes+'<p class="little-note">출발 시각과 체류 시간은 직접 정한 계획이에요. 실제 이동시간·운행편은 Google 지도에서 확인해요.<br>입력한 순서가 길찾기에 반영돼요. 도보 경로는 긴 일정일 때 구간을 나누어 열어요.</p>';
}

function renderPrep(){const d=data(),done=d.checklist.filter(c=>c.checked).length;$('#contentPanel').innerHTML='<div class="prep-grid"><section class="panel"><div class="panel-heading"><h3>출발 전 체크리스트</h3><small>'+done+' / '+d.checklist.length+' 완료</small></div><div class="progress-bar" aria-hidden="true"><span style="width:'+(d.checklist.length?done/d.checklist.length*100:0)+'%"></span></div><div class="checklist">'+d.checklist.map(c=>'<div class="check-row '+(c.checked?'done':'')+'"><label><input type="checkbox" data-check="'+esc(c.id)+'" '+(c.checked?'checked':'')+'><span>'+esc(c.title)+'</span></label><button class="icon-button" data-action="remove-check" data-id="'+esc(c.id)+'" aria-label="'+esc(c.title)+' 삭제">'+icon('close')+'</button></div>').join('')+'</div><form class="check-add" data-form="check"><input name="title" required maxlength="250" aria-label="추가할 준비물" placeholder="챙길 것을 추가해요"><button class="button soft" type="submit">추가</button></form></section><section class="panel"><div class="panel-heading"><h3>'+city().name+' 여행 메모</h3><small>입력하면 자동저장</small></div><textarea id="tripMemo" class="memo-textarea" maxlength="30000" aria-label="여행 메모" placeholder="이번 여행에서 하고 싶은 것\n\n먹어보고 싶은 메뉴\n사고 싶은 물건\n알아둘 교통편\n동행과 나눈 이야기">'+esc(d.memo)+'</textarea><div class="prep-notes">'+icon('note')+'<span>도시마다 메모와 준비물이 따로 저장돼요.<br>구체적인 방문 조건과 예약 내역을 함께 적어두세요.</span></div></section></div>';}
function renderBudget(){
 const d=data(),spent=d.expenses.reduce((s,e)=>s+e.amount,0),budget=d.trip.budgetYen,remain=budget-spent,rate=d.trip.exchangeRate;
 const totals=Object.fromEntries(Object.keys(expName).map(k=>[k,d.expenses.filter(e=>e.category===k).reduce((s,e)=>s+e.amount,0)]));
 const convert=v=>rate>0?'약 '+won(yenToWon(v,rate)):'환율을 입력하면 원화도 보여요';
 $('#contentPanel').innerHTML='<div class="toolbar"><p class="city-subtitle">교통·식사·숙박·쇼핑 예상 비용을 직접 입력해 합산해요.</p><button class="button" data-action="budget-settings">'+icon('edit')+'예산·환율 설정</button></div><div class="budget-stats"><div class="budget-stat"><label>전체 예산</label><strong>'+(budget>0?money(budget):'미설정')+'</strong><small>'+(budget>0?convert(budget):'여행 예산을 입력해 주세요')+'</small></div><div class="budget-stat tint"><label>입력한 비용 합계</label><strong>'+money(spent)+'</strong><small>'+convert(spent)+'</small></div><div class="budget-stat '+(budget>0&&remain<0?'over':'')+'"><label>'+(budget>0&&remain<0?'초과한 금액':'남은 예산')+'</label><strong>'+(budget>0?money(Math.abs(remain)):'—')+'</strong><small>'+(budget>0?convert(Math.abs(remain)):'예산을 설정하면 계산돼요')+'</small></div></div><div class="budget-grid"><section class="panel"><div class="panel-heading"><h3>예상·실제 비용 내역</h3><button class="button primary compact" data-action="new-expense">'+icon('plus')+'비용 추가</button></div><div class="expense-list">'+(d.expenses.length?[...d.expenses].reverse().map(e=>'<div class="expense-row"><span>'+icon(expIcon[e.category])+'</span><div><h4>'+esc(e.title)+'</h4><small>'+expName[e.category]+'</small></div><b>'+money(e.amount)+'</b><button class="icon-button" data-action="edit-expense" data-id="'+esc(e.id)+'" aria-label="'+esc(e.title)+' 지출 수정">'+icon('edit')+'</button><button class="icon-button danger" data-action="remove-expense" data-id="'+esc(e.id)+'" aria-label="'+esc(e.title)+' 지출 삭제">'+icon('trash')+'</button></div>').join(''):'<div class="empty"><span class="empty-icon">'+icon('wallet')+'</span><h3>첫 지출을 기록해 보세요.</h3><p>숙박비부터 커피 한 잔까지,<br>직접 입력한 금액만 더해요.</p></div>')+'</div></section><section class="panel"><div class="panel-heading"><h3>어디에 썼을까?</h3><small>엔화 기준</small></div><div class="category-totals">'+Object.keys(totals).map(k=>'<div><div class="category-total-head"><span>'+expName[k]+'</span><span>'+money(totals[k])+'</span></div><div class="category-track"><span style="width:'+(spent?totals[k]/spent*100:0)+'%"></span></div></div>').join('')+'</div><p class="budget-info">'+(rate>0?'직접 입력한 환율: 100엔 = '+won(rate*100)+'<br>':'')+'환율은 실시간으로 갱신되지 않아요.<br>실제 카드 청구액·환전 수수료와 다를 수 있어요.</p></section></div>';
}

function openDialog(title,html){
  if(!$('#dialog').open)dialogReturnFocus=document.activeElement;
  $('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=html;fillIcons();
  if(!$('#dialog').open)$('#dialog').showModal();
}
function closeDialog(){pendingImport=null;$('#dialog').close();if(dialogReturnFocus?.isConnected)dialogReturnFocus.focus();}
const options=(obj,current)=>Object.entries(obj).map(([v,n])=>'<option value="'+esc(v)+'" '+(v===current?'selected':'')+'>'+esc(n)+'</option>').join('');
const errorSlot='<p class="error-message" id="formError" role="alert"></p>';
const formFooter=(label='저장하기')=>errorSlot+'<div class="form-footer"><button class="button" type="button" data-action="close-dialog">취소</button><button class="button primary" type="submit">'+label+'</button></div>';
function placeForm(existing){
 const p=existing||{name:'',category:'sight',area:'',query:'',mapUrl:'',note:'',payment:'unknown',facility:'unknown'};
 openDialog(existing?'장소 정보 수정':'가고 싶은 장소 추가','<form data-form="place" data-id="'+esc(existing?.id||'')+'"><div class="form-grid"><div class="field full"><label for="placeName">장소 이름 *</label><input id="placeName" name="name" required maxlength="180" placeholder="예: 식당 이름 또는 호텔 이름" value="'+esc(p.name)+'"></div><div class="field"><label for="placeCategory">종류</label><select id="placeCategory" name="category">'+options(catName,p.category)+'</select></div><div class="field"><label for="placeArea">지역·동네</label><input id="placeArea" name="area" maxlength="150" placeholder="예: 텐진" value="'+esc(p.area)+'"></div><div class="field full"><label for="placeQuery">Google 지도에서 찾을 이름·주소</label><input id="placeQuery" name="query" maxlength="500" placeholder="일본어 이름이나 정확한 주소를 적어주세요" value="'+esc(p.query)+'"><small>비워두면 장소 이름과 도시로 검색해요. 지도에서 정확한 지점인지 확인해 주세요.</small></div><div class="field full"><label for="placeMapUrl">Google 지도 공유 링크 (권장)</label><input id="placeMapUrl" name="mapUrl" type="url" maxlength="2048" placeholder="https://maps.app.goo.gl/…" value="'+esc(p.mapUrl)+'"><small>maps.app.goo.gl 공유 링크를 붙여넣으세요. 단축 링크에서 장소 이름을 자동 추출하지는 못하므로 장소 이름·주소도 입력해 주세요.</small></div><div class="field full"><label for="placeDescription">어떤 곳인지 한 줄 메모</label><textarea id="placeDescription" name="note" maxlength="5000" placeholder="먹고 싶은 메뉴, 예약 방법, 방문할 이유…">'+esc(p.note)+'</textarea></div><div class="field"><label for="placePayment">결제 수단</label><select id="placePayment" name="payment">'+options({unknown:'아직 확인하지 않음',card:'카드 가능 확인',cash:'현금 필요'},p.payment)+'</select></div><div class="field"><label for="placeFacility">화장실·시설</label><select id="placeFacility" name="facility">'+options({unknown:'아직 확인하지 않음',confirmed:'직접 확인한 곳'},p.facility)+'</select></div></div>'+formFooter(existing?'수정 저장':'내 장소로 저장')+'</form>');
}
function settingsForm(){const t=data().trip;openDialog(city().name+' 여행 설정','<form data-form="settings"><div class="form-grid"><div class="field"><label for="startDate">출발 날짜</label><input id="startDate" name="startDate" type="date" value="'+esc(t.startDate)+'"><small>아직 미정이면 비워두세요.</small></div><div class="field"><label for="tripDays">여행 일수</label><input id="tripDays" name="days" type="number" min="1" max="30" step="1" required value="'+t.days+'"><small>1~30일로 구성할 수 있어요.</small></div><div class="field full"><label for="hotelName">숙소 이름</label><input id="hotelName" name="hotel" maxlength="200" placeholder="숙소를 정하면 적어주세요" value="'+esc(t.hotel)+'"></div><div class="field full"><label for="hotelQuery">숙소의 지도 검색어·주소</label><input id="hotelQuery" name="hotelQuery" maxlength="500" placeholder="같은 이름의 숙소를 구분할 수 있는 주소" value="'+esc(t.hotelQuery)+'"></div></div><p class="form-note">도시별로 날짜와 숙소를 따로 설정해요. 이미 일정이 있는 날보다 여행 일수를 줄일 수는 없어요.</p>'+formFooter()+'</form>');}
function planForm(placeId,item){
 const p=placeById(placeId);if(!p){toast('이 장소를 찾을 수 없어요.');return;}
 openDialog(item?'일정 수정':'일정에 추가','<form data-form="plan" data-id="'+esc(item?.id||'')+'" data-place="'+esc(placeId)+'"><p class="map-description" style="margin-top:0">'+badge(p)+' <strong>'+esc(p.name)+'</strong></p><div class="form-grid"><div class="field"><label for="planDay">방문할 날</label><select id="planDay" name="day">'+Array.from({length:data().trip.days},(_,i)=>'<option value="'+(i+1)+'" '+((item?.day||ui.day)===i+1?'selected':'')+'>'+(i+1)+'일차'+(data().trip.startDate?' · '+esc(dayLabel(data().trip.startDate,i+1)):'')+'</option>').join('')+'</select></div><div class="field"><label for="planTime">방문 시각</label><input id="planTime" name="time" type="time" value="'+esc(item?.time||'')+'"><small>미정이면 비워두세요.</small></div><div class="field full"><label for="planDuration">머무를 시간 (분)</label><input id="planDuration" name="duration" type="number" min="0" max="1440" step="1" required value="'+(item?.duration??60)+'"></div><div class="field full"><label for="planNote">이 일정의 메모</label><textarea id="planNote" name="note" maxlength="5000" placeholder="예약 시간이나 이동할 때 기억할 것">'+esc(item?.note||'')+'</textarea></div></div><p class="form-note">머무를 시간은 직접 정한 계획이에요. 이동시간은 Google 길찾기에서 확인해요.</p>'+formFooter(item?'수정 저장':'일정에 추가')+'</form>');
}
function pickPlace(){const list=[...allPlaces()].sort((a,b)=>Number(data().savedIds.includes(b.id))-Number(data().savedIds.includes(a.id)));openDialog('일정에 넣을 장소','<div class="picker-list">'+list.map(p=>'<button class="picker-item" data-action="add-plan" data-id="'+esc(p.id)+'"><div><h3>'+esc(p.name)+'</h3><p>'+esc(p.area||city().name)+' · '+(data().savedIds.includes(p.id)?'내가 저장한 곳':'둘러볼 곳')+'</p></div>'+icon('plus')+'</button>').join('')+'</div><div class="form-footer"><button class="button soft" data-action="new-place">'+icon('plus')+'장소 직접 추가</button></div>');}
function expenseForm(existing){const e=existing||{title:'',category:'food',amount:''};openDialog(existing?'지출 수정':'지출 추가','<form data-form="expense" data-id="'+esc(existing?.id||'')+'"><div class="form-grid"><div class="field full"><label for="expenseTitle">예상하거나 지출한 항목 *</label><input id="expenseTitle" name="title" required maxlength="180" placeholder="예: 점심, 공항 이동, 호텔" value="'+esc(e.title)+'"></div><div class="field"><label for="expenseCategory">분류</label><select id="expenseCategory" name="category">'+options(expName,e.category)+'</select></div><div class="field"><label for="expenseAmount">금액 (엔) *</label><input id="expenseAmount" name="amount" type="number" inputmode="decimal" required min="0" max="1000000000" step="0.01" value="'+esc(e.amount)+'" placeholder="0"></div></div>'+formFooter(existing?'수정 저장':'비용 기록')+'</form>');}
function budgetSettings(){const t=data().trip;openDialog('예산·환율 설정','<form data-form="budget"><div class="form-grid"><div class="field full"><label for="budgetYen">여행 전체 예산 (엔)</label><input id="budgetYen" name="budgetYen" type="number" inputmode="decimal" min="0" max="1000000000" step="0.01" value="'+(t.budgetYen||'')+'" placeholder="예: 80000"></div><div class="field full"><label for="exchangeRate">100엔당 원화 환율 (원)</label><input id="exchangeRate" name="ratePer100" type="number" inputmode="decimal" min="0" max="100000000" step="0.01" value="'+(t.exchangeRate?t.exchangeRate*100:'')+'" placeholder="직접 확인한 환율을 입력해 주세요"><small>예: 100엔 = 950원이라면 950을 입력해요.</small></div></div><p class="form-note">원화는 직접 입력한 환율로만 계산해요. 실시간 환율이나 카드 수수료는 반영하지 않아요.</p>'+formFooter()+'</form>');}
function helpDialog(){let hasRecovery=false;try{hasRecovery=!!localStorage.getItem(STORAGE_KEY+'-before-import');}catch{}openDialog('여행 노트 사용법','<div class="help-content"><h3>날짜를 정하기 전에도 쓸 수 있어요.</h3><ol><li>위에서 여행할 도시를 고르세요.</li><li>장소의 하트를 누르거나 직접 장소를 추가하세요.</li><li>일정에 추가하고 방문 순서와 시간을 정하세요.</li><li>여행 준비와 지출도 같은 도시 안에서 기록하세요.</li></ol><h3>저장과 공유</h3><p>기록은 지금 사용 중인 기기와 브라우저에 자동저장돼요. 사이트 주소를 공유하면 같은 프로그램을 열 수 있지만, 각자의 여행 기록은 별도로 저장돼요.</p><p>다른 기기에서 이어 쓰려면 <b>백업</b>으로 파일을 내려받고, 다른 기기에서 <b>가져오기</b>를 눌러주세요. 브라우저 데이터를 지우기 전에도 백업해 주세요.</p><h3>Google 지도</h3><p>장소를 누르면 해당 장소를 지도에서 살펴볼 수 있어요. 일정 사이의 도보·대중교통·차량 버튼은 Google 지도에서 그 구간을 열어요. Google에 저장한 목록을 자동으로 가져오거나, 실시간 이동시간을 이곳에 저장하는 기능은 없어요.</p><div class="form-footer"><button class="button soft" data-action="backup">'+icon('download')+'전체 기록 백업</button>'+(hasRecovery?'<button class="button" data-action="restore-before-import">이전 가져오기 되돌리기</button>':'')+'</div></div>');}
function creditsDialog(){openDialog('장소 출처·사진·서체','<div class="help-content"><p>이 버전에는 기본 추천 장소가 없어요. 장소는 직접 추가해 주세요. 장소 상세에서 각 공식 페이지를 열 수 있어요. 확인일: '+CHECKED_AT+'</p>'+CITY_IDS.map(c=>'<div class="credits-item"><strong>'+CITIES[c].name+'</strong>'+link(CITIES[c].photo.sourceUrl,esc(CITIES[c].photo.title))+'<br>'+esc(CITIES[c].photo.author)+' · Wikimedia Commons · '+link(CITIES[c].photo.licenseUrl,esc(CITIES[c].photo.license))+'<br>화면 크기에 맞춰 사진을 잘라 표시했어요.</div>').join('')+'<h3>서체</h3><p>'+link('https://scoreco.net/font/','S-Core Dream · 에스코어드림')+'</p><h3>도시별 참고 링크</h3>'+CITY_IDS.map(c=>'<div class="credits-item"><strong>'+CITIES[c].name+'</strong>'+CITIES[c].places.map(p=>link(p.sourceUrl,esc(p.name))).join(' · ')+'</div>').join('')+'</div>');}
function backup(){const blob=new Blob([makeBackup(state)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='japan-trip-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);toast('4개 도시의 전체 기록을 백업했어요.');}
function importSummary(next,restore=false){pendingImport=next;const saved=CITY_IDS.reduce((n,c)=>n+next.cities[c].savedIds.length,0),plans=CITY_IDS.reduce((n,c)=>n+next.cities[c].plan.length,0);openDialog(restore?'이전 기록으로 되돌리기':'백업 파일 가져오기','<form data-form="import"><div class="backup-preview">후쿠오카 · 삿포로 · 오사카 · 도쿄<br><b>저장한 장소 '+saved+'곳 / 일정 '+plans+'개</b><br>메모·준비물·지출이 함께 복원돼요.</div><p class="form-note">현재 4개 도시의 기록을 이 파일의 내용으로 바꿔요. 가져오기 전 기록은 이 브라우저에서 한 번 되돌릴 수 있어요.</p><div class="form-footer"><button class="button" type="button" data-action="backup">현재 기록 백업</button><button class="button primary" type="submit">'+(restore?'이전 기록으로 복원':'이 내용으로 가져오기')+'</button></div>'+errorSlot+'</form>');}

let undoAction=null;
function removeWithUndo(arrayName,itemId,label){const cityId=state.activeCity,arr=state.cities[cityId][arrayName],index=arr.findIndex(x=>x.id===itemId);if(index<0)return;const [removed]=arr.splice(index,1);persist();render();undoAction=()=>{const target=state.cities[cityId][arrayName];if(!target.some(x=>x.id===removed.id))target.splice(Math.min(index,target.length),0,removed);};if(storageError)return;$('#toast').innerHTML=esc(label)+' <button data-action="undo" style="color:white;text-decoration:underline;margin-left:12px;padding:0">되돌리기</button>';$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),8000);}
const actions={
 'city':b=>{state.activeCity=b.dataset.city;resetUI();persist();render();},
 'tab':b=>{ui.tab=b.dataset.tab;ui.mapOpen=false;render();},
 'scope':b=>{ui.scope=b.dataset.value;renderPlaces();},
 'show-all':()=>{ui.scope='all';ui.category='all';ui.payment='all';ui.query='';renderPlaces();},
 'category':b=>{ui.category=b.dataset.value;renderPlaces();},
 'select-place':b=>{if(!placeById(b.dataset.id))return;ui.selected=b.dataset.id;ui.mapOpen=true;if(ui.tab==='places')renderPlaceResults();renderMap();},
 'save-place':b=>{const ids=data().savedIds,k=b.dataset.id,i=ids.indexOf(k);if(i>=0)ids.splice(i,1);else ids.push(k);persist();renderHeader();if(ui.tab==='places')renderPlaces();if(!storageError)toast(i>=0?'저장한 곳에서 뺐어요.':'가고 싶은 곳에 저장했어요.');},
 'visit':b=>{const ids=data().visitedIds,k=b.dataset.id,i=ids.indexOf(k);if(i>=0)ids.splice(i,1);else ids.push(k);persist();if(ui.tab==='places')renderPlaceResults();if(ui.tab==='plan')renderPlan();},
 'open-map':()=>{ui.mapOpen=true;renderMap();},
 'close-map':()=>{ui.mapOpen=false;$('#mapPanel').classList.remove('mobile-open');},
 'new-place':()=>placeForm(),
 'edit-place':b=>placeForm(data().customPlaces.find(x=>x.id===b.dataset.id)),
 'settings':settingsForm,
 'close-dialog':closeDialog,
 'add-plan':b=>planForm(b.dataset.id),
 'edit-plan':b=>{const item=data().plan.find(x=>x.id===b.dataset.id);if(item)planForm(item.placeId,item);},
 'pick-place':pickPlace,
 'day':b=>{ui.day=Number(b.dataset.day);const first=dayItems()[0];if(first)ui.selected=first.placeId;renderPlan();renderMap();},
 'add-day':()=>{if(data().trip.days>=30)return;data().trip.days++;ui.day=data().trip.days;persist();render();},
 'move-plan':b=>{const list=dayItems(),i=list.findIndex(x=>x.id===b.dataset.id),next=i+(b.dataset.direction==='up'?-1:1);if(i<0||next<0||next>=list.length)return;const a=data().plan.indexOf(list[i]),z=data().plan.indexOf(list[next]);[data().plan[a],data().plan[z]]=[data().plan[z],data().plan[a]];persist();renderPlan();},
 'remove-plan':b=>removeWithUndo('plan',b.dataset.id,'일정에서 뺐어요.'),
 'hotel':()=>{ui.selected='hotel';ui.mapOpen=true;renderMap();},
 'remove-check':b=>removeWithUndo('checklist',b.dataset.id,'준비물을 목록에서 뺐어요.'),
 'new-expense':()=>expenseForm(),
 'edit-expense':b=>expenseForm(data().expenses.find(e=>e.id===b.dataset.id)),
 'remove-expense':b=>removeWithUndo('expenses',b.dataset.id,'지출을 삭제했어요.'),
 'budget-settings':budgetSettings,
 'backup':backup,
 'import':()=>$('#importFile').click(),
 'restore-before-import':()=>{const raw=localStorage.getItem(STORAGE_KEY+'-before-import');if(raw)importSummary(sanitizeState(JSON.parse(raw)),true);else toast('되돌릴 기록이 없어요.');},
 'help':helpDialog,
 'credits':creditsDialog,
 'print':()=>window.print(),
 'undo':()=>{if(undoAction){undoAction();undoAction=null;persist();render();if(!storageError)toast('되돌렸어요.');}}
};

document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b&&!b.disabled){const action=actions[b.dataset.action];if(action){event.preventDefault();try{action(b);}catch(e){toast(e.message||'작업을 마치지 못했어요.');}}}});
$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
$('#dialog').addEventListener('close',()=>{if(!$('#dialog').open)pendingImport=null;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.mapOpen&&!$('#dialog').open){ui.mapOpen=false;$('#mapPanel').classList.remove('mobile-open');}});
document.addEventListener('input',e=>{
 if(e.target.id==='placeSearch'){ui.query=e.target.value;renderPlaceResults();}
 if(e.target.id==='placeNote'){data().placeNotes[e.target.dataset.place]=e.target.value;persist();}
 if(e.target.id==='tripMemo'){data().memo=e.target.value;persist();}
});
document.addEventListener('change',e=>{
 if(e.target.id==='paymentFilter'){ui.payment=e.target.value;renderPlaceResults();}
 if(e.target.dataset.check){const check=data().checklist.find(c=>c.id===e.target.dataset.check);if(check){check.checked=e.target.checked;persist();renderPrep();}}
});
$('#importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('2MB 이하의 백업 파일을 선택해 주세요.');const next=parseBackup(await file.text());importSummary(next);}catch(error){toast(error.message);}finally{e.target.value='';}});
document.addEventListener('submit',event=>{
 const form=event.target;if(!form.dataset.form)return;event.preventDefault();const f=Object.fromEntries(new FormData(form));
 try{
  let next=structuredClone(state),d=next.cities[next.activeCity],message='저장했어요.',stayOnPage=false;
  switch(form.dataset.form){
   case 'settings': {const maxDay=Math.max(1,...d.plan.map(p=>p.day));if(Number(f.days)<maxDay)throw new Error(maxDay+'일차에 일정이 있어요. 해당 일정을 옮긴 뒤 일수를 줄여주세요.');Object.assign(d.trip,{startDate:f.startDate,days:Number(f.days),hotel:f.hotel.trim(),hotelQuery:f.hotelQuery.trim()});message='여행 설정을 저장했어요.';break;}
   case 'place': {if(f.mapUrl&&!safeUrl(f.mapUrl))throw new Error('올바른 https:// 지도 링크를 입력해 주세요.');const key=form.dataset.id||id('custom'),existing=d.customPlaces.find(p=>p.id===key),p={id:key,name:f.name.trim(),nameEn:existing?.nameEn||'',category:f.category,area:f.area.trim(),query:f.query.trim()||f.name.trim()+' '+city().en+' Japan',mapUrl:f.mapUrl.trim(),note:f.note,payment:f.payment,facility:f.facility,sourceUrl:existing?.sourceUrl||''};if(existing)d.customPlaces[d.customPlaces.indexOf(existing)]=p;else d.customPlaces.push(p);if(!d.savedIds.includes(key))d.savedIds.push(key);ui.selected=key;ui.scope='saved';ui.category='all';ui.query='';ui.payment='all';ui.tab='places';message=existing?'장소 정보를 수정했어요.':'내 장소로 저장했어요.';break;}
   case 'plan': {const key=form.dataset.id||id('plan'),old=d.plan.find(p=>p.id===key),item={id:key,placeId:form.dataset.place,day:Number(f.day),time:f.time,duration:Number(f.duration),note:f.note};if(old)d.plan[d.plan.indexOf(old)]=item;else d.plan.push(item);if(!d.savedIds.includes(item.placeId))d.savedIds.push(item.placeId);ui.day=item.day;ui.selected=item.placeId;message=old?'일정을 수정했어요.':item.day+'일차 일정에 추가했어요.';break;}
   case 'expense': {const key=form.dataset.id||id('expense'),old=d.expenses.find(e=>e.id===key),item={id:key,title:f.title.trim(),category:f.category,amount:Number(f.amount)};if(old)d.expenses[d.expenses.indexOf(old)]=item;else d.expenses.push(item);message='지출을 기록했어요.';break;}
   case 'budget': d.trip.budgetYen=Number(f.budgetYen)||0;d.trip.exchangeRate=(Number(f.ratePer100)||0)/100;message='예산과 환율을 저장했어요.';break;
   case 'check': d.checklist.push({id:id('check'),title:f.title.trim(),checked:false});stayOnPage=true;message='준비물에 추가했어요.';break;
   case 'import': if(!pendingImport)throw new Error('가져올 파일을 다시 선택해 주세요.');try{localStorage.setItem(STORAGE_KEY+'-before-import',JSON.stringify(state));}catch{throw new Error('되돌리기용 기록을 보관할 공간이 없어요. 현재 기록을 백업한 뒤 브라우저 저장 공간을 확인해 주세요.');}next=pendingImport;resetUI();message='4개 도시의 여행 기록을 가져왔어요.';break;
   default:return;
  }
  state=sanitizeState(next);persist();if(!stayOnPage)closeDialog();render();if(!storageError)toast(message);
 }catch(error){const slot=form.querySelector('.error-message');if(slot)slot.textContent=error.message;else toast(error.message);}
});

try{render();if(recoveredError)toast(recoveredError);}catch(error){$('#contentPanel').innerHTML='<div class="empty"><h3>여행 노트를 열지 못했어요.</h3><p>'+esc(error.message)+'</p><button class="button" data-action="import">백업 파일 가져오기</button></div>';}
