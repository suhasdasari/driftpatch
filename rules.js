/* DriftPatch rules: every entry is a REAL documented breaking change with its source. */
(function (root) {
const OAI = "https://github.com/openai/openai-python/discussions/742";
const PYD = "https://docs.pydantic.dev/latest/migration/";
const PD2 = "https://pandas.pydata.org/docs/whatsnew/v2.0.0.html";
const STR = "https://docs.stripe.com/upgrades";
const RULES = [
 // OpenAI Python SDK v0 -> v1 (Nov 2023)
 {id:"openai-chatcompletion",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.ChatCompletion.create removed in v1",find:/\bopenai\.ChatCompletion\.a?create\(/g,replace:"client.chat.completions.create(",source:OAI},
 {id:"openai-completion",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Completion.create removed in v1",find:/\bopenai\.Completion\.a?create\(/g,replace:"client.completions.create(",source:OAI},
 {id:"openai-embedding",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Embedding.create removed in v1",find:/\bopenai\.Embedding\.a?create\(/g,replace:"client.embeddings.create(",source:OAI},
 {id:"openai-image",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Image.create → client.images.generate",find:/\bopenai\.Image\.a?create\(/g,replace:"client.images.generate(",source:OAI},
 {id:"openai-image-edit",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Image.create_edit → client.images.edit",find:/\bopenai\.Image\.create_edit\(/g,replace:"client.images.edit(",source:OAI},
 {id:"openai-image-var",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Image.create_variation → client.images.create_variation",find:/\bopenai\.Image\.create_variation\(/g,replace:"client.images.create_variation(",source:OAI},
 {id:"openai-moderation",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Moderation.create removed in v1",find:/\bopenai\.Moderation\.a?create\(/g,replace:"client.moderations.create(",source:OAI},
 {id:"openai-audio-transcribe",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Audio.transcribe → client.audio.transcriptions.create",find:/\bopenai\.Audio\.transcribe\(/g,replace:"client.audio.transcriptions.create(",source:OAI},
 {id:"openai-audio-translate",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Audio.translate → client.audio.translations.create",find:/\bopenai\.Audio\.translate\(/g,replace:"client.audio.translations.create(",source:OAI},
 {id:"openai-model-list",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.Model.list → client.models.list",find:/\bopenai\.Model\.list\(/g,replace:"client.models.list(",source:OAI},
 {id:"openai-error-timeout",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.error.Timeout → openai.APITimeoutError",find:/\bopenai\.error\.Timeout\b/g,replace:"openai.APITimeoutError",source:OAI},
 {id:"openai-error-invalid",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.error.InvalidRequestError → openai.BadRequestError",find:/\bopenai\.error\.InvalidRequestError\b/g,replace:"openai.BadRequestError",source:OAI},
 {id:"openai-error-module",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.error module removed; exceptions live on openai.*",find:/\bopenai\.error\.(RateLimitError|APIConnectionError|AuthenticationError|PermissionError|APIError)\b/g,replace:"openai.$1",source:OAI},
 {id:"openai-api-key",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"Global openai.api_key is replaced by an OpenAI(api_key=...) client",find:/\bopenai\.api_key\s*=/g,replace:null,note:"Pass the key to the client instead: client = OpenAI(api_key=...)",source:OAI},
 {id:"openai-api-base",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"openai.api_base renamed to base_url on the client",find:/\bopenai\.api_base\b/g,replace:null,note:"Use OpenAI(base_url=...)",source:OAI},
 {id:"openai-dict-access",pack:"openai-python-v1",provider:"OpenAI",ext:["py"],title:"Responses are Pydantic models, not dicts",find:/\[["']choices["']\]/g,replace:null,note:"Use response.choices[0].message.content (attribute access)",source:OAI},
 // Pydantic v1 -> v2
 {id:"pydantic-dict",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:".dict() deprecated → .model_dump()",find:/\.dict\(\)/g,replace:".model_dump()",source:PYD},
 {id:"pydantic-parse-obj",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:"parse_obj → model_validate",find:/\.parse_obj\(/g,replace:".model_validate(",source:PYD},
 {id:"pydantic-parse-raw",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:"parse_raw → model_validate_json",find:/\.parse_raw\(/g,replace:".model_validate_json(",source:PYD},
 {id:"pydantic-schema",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:".schema() → .model_json_schema()",find:/\.schema\(\)/g,replace:".model_json_schema()",source:PYD},
 {id:"pydantic-validator",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:"@validator deprecated → @field_validator",find:/@validator\(/g,replace:null,note:"Use @field_validator (signature changed: values → info)",source:PYD},
 {id:"pydantic-config",pack:"pydantic-v2",provider:"Pydantic",ext:["py"],requires:/pydantic/,title:"class Config replaced by model_config = ConfigDict(...)",find:/^\s*class Config\s*:/g,replace:null,note:"Use model_config = ConfigDict(...)",source:PYD},
 // pandas 2.0
 {id:"pandas-iteritems",pack:"pandas-2",provider:"pandas",ext:["py"],requires:/pandas/,title:"DataFrame/Series.iteritems() removed → .items()",find:/\.iteritems\(\)/g,replace:".items()",source:PD2},
 {id:"pandas-append",pack:"pandas-2",provider:"pandas",ext:["py"],requires:/pandas/,title:"DataFrame.append removed → pd.concat",find:/\b\w+\.append\(\s*(pd\.|df|\w+_df)/g,replace:null,note:"Use pd.concat([df, other])",source:PD2},
 // Stripe API versions
 {id:"stripe-legal-entity",pack:"stripe-api",provider:"Stripe",ext:["py","js","ts","rb","php","go"],requires:/stripe/i,title:"Account legal_entity removed (API 2019-02-19) → individual / company",find:/\blegal_entity\b/g,replace:null,note:"Use account.individual or account.company",source:"https://docs.stripe.com/changelog/2019-02-19"},
 {id:"stripe-sources-default",pack:"stripe-api",provider:"Stripe",ext:["py","js","ts","rb","php","go"],requires:/stripe/i,title:"Customer.sources no longer included by default (API 2020-08-27)",find:/\bcustomer\.sources\b|\.sources\.data\b/g,replace:null,note:"Expand 'sources' explicitly or use the PaymentMethods API",source:"https://docs.stripe.com/changelog/2020-08-27"},
 {id:"stripe-checkout-lineitem-amount",pack:"stripe-api",provider:"Stripe",ext:["py","js","ts","rb","php"],requires:/stripe/i,title:"Checkout line_items amount/currency/name removed (API 2022-08-01) → price_data",find:/line_items[\s\S]{0,0}|\bamount\s*[:=]\s*\d+.*\bcurrency\b/g,replace:null,note:"Use line_items[].price or price_data",source:"https://docs.stripe.com/changelog/2022-08-01"},
 {id:"stripe-charge-refunds",pack:"stripe-api",provider:"Stripe",ext:["py","js","ts","rb","php","go"],requires:/stripe/i,title:"Charge.refunds no longer auto-expanded (API 2022-11-15)",find:/\bcharge\.refunds\b/gi,replace:null,note:"Expand 'refunds' or list refunds by charge",source:"https://docs.stripe.com/changelog/2022-11-15"},
];
// remove a too-loose stripe rule pattern variant
RULES.forEach(r=>{ if(r.id==="stripe-checkout-lineitem-amount") r.find=/\bline_items\b[^\n]*\bamount\b/g; });

const PACKS = {
 "openai-python-v1":{name:"OpenAI Python SDK v0 → v1",source:OAI,
   post:(text)=>{ if(!/\bclient\.(chat|completions|embeddings|images|moderations|audio|models)/.test(text)||/\bOpenAI\(/.test(text)) return text;
     return text.replace(/^(\s*)import openai\s*$/m,(m,ind)=>`${ind}import openai\n${ind}from openai import OpenAI\n${ind}client = OpenAI()  # reads OPENAI_API_KEY; pass api_key=... if needed`); }},
 "pydantic-v2":{name:"Pydantic v1 → v2",source:PYD},
 "pandas-2":{name:"pandas 1.x → 2.0",source:PD2},
 "stripe-api":{name:"Stripe API versions",source:STR},
};

function scanFile(path, text){
  const ext=(path.split(".").pop()||"").toLowerCase();
  const lines=text.split("\n"); const findings=[]; const out=lines.slice();
  const usedPacks=new Set();
  for(const r of RULES){
    if(!r.ext.includes(ext)) continue;
    if(r.requires && !r.requires.test(text)) continue;
    if(r.pack==="openai-python-v1" && !/\bopenai\b/.test(text)) continue;
    lines.forEach((ln,i)=>{
      r.find.lastIndex=0;
      if(r.find.test(ln)){
        findings.push({file:path,line:i+1,rule:r.id,provider:r.provider,title:r.title,note:r.note||"",source:r.source,code:ln.trim(),autofix:r.replace!==null});
        if(r.replace!==null){ r.find.lastIndex=0; out[i]=out[i].replace(r.find,r.replace); usedPacks.add(r.pack);} }
    });
  }
  let fixed=out.join("\n");
  usedPacks.forEach(p=>{ if(PACKS[p].post) fixed=PACKS[p].post(fixed); });
  return {findings, fixed, changed: fixed!==text};
}

function unifiedDiff(path, a, b, ctx=3){
  if(a===b) return "";
  const A=a.split("\n"), B=b.split("\n"); const n=A.length,m=B.length;
  // LCS (fine for typical source files)
  const dp=Array.from({length:n+1},()=>new Uint32Array(m+1));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) dp[i][j]=A[i]===B[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const ops=[]; let i=0,j=0;
  while(i<n&&j<m){ if(A[i]===B[j]){ops.push([" ",A[i],i,j]);i++;j++;} else if(dp[i+1][j]>=dp[i][j+1]){ops.push(["-",A[i],i,j]);i++;} else {ops.push(["+",B[j],i,j]);j++;} }
  while(i<n){ops.push(["-",A[i],i,j]);i++;} while(j<m){ops.push(["+",B[j],i,j]);j++;}
  let out=`--- a/${path}\n+++ b/${path}\n`; let k=0;
  while(k<ops.length){
    if(ops[k][0]===" "){k++;continue;}
    let s=Math.max(0,k-ctx), e=k;
    while(e<ops.length){ if(ops[e][0]!==" "){e++;continue;} let r=e; while(r<ops.length&&ops[r][0]===" ")r++; if(r<ops.length&&r-e<=ctx*2){e=r;} else break; }
    e=Math.min(ops.length,e+ctx);
    const h=ops.slice(s,e); const oa=h[0][2],ob=h[0][3];
    const la=h.filter(o=>o[0]!=="+").length, lb=h.filter(o=>o[0]!=="-").length;
    out+=`@@ -${oa+1},${la} +${ob+1},${lb} @@\n`+h.map(o=>o[0]+o[1]).join("\n")+"\n";
    k=e;
  }
  return out;
}
const api={RULES,PACKS,scanFile,unifiedDiff};
if(typeof module!=="undefined") module.exports=api; else root.DriftPatch=api;
})(this);
