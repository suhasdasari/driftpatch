const $=s=>document.querySelector(s); const D=window.DriftPatch;
const EXT=/\.(py|js|ts|mjs|cjs|jsx|tsx|rb|php|go)$/i, SKIP=/(^|\/)(node_modules|vendor|dist|build|\.venv|venv|site-packages|__pycache__)\//;
let patch="", patchName="driftpatch.patch";
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on",x===b));$("#t-repo").classList.toggle("hidden",b.dataset.t!=="repo");$("#t-paste").classList.toggle("hidden",b.dataset.t!=="paste");});
function render(results,label){
  const f=results.flatMap(r=>r.findings), changed=results.filter(r=>r.changed);
  patch=changed.map(r=>D.unifiedDiff(r.path,r.text,r.fixed)).join("");
  $("#summary").innerHTML=`<div class="stats"><div><b>${results.length}</b>files scanned</div><div><b>${f.length}</b>affected lines</div><div><b>${f.filter(x=>x.autofix).length}</b>auto-fixable</div><div><b>${changed.length}</b>files patched</div><div><b>${new Set(f.map(x=>x.provider)).size}</b>providers</div></div>`;
  $("#results").innerHTML=f.length?`<div class="card"><table><tr><th>Location</th><th>Change</th><th>Code</th><th></th></tr>${f.map(x=>`<tr><td>${esc(x.file)}:${x.line}</td><td>${esc(x.title)}${x.note?`<br><small>${esc(x.note)}</small>`:""}<br><a href="${x.source}" target="_blank">source ↗</a></td><td><code>${esc(x.code)}</code></td><td><span class="tag ${x.autofix?"":"m"}">${x.autofix?"auto-fix":"manual"}</span></td></tr>`).join("")}</table></div>`:`<p>No known breaking-change usages found in ${esc(label)}. 🎉</p>`;
  $("#patchBox").classList.toggle("hidden",!patch);
  $("#diff").innerHTML=patch.split("\n").map(l=>{const c=l.startsWith("+++")||l.startsWith("---")?"hunk":l[0]==="+"?"add":l[0]==="-"?"del":l.startsWith("@@")?"hunk":"";return `<span class="${c}">${esc(l)}</span>`}).join("\n");
  document.body.dataset.done="1";
}
$("#dl").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([patch],{type:"text/x-diff"}));a.download=patchName;a.click();};
$("#scanPaste").onclick=()=>{const p=$("#fname").value||"app.py",t=$("#code").value;patchName="driftpatch.patch";const r=D.scanFile(p,t);$("#status").textContent="Scanned pasted code.";render([{path:p,text:t,...r}],p);};
$("#demoBtn").onclick=e=>{e.preventDefault();document.querySelector('[data-t="paste"]').click();$("#fname").value="bot.py";
$("#code").value=`import openai\nopenai.api_key = os.environ["OPENAI_API_KEY"]\n\ndef ask(q):\n    try:\n        r = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[{"role":"user","content":q}])\n        return r["choices"][0]["message"]["content"]\n    except openai.error.RateLimitError:\n        return "slow down"\n\nemb = openai.Embedding.create(model="text-embedding-ada-002", input="hi")\n`;
$("#scanPaste").click();location.hash="scan";};
async function scanRepo(repo){
  repo=repo.trim().replace(/^https?:\/\/github\.com\//,"").replace(/\.git$|\/$/g,"");
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){$("#status").textContent="Enter owner/repo";return;}
  patchName=repo.replace("/","-")+"-driftpatch.patch"; $("#results").innerHTML=$("#summary").innerHTML="";$("#patchBox").classList.add("hidden");
  try{
    $("#status").textContent="Fetching repo metadata…";
    const meta=await (await fetch(`https://api.github.com/repos/${repo}`)).json(); if(!meta.default_branch) throw new Error(meta.message||"repo not found");
    const br=meta.default_branch;
    const tree=await (await fetch(`https://api.github.com/repos/${repo}/git/trees/${br}?recursive=1`)).json(); if(!tree.tree) throw new Error(tree.message||"no tree");
    const files=tree.tree.filter(t=>t.type==="blob"&&EXT.test(t.path)&&!SKIP.test(t.path)&&t.size<400000).slice(0,150);
    const results=[]; let done=0;
    await Promise.all(Array.from({length:8},async()=>{while(files.length){const f=files.shift();
      const text=await (await fetch(`https://raw.githubusercontent.com/${repo}/${br}/${f.path}`)).text();
      results.push({path:f.path,text,...D.scanFile(f.path,text)}); $("#status").textContent=`Scanning ${repo}@${br}… ${++done} files`; }}));
    results.sort((a,b)=>a.path.localeCompare(b.path));
    $("#status").innerHTML=`Scanned <a href="https://github.com/${repo}" target="_blank">${repo}</a>@${br}${tree.truncated?" (tree truncated)":""}.`;
    render(results,repo);
  }catch(e){$("#status").textContent="Error: "+e.message+" (GitHub's unauthenticated limit is 60 requests/hour)";}
}
$("#scanRepo").onclick=()=>scanRepo($("#repo").value);
$("#ruleList").innerHTML=Object.entries(D.PACKS).map(([k,p])=>`<div class="card" style="margin-bottom:12px"><h3>${p.name} <small style="display:inline"><a href="${p.source}" target="_blank">source ↗</a></small></h3><ul>${D.RULES.filter(r=>r.pack===k).map(r=>`<li>${esc(r.title)} ${r.replace!==null?'<span class="tag">auto-fix</span>':'<span class="tag m">flag</span>'} <a href="${r.source}" target="_blank">↗</a></li>`).join("")}</ul></div>`).join("");
const h=new URLSearchParams(location.search); if(h.get("repo")){$("#repo").value=h.get("repo");scanRepo(h.get("repo"));}
