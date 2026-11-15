# Soyeon Lee — public portfolio

## 내 사이트 모음

[내 사이트 모음 열기](https://lsy7791120110.github.io/start/)

포트폴리오, LIFE PLANNER, 취업 대시보드와 수업 도구의 바로가기를 모았습니다.
일부 도구는 기존 계정 로그인이 필요합니다.

Bilingual portfolio and public CV.

Live: https://lsy7791120110.github.io/
English: https://lsy7791120110.github.io/en/

GitHub Pages: Deploy from a branch → main → / (root).

Private contact information and instructor-only materials are excluded.


## Future teaching portfolio

The teaching portfolio is currently **unpublished**. `site-config.js` has
`teaching.enabled: false` and `publishedPages: null`. No teaching page,
draft, asset, or private material is included in this repository. The
empty navigation mount occupies no space and does not request teaching content.

When the owner explicitly requests publication:
1. Review and approve the instructor content for public release.
2. Create the Korean and English pages (planned paths: `/teaching/` and
   `/en/teaching/`) and approved public assets.
3. Set `publishedPages` to `{ko: "/teaching/", en: "/en/teaching/"}`
   and then set `enabled: true` in `site-config.js`.
4. Update the config script version in both main HTML pages, deploy, and
   verify both category links on desktop and mobile.
5. Include matching category navigation and language links in the new pages.

The switch controls navigation visibility only; it is not access control.
Never upload private drafts to this public repository. Disabling the switch
after a page has been published does not make that page or its Git history private.

## Resume downloads and profile updates

The portfolio is shared across applications. It lists industries of interest;
there is no target-role list. Resumes contain no employer-specific objective.

Application-ready PDFs are available without sign-in:

- Korean: `/files/Soyeon-Lee-Resume-KO.pdf`
- English: `/files/Soyeon-Lee-Resume-EN.pdf`

Each resume has two A4 pages, selectable text, embedded S-Core Dream fonts and
clickable contact links. `/resume/` and `/en/resume/` remain the web versions.

`profile.js`, `profile.en.js` and `resume-render.js` are the shared source for
both the web resumes and downloadable resumes. After changing the profile:

```sh
python3 -m pip install PyMuPDF fonttools
node scripts/build-public-files.cjs
```

Review both resume PDFs before publishing. Commit updated HTML and PDF outputs
with their source changes. Bump the download/script query versions in the HTML
to refresh cached copies. The build also refreshes the four-page portfolio PDFs
from their printable HTML editions.
