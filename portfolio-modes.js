'use strict';
(() => {
  const teaching = window.PORTFOLIO_SECTIONS?.teaching;
  // Fail closed: publish the approved pages before enabling their navigation.
  if (teaching?.enabled !== true || !teaching.publishedPages) return;
  const en = document.documentElement.lang === 'en';
  const page = teaching.publishedPages[en ? 'en' : 'ko'];
  if (typeof page !== 'string' || !/^\/(?!\/)[a-zA-Z0-9/_-]+\/$/.test(page)) return;
  const host = document.getElementById('portfolio-modes');
  if (!host) return;
  const nav = document.createElement('nav');
  nav.className = 'portfolio-modes wrap';
  nav.setAttribute('aria-label', en ? 'Portfolio categories' : '포트폴리오 분야');
  const current = document.createElement('a');
  current.href = en ? '/en/' : '/';
  current.textContent = en ? 'Career portfolio' : '취업 포트폴리오';
  current.setAttribute('aria-current', 'page');
  const instructor = document.createElement('a');
  instructor.href = page;
  instructor.textContent = en ? 'Teaching portfolio' : '강사 포트폴리오';
  nav.append(current, instructor);
  host.replaceChildren(nav);
})();
