// Rebuild both web resumes and all public PDF files after profile changes.
const fs=require('fs'),vm=require('vm'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
for(const en of [false,true]){
 const ctx={window:{}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,en?'profile.en.js':'profile.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'resume-render.js'),'utf8'),ctx);
 const dest=path.join(root,en?'en/resume/index.html':'resume/index.html');
 const page=fs.readFileSync(dest,'utf8').replace(/(<main class="cv-sheet" id="resume-content">)[\s\S]*?(<\/main>)/,(_,start,end)=>start+ctx.window.renderResume(ctx.window.PUBLIC_PROFILE,en)+end);
 fs.writeFileSync(dest,page);
}
const result=spawnSync(process.env.PYTHON||'python3',[path.join(__dirname,'build-public-pdfs.py')],{cwd:root,stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
