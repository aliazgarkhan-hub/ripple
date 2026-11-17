/* ---------- Scheduling logic (no DOM access) ---------- */
const Ripple=(()=>{
const byId=t=>Object.fromEntries(t.map(x=>[x.id,x]));
const sample=()=>[
 {id:"A",name:"Confirm requirements",dur:2,deps:[]},{id:"B",name:"Design pages",dur:3,deps:["A"]},
 {id:"C",name:"Build website",dur:4,deps:["B"]},{id:"D",name:"Prepare content",dur:3,deps:["A"]},
 {id:"E",name:"Final review and launch",dur:2,deps:["C","D"]}];
function findCycle(tasks){const m=byId(tasks),st={},stack=[];let cyc=null;
 const dfs=id=>{st[id]=1;stack.push(id);for(const d of m[id].deps){if(cyc)return;if(st[d]===1){cyc=[...stack.slice(stack.indexOf(d)),d];return}if(!st[d])dfs(d)}stack.pop();st[id]=2};
 tasks.forEach(t=>{if(!st[t.id]&&!cyc)dfs(t.id)});return cyc}
function validate(tasks){const e=[],m=byId(tasks);
 if(!tasks.length)return["Add at least one task."];
 tasks.forEach(t=>{
  if(!String(t.name).trim())e.push(`Task ${t.id} needs a name.`);
  if(!Number.isInteger(t.dur)||t.dur<1)e.push(`Task ${t.id}: duration must be a whole number of at least 1 working day.`);
  t.deps.forEach(d=>{if(d===t.id)e.push(`Task ${t.id} cannot depend on itself.`);else if(!m[d])e.push(`Task ${t.id} depends on a task that doesn’t exist.`)})});
 if(!e.length){const c=findCycle(tasks);if(c)e.push(`Circular dependency: ${c.join(" → ")}. Each task in that loop waits for the next, so none can start.`)}
 return e}
function schedule(tasks){const m=byId(tasks),r={},succ={},lf={};
 const fwd=id=>r[id]||(r[id]=(()=>{const s=m[id].deps.length?Math.max(...m[id].deps.map(d=>fwd(d).finish))+1:1;return{id,start:s,finish:s+m[id].dur-1,dur:m[id].dur}})());
 tasks.forEach(t=>{fwd(t.id);succ[t.id]=[]});tasks.forEach(t=>t.deps.forEach(d=>succ[d].push(t.id)));
 const end=Math.max(...tasks.map(t=>r[t.id].finish));
 const back=id=>id in lf?lf[id]:(lf[id]=succ[id].length?Math.min(...succ[id].map(s=>back(s)-m[s].dur+1))-1:end);
 tasks.forEach(t=>{r[t.id].float=back(t.id)-r[t.id].finish;r[t.id].critical=r[t.id].float===0});
 const list=Object.values(r).sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
 return{rows:r,list,end,critical:list.filter(x=>x.critical).map(x=>x.id)}}
const withDur=(tasks,id,d)=>tasks.map(t=>({...t,deps:[...t.deps],dur:t.id===id?d:t.dur}));
const defer=(tasks,id)=>tasks.filter(t=>t.id!==id).map(t=>({...t,deps:t.deps.filter(d=>d!==id)}));
function compare(o,n){const affected=n.list.filter(r=>{const a=o.rows[r.id];return a&&(a.start!==r.start||a.finish!==r.finish)}).map(r=>r.id);
 return{delta:n.end-o.end,affected,removed:o.list.filter(r=>!n.rows[r.id]).map(r=>r.id)}}
const pl=n=>`${n} day${Math.abs(n)===1?"":"s"}`;
function explain(os,ns,tasks,id,delta){const nm=i=>tasks.find(t=>t.id===i).name,m=byId(tasks);
 const out=[`${nm(id)} is ${delta>0?"delayed":"shortened"} by ${pl(Math.abs(delta))}.`];
 ns.list.forEach(r=>{const s=r.start-os.rows[r.id].start;if(r.id===id||!s)return;
  const p=m[r.id].deps.find(d=>ns.rows[d].finish+1===r.start&&ns.rows[d].finish!==os.rows[d].finish);
  out.push(`${p?`Because ${nm(r.id)} depends on ${nm(p)}, `:""}${p?"":""}${nm(r.id)} starts ${pl(Math.abs(s))} ${s>0?"later":"earlier"}.`.replace(/^([a-z])/,c=>c.toUpperCase()))});
 const d=ns.end-os.end;
 out.push(d===0?(delta>0?`${nm(id)} has ${pl(os.rows[id].float)} of float, so the extra time is absorbed and the project still finishes on Day ${ns.end}.`:`The project still finishes on Day ${ns.end}, because ${nm(id)} isn’t the only thing setting the end date.`)
  :`The project now finishes on Day ${ns.end} instead of Day ${os.end} (${d>0?"+":""}${pl(d)}).`);
 return out.join(" ")}
function tests(){const S=sample(),end=t=>schedule(t).end,r=[];
 r.push(["Sample project finishes on Day 11",end(S)===11]);
 r.push(["Delaying Task B by 2 days moves completion to Day 13",end(withDur(S,"B",5))===13]);
 r.push(["Delaying Task D by 2 days does not move completion",end(withDur(S,"D",5))===11]);
 const cyc=S.map(t=>t.id==="A"?{...t,deps:["B"]}:t);
 r.push(["A circular dependency is rejected",validate(cyc).some(x=>x.startsWith("Circular"))]);
 const s=schedule(S);r.push(["A task with several predecessors starts after the latest one finishes",s.rows.E.start===Math.max(s.rows.C.finish,s.rows.D.finish)+1]);
 return r.map(([n,p])=>({n,p}))}
return{sample,validate,schedule,withDur,defer,compare,explain,tests,findCycle}})();
if(typeof module!=="undefined"&&module.exports)module.exports=Ripple;
