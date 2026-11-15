(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sci=v=>esc(v).replace(/\b(h?)A(2A|2B|1|3)(AR)?\b/g,(_,h,n,r)=>`${h}A<sub>${n}</sub>${r||''}`).replace(/\b(Cs2CO3|K2CO3)\b/g,f=>f.replace(/(\d+)/g,'<sub>$1</sub>')).replace(/\b(1|13|19)(H|C|F)\b/g,'<sup>$1</sup>$2').replace(/\bIC50\b/g,'IC<sub>50</sub>').replace(/\bCH2\b/g,'CH<sub>2</sub>');
  function renderResume(p,en){
    const t=(ko,eng)=>en?eng:ko;
    const lines=a=>a.map(x=>`<li>${sci(x)}</li>`).join('');
    const section=(name,body)=>`<section><h2>${name}</h2>${body}</section>`;
    const item=(title,date,body)=>`<article class="resume-item"><div class="resume-item-head"><h3>${sci(title)}</h3><span>${esc(date)}</span></div>${body}</article>`;
    const contact=p.contact;
    return `<header class="resume-header"><h1>${esc(p.name)}</h1>${!en?`<p class="english-name">${esc(p.englishName)}</p>`:''}<p class="resume-contact"><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a><span> · </span><a href="${esc(contact.linkedin)}">linkedin.com/in/soyeon-lee-558439242</a><span> · </span><a href="${esc(contact.portfolio)}${en?'en/':''}">lsy7791120110.github.io</a></p><p class="resume-summary">${esc(p.resumeSummary)}</p></header>`+
    section(t('학력','EDUCATION'),[p.master,p.bachelor].map((d,i)=>item(d.school,d.period,`<p>${esc([d.degree,d.department,`GPA ${d.gpa}`].filter(Boolean).join(' · '))}</p>${d.field?`<p>${esc(d.field)}</p>`:''}${i===1?`<p>${esc(p.honors.join(' · '))}</p>`:''}`)).join(''))+
    section(t('연구 경험','RESEARCH EXPERIENCE'),p.research.filter(r=>r.type==='research').map(r=>item(r.title,r.period,`<p class="resume-role">${esc(r.tag)}</p><ul>${lines([r.description,r.scope])}</ul>`)).join(''))+
    section(t('경력 및 AI 활용','EXPERIENCE & APPLIED AI'),p.jobs.map(j=>item(j.organization,j.period,`<p class="resume-role">${esc(j.role)}</p><p>${esc(j.description)}</p>`)).join('')+p.research.filter(r=>r.type==='digital').map(r=>`<ul class="ai-achievements">${lines([r.description,...r.sections.filter(s=>s.title===(en?'Textbooks and visual materials':'교재와 시각 자료')).map(s=>s.body)])}</ul>`).join(''))+
    section(t('역량 및 자격','SKILLS & CREDENTIALS'),`<p>${esc(p.labSkills)}</p><p class="software-levels">${p.software.map(s=>`${esc(s.name)} (${esc(s.level)})`).join(' · ')}</p><p>${esc(p.officeSkills)}</p><ul>${lines(p.credentials)}</ul>`)+
    section(t('교육 및 발표','TRAINING & PRESENTATION'),`<ul>${lines(p.training)}</ul><p>${sci(p.poster.title)} · ${esc(p.poster.role)} · ${esc(p.poster.date)}</p>`)+
    section(t('교육멘토링 및 봉사','MENTORING & VOLUNTEERING'),`<p>${esc(p.mentoring.label)}: ${esc(p.mentoring.total)} · ${esc(p.volunteer.label)}: ${esc(p.volunteer.total)}</p>`) +
    `<footer class="resume-footer"><a href="${esc(contact.portfolio)}${en?'en/':''}">${t('연구 상세 및 포트폴리오','Research details and portfolio')} ↗</a></footer>`;
  }
  root.renderResume=renderResume;
  if(typeof document!=='undefined'){
    const p=root.PUBLIC_PROFILE, en=document.documentElement.lang==='en';
    const main=document.querySelector('#resume-content');
    if(main&&p){main.innerHTML=renderResume(p,en);document.title=en?'Soyeon Lee — Resume':'이소연 — 이력서';}
    document.querySelector('#save-resume')?.addEventListener('click',async()=>{await document.fonts.ready;window.print();});
  }
})(typeof window==='undefined'?globalThis:window);

