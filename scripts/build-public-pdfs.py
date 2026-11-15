"""Build selectable-text PDF exports from the public HTML and shared profile data.

Dependencies: PyMuPDF and fonttools. Run through build-public-files.cjs.
S-Core Dream fonts are read from the unchanged WOFF files in assets/fonts.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import base64, html, json, re
import fitz
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parents[1]
FONT_CSS='''
@font-face{font-family:SCore;src:url("regular.otf");font-weight:normal}
@font-face{font-family:SCore;src:url("bold.otf");font-weight:bold}
body{font-family:SCore;color:#17212c;margin:0}
sub,sup{font-size:72%}a{color:#253f59}
'''
RESUME_CSS=FONT_CSS+'''
body{font-size:10pt;line-height:1.42}
h1{font-size:24pt;line-height:1.15;margin:0 0 3pt;font-weight:bold}
h2{font-size:10.5pt;letter-spacing:.3pt;color:#243b53;margin:12pt 0 8pt;padding-top:8pt;border-top:.7pt solid #8695a5;font-weight:bold}
h3{font-size:10.2pt;margin:0 0 2pt;font-weight:bold;line-height:1.4}
p{margin:0 0 3pt}ul{margin:3pt 0 0;padding-left:13pt}li{margin:0 0 3pt}
section{margin:0;padding:0}
.resume-header{margin-bottom:4pt}.english-name{font-size:10pt;color:#465567}
.resume-contact{font-size:8.3pt;line-height:1.5;margin-top:7pt}
.resume-summary{font-size:10pt;margin-top:9pt}
.resume-item{margin:0 0 9pt}.resume-item-head>span{display:block;font-size:8.5pt;color:#465567;margin-bottom:3pt}
.resume-role{font-size:9pt;color:#465567;margin-bottom:2pt}
.resume-footer{font-size:8.5pt;border-top:.7pt solid #8695a5;padding-top:7pt;margin-top:11pt}
.resume-continuation{font-size:10pt;color:#465567;margin-bottom:8pt}
.software-levels{margin:4pt 0}.ai-achievements{margin-top:8pt}
'''
PORTFOLIO_CSS=FONT_CSS+'''
body{font-size:10pt;line-height:1.42;color:#232f3b}
h1,h2{font-size:25pt;line-height:1.16;margin:0 0 10pt;color:#182b40}
h3{font-size:12pt;margin:12pt 0 4pt;color:#22374a}h4{font-size:11pt;margin:7pt 0 3pt;color:#233a50}
p{margin:0 0 5pt}.lede{font-size:11.5pt;margin-bottom:10pt}
.kicker{font-size:8pt;color:#605981;border-top:2pt solid #273b50;padding-top:8pt;margin-bottom:11pt}
.meta,.small{font-size:8.5pt;color:#415368}.rule{border-top:1pt solid #65788b;padding-top:7pt}
.summary{background:#f1effa;border-left:2pt solid #8881ae;padding:7pt 10pt;margin:8pt 0}
.summary strong{font-size:20pt}.summary p{font-size:9pt;margin-top:3pt}
table{border-collapse:collapse;width:100%;margin:4pt 0 7pt}th,td{text-align:left;padding:4pt 3pt;border-bottom:.6pt solid #b7c1cb;vertical-align:top}
th{font-size:9pt;border-bottom:1pt solid #566a7d}.degree-pair td,.result-pair td{width:50%;border:0;padding-right:8pt}
.result-pair strong{font-size:17pt;color:#514d7a}.result-pair p{font-size:9pt}
.bar{width:150pt;height:7pt}.folio{font-size:8pt;border-top:.7pt solid #b7c1cb;padding-top:6pt;margin-top:12pt}
'''

def draw_pdf(output,sections,css,archive,title,lang,resume=False):
    raw=archive/(output.stem+'.raw.pdf')
    writer=fitz.DocumentWriter(str(raw))
    for index,section in enumerate(sections):
        story=fitz.Story(html=section,user_css=css,archive=fitz.Archive(str(archive)))
        rect=fitz.Rect(43,40,552,790 if resume else 800)
        more,filled=story.place(rect)
        if more:raise RuntimeError(f'{output.name}: page {index+1} exceeds A4 content area')
        device=writer.begin_page(fitz.paper_rect('a4'));story.draw(device);writer.end_page()
    writer.close()
    doc=fitz.open(raw)
    url='https://lsy7791120110.github.io/'+('en/' if lang=='EN' else '')
    for index,page in enumerate(doc):
        # Story.draw retains selectable Unicode text. Add explicit clickable contacts.
        targets=[('lsy779112@gmail.com','mailto:lsy779112@gmail.com'),
                 ('linkedin.com/in/soyeon-lee-558439242','https://www.linkedin.com/in/soyeon-lee-558439242/'),
                 ('lsy7791120110.github.io',url)]
        for text,target in targets:
            for rect in page.search_for(text):
                page.insert_link({'kind':fitz.LINK_URI,'from':rect,'uri':target})
        if resume:
            page.draw_line((43,806),(552,806),color=(.72,.76,.80),width=.5)
            page.insert_text((43,820),'Soyeon Lee',fontsize=8,color=(.28,.34,.42))
            page.insert_text((528,820),f'{index+1} / {len(doc)}',fontsize=8,color=(.28,.34,.42))
    doc.set_metadata({'title':title,'author':'Soyeon Lee','subject':'Resume' if resume else 'Portfolio'})
    doc.subset_fonts();doc.save(output,garbage=4,deflate=True);doc.close()
    check=fitz.open(output)
    assert len(check)==len(sections) and all(p.get_text().strip() for p in check)
    print(f'{output.name}: {len(check)} pages, {output.stat().st_size} bytes')

with TemporaryDirectory(prefix='soyeon-public-pdfs-') as temporary:
    archive=Path(temporary)
    for source,target in [('S-CoreDream-4Regular','regular'),('S-CoreDream-6Bold','bold')]:
        font=TTFont(ROOT/f'assets/fonts/{source}.woff');font.flavor=None;font.save(archive/f'{target}.otf')
    for lang in ['KO','EN']:
        cv=ROOT/('en/resume/index.html' if lang=='EN' else 'resume/index.html')
        main=re.search(r'<main class="cv-sheet" id="resume-content">(.*?)</main>',cv.read_text(),re.S)[1]
        pages=main.split('<!-- resume-page-break -->')
        assert len(pages)==2
        pages[1]='<p class="resume-continuation">Soyeon Lee</p>'+pages[1]
        draw_pdf(ROOT/f'files/Soyeon-Lee-Resume-{lang}.pdf',pages,RESUME_CSS,archive,
                 'Soyeon Lee - Resume' if lang=='EN' else '이소연 - 이력서',lang,resume=True)
        source=(ROOT/f'files/Soyeon-Lee-Portfolio-{lang}.html').read_text()
        for i,m in enumerate(list(re.finditer(r'src="data:image/png;base64,([^"]+)"',source))):
            name=f'chart-{lang}-{i}.png';(archive/name).write_bytes(base64.b64decode(m[1]))
            source=source.replace(m[0],f'src="{name}"')
        pages=re.findall(r'<section class="sheet"[^>]*>(.*?)</section>',source,re.S)
        assert len(pages)==4
        draw_pdf(ROOT/f'files/Soyeon-Lee-Portfolio-{lang}.pdf',pages,PORTFOLIO_CSS,archive,
                 f'Soyeon Lee - Portfolio ({lang})',lang)
