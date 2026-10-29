# Soyeon Lee — public portfolio

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
