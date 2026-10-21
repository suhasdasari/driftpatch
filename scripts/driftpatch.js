#!/usr/bin/env node
// CLI used by the GitHub Action: scans a directory, rewrites auto-fixable lines in place, writes driftpatch-report.md
const fs=require("fs"),path=require("path"),D=require("../rules.js");
const root=path.resolve(process.argv[2]||"."),write=process.argv.includes("--write");
const EXT=/\.(py|js|ts|mjs|cjs|jsx|tsx|rb|php|go)$/i,SKIP=/^(node_modules|vendor|dist|build|\.git|\.venv|venv|__pycache__)$/;
let all=[],patch="";
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){if(!SKIP.test(e.name))walk(p);} else if(EXT.test(e.name)){const rel=path.relative(root,p),t=fs.readFileSync(p,"utf8"),r=D.scanFile(rel,t);
 all.push(...r.findings); if(r.changed){patch+=D.unifiedDiff(rel,t,r.fixed); if(write) fs.writeFileSync(p,r.fixed);}}}})(root);
const md=`## 🩹 DriftPatch report\n\n${all.length} affected line(s), ${all.filter(f=>f.autofix).length} auto-fixed.\n\n| Location | Change | Fix | Source |\n|---|---|---|---|\n`+all.map(f=>`| \`${f.file}:${f.line}\` | ${f.title} | ${f.autofix?"auto":"manual: "+f.note} | [link](${f.source}) |`).join("\n")+"\n";
fs.writeFileSync(path.join(process.cwd(),"driftpatch-report.md"),md); if(patch) fs.writeFileSync(path.join(process.cwd(),"driftpatch.patch"),patch);
console.log(md); process.exitCode=0;
