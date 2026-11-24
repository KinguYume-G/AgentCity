// Public HTTPS reachability samples, not a claim about every ISP.
const fs=require('node:fs');
const target='kinguyume-g.github.io',api='https://api.globalping.io/v1/measurements';
const countries=['US','DE','JP','SG','MY','CN','AU','BR','ZA'];
const paths=['/AgentCity/','/AgentCity/vendor/three.module.min.js'];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function json(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});const body=await response.json();if(!response.ok)throw Error('HTTP '+response.status+': '+JSON.stringify(body).slice(0,250));return body}
async function sample(country,path){try{
 const created=await json(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target,type:'http',locations:[{country,limit:1}],measurementOptions:{protocol:'HTTPS',request:{method:path.endsWith('.js')?'HEAD':'GET',path}}})});
 if(!created.id)throw Error('No measurement ID');
 let data;for(let i=0;i<12;i++){await pause(1500);data=await json(api+'/'+created.id);if(data.status!=='in-progress')break}
 if(!data||data.status==='in-progress')return{country,path,state:'UNKNOWN',measurement:created.id,error:'Measurement timeout'};
 const probe=data.results?.[0];if(!probe)return{country,path,state:'UNKNOWN',measurement:created.id,error:'No probe response'};
 const result=probe.result||{},status=result.statusCode??null;
 return{country,path,state:status>=200&&status<300?'PASS':status||result.status==='failed'?'FAIL':'UNKNOWN',status,probeCountry:probe.probe?.country,city:probe.probe?.city,network:probe.probe?.network,timingMs:result.timings?.total??null,measurement:created.id,error:status?undefined:result.rawOutput?.slice(0,300)};
 }catch(e){return{country,path,state:'UNKNOWN',error:String(e.message).slice(0,300)}}}
(async()=>{let rows=[];for(const path of paths){for(let i=0;i<countries.length;i+=3)rows.push(...await Promise.all(countries.slice(i,i+3).map(c=>sample(c,path))))}const summary={checkedAt:new Date().toISOString(),target,results:rows};fs.writeFileSync('global-access-results.json',JSON.stringify(summary,null,2));console.table(rows.map(({country,path,state,status,probeCountry,city,timingMs})=>({country,path,state,status,probeCountry,city,timingMs})));if(process.env.GITHUB_STEP_SUMMARY){const lines=['## Global HTTP probe samples','Country | Resource | State | HTTP | Probe city | ms','---|---|---|---|---|---',...rows.map(r=>[r.country,r.path,r.state,r.status??'—',r.city??'—',r.timingMs??'—'].join(' | ')),'','PASS verifies only the sampled probe; UNKNOWN includes unavailable probes, quota and API errors. HEAD tests asset reachability, not WebGL.'];fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n')}if(rows.some(r=>r.state==='FAIL')||rows.every(r=>r.state==='UNKNOWN'))process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});
