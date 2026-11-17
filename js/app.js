/* Ripple UI. Depends on js/scheduler.js (global `Ripple`). */
const $=s=>document.querySelector(s),pl=n=>`${n} day${Math.abs(n)===1?"":"s"}`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const S={view:"home",P:null,orig:null,ot:null,errs:[],scn:null,o:{},rev:null,form:null,msg:"",seen:{},scroll:null};
const enter=k=>S.seen[k]?"":(S.seen[k]=1," enter");

const QUOTES={
 eis:["Plans are worthless, but planning is everything.","Dwight D. Eisenhower"],
 hof:["It always takes longer than you expect, even when you take into account Hofstadter’s Law.","Douglas Hofstadter, Gödel, Escher, Bach"],
 brooks:["Adding manpower to a late software project makes it later.","Fred Brooks, The Mythical Man-Month"],
 year:["How does a project get to be a year late? … One day at a time.","Fred Brooks, The Mythical Man-Month"],
 park:["Work expands so as to fill the time available for its completion.","C. Northcote Parkinson, The Economist, 1955"]};
const quote=(k,c="")=>`<blockquote class="quote ${c}"><p>“${QUOTES[k][0]}”</p><cite>— ${QUOTES[k][1]}</cite></blockquote>`;
const nm=(t,i)=>t.find(x=>x.id===i).name;
const clone=t=>t.map(x=>({...x,deps:[...x.deps]}));

function home(){return`<section class="hero${enter("hero")}"><div><p class="eyebrow">What-if planning for small teams</p><h1>See how one delay ripples through your plan.</h1>
<p>Enter your tasks and dependencies, change a single assumption, and compare practical ways to respond before you commit to a revised plan.</p>
<div class="cta"><button class="btn pri" data-act="sample">Try sample project</button><button class="btn" data-act="new">Create new project</button></div></div>
<svg class="rings" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140"/><circle cx="150" cy="150" r="140"/><circle cx="150" cy="150" r="140"/><circle cx="150" cy="150" r="6" fill="var(--pc)" stroke="none" style="animation:none"/></svg></section>
${quote("year","big")}
<section class="sec"><h2>Where Ripple fits</h2><p>Any small project where some work has to wait for other work, and where a slipped date raises the question “what now?”</p></section>
<div class="cases"><div class="case"><h3>Website launches</h3><p>Requirements, design, build and content, with a final review that waits on all of them.</p></div>
<div class="case"><h3>Event planning</h3><p>Venue and catering are settled before invitations and run sheets can go out.</p></div>
<div class="case"><h3>Product releases</h3><p>Spec, build, QA and rollout, with a clear view of which slip actually moves the launch.</p></div>
<div class="case"><h3>Fit-outs and renovations</h3><p>Trades follow one another, so a late delivery pushes back everything behind it.</p></div></div>
<section class="sec"><h2>How the schedule is calculated</h2><p>No estimates and no guesswork. Ripple applies the same rules every time you recalculate.</p></section>
<div class="how"><div><h3>Forward pass</h3><p>A task starts the day after its latest predecessor finishes. Independent tasks run in parallel.</p><code>Start = latest predecessor finish + 1<br>Finish = Start + Duration − 1</code></div>
<div><h3>Backward pass</h3><p>Working back from the end date shows how late each task could finish without moving the project.</p><code>Float = Latest finish − Finish</code></div>
<div><h3>Critical path</h3><p>Tasks with zero float form the critical path. A changed duration triggers a full recalculation.</p><code>Sample: A → B → C → E = Day 11</code></div></div>
<p class="note">Ripple recalculates from the assumptions you enter. It doesn’t detect or predict real-world delays, and it isn’t a substitute for full project-management software.</p>`}

function trow(t,i){const o=S.P.tasks.filter(x=>x.id!==t.id);
 return`<div class="trow" data-i="${i}"><span class="tid">${t.id}</span>
<label class="fl">Task name<input data-f="name" value="${esc(t.name)}" placeholder="e.g. Design pages"></label>
<label class="fl">Duration (working days)<input data-f="dur" type="number" min="1" step="1" value="${Number.isNaN(t.dur)?"":t.dur}"></label>
<fieldset style="border:0;padding:0;margin:0"><legend class="fl">Depends on</legend><div class="chips">${o.length?o.map(x=>`<label class="chip" title="${esc(x.name)}"><input type="checkbox" data-f="dep" value="${x.id}"${t.deps.includes(x.id)?" checked":""}><span>${x.id}</span></label>`).join(""):'<small>No other tasks yet</small>'}</div></fieldset>
<button class="btn sm" data-act="rm" ${S.P.tasks.length<2?"disabled":""}>Remove</button></div>`}

function plan(){return`<section class="card${enter("plan")}" id="plan"><div class="sh"><span class="n">1</span><div><h2>Project plan</h2><p class="mut" style="margin:0">Add tasks, set durations in working days, and choose which tasks must finish first.</p></div></div>
<label class="fl" style="max-width:360px">Project name<input data-f="pname" value="${esc(S.P.name)}"></label>
${S.errs.length?`<div class="err" role="alert"><b>Please fix the following</b><ul>${S.errs.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`:""}
<div style="margin-top:14px">${S.P.tasks.map(trow).join("")}</div>
<div class="acts"><button class="btn" data-act="add">+ Add task</button><button class="btn pri" data-act="calc">Calculate schedule</button></div>${quote("eis")}</section>`}

function timeline(tasks,sc,ghost,aff){const N=Math.max(sc.end,ghost?ghost.end:0);
 return`<div class="tl" style="--n:${N}"><div class="row ruler"><div class="rl"></div><div class="days">${Array.from({length:N},(_,i)=>`<span>${i+1}</span>`).join("")}</div></div>
${sc.list.map((r,i)=>{const g=ghost&&ghost.rows[r.id],cls=aff&&aff.has(r.id)?"aff":r.critical?"crit":"flt";
 return`<div class="row"><div class="rl"><b>${r.id}</b><span>${esc(nm(tasks,r.id))}</span><small>Day ${r.start}–${r.finish} · ${r.critical?"Critical":"Float "+pl(r.float)}</small></div>
<div class="track">${g&&(g.start!==r.start||g.dur!==r.dur)?`<i class="ghost" style="left:${(g.start-1)/N*100}%;width:${g.dur/N*100}%"></i>`:""}<div class="bar ${cls}" style="left:${(r.start-1)/N*100}%;width:${r.dur/N*100}%;--i:${i}">D${r.start}–${r.finish}</div></div></div>`}).join("")}</div>`}
const key=sc=>`<div class="key"><span><i style="background:var(--hi)"></i>Critical path</span><span><i style="background:var(--bt);border:1px solid var(--ink)"></i>Has float</span>${sc?'<span><i class="sw-aff"></i>Affected by scenario</span><span><i style="border:1.5px dashed var(--ink)"></i>Original position</span>':""}</div>`;

function sched(){const o=S.orig;return`<section class="card${enter("sched")}" id="sched"><div class="sh"><span class="n">2</span><div><h2>Original schedule</h2><p class="mut" style="margin:0">Each task starts the day after its latest predecessor finishes.</p></div></div>
<div class="stats"><div><small>Project completion</small><b>Day ${o.end}</b></div><div><small>Critical path</small><b style="font-size:20px">${o.critical.join(" → ")}</b></div><div><small>Tasks</small><b>${S.ot.length}</b></div></div>${timeline(S.ot,o)}${key(false)}<p class="hint">The critical path is the chain of tasks with no float, so a delay to any of them moves the finish date. Float is how many days a task can slip without doing that.</p></section>`}

function whatif(){const f=S.form,sc=S.scn;
 return`<section class="card${enter("what")}" id="what"><div class="sh"><span class="n">3</span><div><h2>What if…?</h2><p class="mut" style="margin:0">Change one assumption. Ripple recalculates the entire schedule from scratch.</p></div></div>
<div class="fg"><label class="fl">Task<select data-f="ftask">${S.ot.map(t=>`<option value="${t.id}"${t.id===f.taskId?" selected":""}>${t.id} · ${esc(t.name)} (${t.dur}d)</option>`).join("")}</select></label>
<label class="fl">Change<select data-f="fmode"><option value="delay"${f.mode==="delay"?" selected":""}>Delay by (days)</option><option value="set"${f.mode==="set"?" selected":""}>Set duration to (days)</option></select></label>
<label class="fl">Days<input type="number" min="1" step="1" data-f="fval" value="${Number.isNaN(f.val)?"":f.val}"></label>
<button class="btn pri" data-act="run">Recalculate</button></div>
${S.msg?`<div class="err" role="alert">${esc(S.msg)}</div>`:""}
${sc?scn():""}${quote("hof")}</section>`}

function scn(){const sc=S.scn,c=sc.cmp,aff=new Set(c.affected),moved=c.delta!==0;
 return`<div class="panel" style="margin-top:22px"><div class="cmp"><div><small>Original completion</small><b>Day ${S.orig.end}</b></div><div class="ar">→</div>
<div class="${moved?"moved":""}"><small>New completion</small><b>Day ${sc.sched.end}</b><em>${moved?(c.delta>0?"+":"")+pl(c.delta):"Unchanged"}</em></div></div>
<p class="why">${esc(sc.text)}</p>
${c.affected.length?`<ul class="aff-l">${c.affected.map(i=>{const a=S.orig.rows[i],b=sc.sched.rows[i];return`<li><b>${i}</b> ${esc(nm(S.ot,i))}: Day ${a.start}–${a.finish} → Day ${b.start}–${b.finish}</li>`}).join("")}</ul>`:""}
${timeline(sc.tasks,sc.sched,S.orig,aff)}${key(true)}
<div class="acts"><button class="btn" data-act="undo">Undo scenario</button></div></div>`}

function res(r,tl){const N=S.orig.end,e=r.sched.end;
 return`<div class="res"><b>${esc(r.label)}</b><br>Completion: Day ${e}. The original deadline (Day ${N}) ${e<=N?"is met":`is missed by ${pl(e-N)}`}.</div>
${tl?timeline(r.tasks,r.sched,S.orig,new Set(Ripple.compare(S.orig,r.sched).affected)):""}<div class="acts"><button class="btn pri" data-act="save">Save as revised plan</button></div>`}

function opts(){const sc=S.scn,o=S.o,M=sc.sched.end,N=S.orig.end;
 const cards=[[1,"Keep the original deadline",`Finish on Day ${N} by shortening one task.`],[2,"Move the deadline",`Accept Day ${M}; every duration stays as is.`],[3,"Remove or defer a task",`Take a non-critical task out of this plan.`]];
 let b="";
 if(o.sel===1){const cand=sc.tasks.filter(t=>t.dur>1),cur=cand.find(t=>t.id===o.t1);
  b=!cur?"<p>No task is long enough to shorten.</p>":`<div class="fg" style="grid-template-columns:2fr 1fr"><label class="fl">Task to shorten<select data-f="o1t">${cand.map(t=>`<option value="${t.id}"${t.id===o.t1?" selected":""}>${t.id} · ${esc(t.name)} (${t.dur}d)</option>`).join("")}</select></label>
<label class="fl">Reduce to (days)<input type="number" min="1" max="${cur.dur-1}" value="${o.v1}" data-f="o1v"></label></div>
<p class="trade"><b>Trade-off:</b> ${esc(cur.name)} gets ${pl(cur.dur-(Number(o.v1)||cur.dur))} less than planned, so expect less time for the work in that task. Nothing changes until you confirm.</p>
<button class="btn pri" data-act="o1ok">Confirm and recalculate</button>${o.r1?res(o.r1,true):""}`}
 if(o.sel===2)b=res({tasks:sc.tasks,sched:sc.sched,label:`Move the deadline to Day ${M}`},false);
 if(o.sel===3){const c=sc.tasks.filter(t=>!sc.sched.rows[t.id].critical);
  b=!c.length?"<p>Every task is on the critical path, so there is no non-critical task to defer.</p>":`<label class="fl" style="max-width:420px">Non-critical task to defer<select data-f="o3t">${c.map(t=>`<option value="${t.id}"${t.id===o.t3?" selected":""}>${t.id} · ${esc(t.name)} (float ${pl(sc.sched.rows[t.id].float)})</option>`).join("")}</select></label>
<p class="trade"><b>Trade-off:</b> the task is removed from this plan and tasks that depended on it no longer wait for it. Deferring a non-critical task may not bring the end date back.</p><button class="btn pri" data-act="o3ok">Confirm and recalculate</button>${o.r3?res(o.r3,true):""}`}
 return`<section class="card${enter("opt")}" id="opt"><div class="sh"><span class="n">4</span><div><h2>Response options</h2><p class="mut" style="margin:0">The completion date moved. Ripple doesn’t pick for you. Choose an option, review it, then save it.</p></div></div>
<div class="oc">${cards.map(([k,t,d])=>`<button class="o${o.sel===k?" on":""}" data-act="opt" data-o="${k}"><b>${t}</b><small>${d}</small></button>`).join("")}</div>${o.sel?`<div class="panel">${S.omsg?`<div class="err" role="alert">${esc(S.omsg)}</div>`:""}${b}</div>`:""}${quote("brooks")}</section>`}

function compare(){const r=S.rev,rem=r.removed;
 return`<section class="card${enter("cmpr")}" id="cmpr"><div class="sh"><span class="n">5</span><div><h2>Original vs revised plan</h2><p class="mut" style="margin:0">${esc(r.label)}</p></div></div>
<div class="cmp"><div><small>Original plan</small><b>Day ${S.orig.end}</b></div><div class="ar">→</div><div class="moved"><small>Revised plan</small><b>Day ${r.sched.end}</b></div></div>
<div class="wrap"><table><thead><tr><th>Task</th><th>Duration</th><th>Original</th><th>Revised</th></tr></thead><tbody>${S.orig.list.map(a=>{const b=r.sched.rows[a.id];const ch=!b||b.start!==a.start||b.finish!==a.finish;
 return`<tr><td>${a.id} · ${esc(nm(S.ot,a.id))}</td><td>${a.dur}d${b&&b.dur!==a.dur?" → "+b.dur+"d":""}</td><td>Day ${a.start}–${a.finish}</td><td${ch?' class="ch"':""}>${b?`Day ${b.start}–${b.finish}`:"Deferred"}</td></tr>`}).join("")}</tbody></table></div>
<p class="mut" style="margin:14px 0 0">Saved for this session. Highlighted cells show what changed.</p>${quote("park")}</section>`}

function work(){return plan()+(S.orig?sched()+whatif()+(S.scn&&S.scn.sched.end>S.orig.end?opts():"")+(S.rev?compare():""):"")+`<p class="note">Ripple recalculates from the assumptions you enter. It doesn’t detect real-world delays and isn’t a substitute for full project-management software.</p>`}

function render(){$("#app").innerHTML=S.view==="home"?home():work();
 if(S.scroll){const id=S.scroll;S.scroll=null;requestAnimationFrame(()=>{const e=document.getElementById(id);e&&e.scrollIntoView({behavior:"smooth",block:"start"})})}}

const nextId=()=>{for(const c of"ABCDEFGHIJKLMNOPQRSTUVWXYZ")if(!S.P.tasks.some(t=>t.id===c))return c};
function openProject(P){S.P=P;S.view="work";S.orig=S.ot=S.scn=S.rev=null;S.errs=[];S.msg="";S.o={};S.seen={};render()}
function resetScn(){S.scn=null;S.o={};S.rev=null;S.msg="";S.omsg=""}
function run(){const f=S.form,t=S.ot.find(x=>x.id===f.taskId),v=f.val;
 if(!Number.isInteger(v)||v<1){S.msg="Enter a whole number of days, 1 or more.";return render()}
 const nd=f.mode==="delay"?t.dur+v:v;if(nd===t.dur){S.msg="That leaves the duration unchanged. Try a different value.";return render()}
 S.msg="";S.rev=null;const tasks=Ripple.withDur(S.ot,t.id,nd),sc=Ripple.schedule(tasks);
 S.scn={tasks,sched:sc,cmp:Ripple.compare(S.orig,sc),text:Ripple.explain(S.orig,sc,tasks,t.id,nd-t.dur)};
 const cand=tasks.filter(x=>x.dur>1),pick=cand.find(x=>sc.rows[x.id].critical)||cand[0],nc=tasks.find(x=>!sc.rows[x.id].critical);
 S.o={sel:null,t1:pick&&pick.id,v1:pick?pick.dur-1:1,t3:nc&&nc.id};S.scroll="what";render()}

document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,i=b.closest(".trow")?.dataset.i;
 if(a==="home"){S.view="home";return render()}
 if(a==="about")return about();
 if(a==="close")return $("#dlg").close();
 if(a==="test"){$("#tout").innerHTML=Ripple.tests().map(t=>`<li class="${t.p?"t-ok":"t-no"}">${t.p?"✓ Pass":"✕ Fail"} — ${t.n}</li>`).join("");return}
 if(a==="sample")return openProject({name:"Website launch",tasks:Ripple.sample()});
 if(a==="new")return openProject({name:"Untitled project",tasks:[{id:"A",name:"",dur:1,deps:[]}]});
 if(a==="add"){if(S.P.tasks.length>=26)return;S.P.tasks.push({id:nextId(),name:"",dur:1,deps:[]});return render()}
 if(a==="rm"){const id=S.P.tasks[i].id;S.P.tasks.splice(i,1);S.P.tasks.forEach(t=>t.deps=t.deps.filter(d=>d!==id));return render()}
 if(a==="calc"){S.errs=Ripple.validate(S.P.tasks);if(S.errs.length){S.orig=null;return render()}
  S.ot=clone(S.P.tasks);S.orig=Ripple.schedule(S.ot);resetScn();S.seen.sched=S.seen.what=0;
  S.form={taskId:S.ot.find(t=>t.id==="B")?"B":S.ot[0].id,mode:"delay",val:2};S.scroll="sched";return render()}
 if(a==="run")return run();
 if(a==="undo"){resetScn();S.scroll="what";return render()}
 if(a==="opt"){S.omsg="";S.o.sel=+b.dataset.o;return render()}
 if(a==="o1ok"){const o=S.o,t=S.scn.tasks.find(x=>x.id===o.t1),v=Number(o.v1);
  if(!Number.isInteger(v)||v<1||v>=t.dur){S.omsg=`Reduce ${t.name} to a whole number between 1 and ${t.dur-1} days.`;return render()}
  S.omsg="";const ts=Ripple.withDur(S.scn.tasks,t.id,v);o.r1={tasks:ts,sched:Ripple.schedule(ts),label:`Shortened ${t.name} from ${t.dur} to ${v} days`};return render()}
 if(a==="o3ok"){const o=S.o,t=S.scn.tasks.find(x=>x.id===o.t3),ts=Ripple.defer(S.scn.tasks,t.id);
  o.r3={tasks:ts,sched:Ripple.schedule(ts),label:`Deferred ${t.name}`,removed:[t.id]};return render()}
 if(a==="save"){const o=S.o,sc=S.scn;
  S.rev=o.sel===1?o.r1:o.sel===3?o.r3:{tasks:sc.tasks,sched:sc.sched,label:`Moved the deadline to Day ${sc.sched.end}; all durations unchanged`};
  S.rev.removed=S.rev.removed||[];S.scroll="cmpr";S.seen.cmpr=0;render()}});

document.addEventListener("change",e=>{const el=e.target,f=el.dataset.f;if(!f)return;const row=el.closest(".trow"),t=row&&S.P.tasks[row.dataset.i];
 if(f==="pname")S.P.name=el.value;
 else if(f==="name")t.name=el.value;
 else if(f==="dur")t.dur=el.value===""?NaN:Number(el.value);
 else if(f==="dep")t.deps=[...row.querySelectorAll('[data-f="dep"]:checked')].map(x=>x.value);
 else if(f==="ftask")S.form.taskId=el.value;
 else if(f==="fmode")S.form.mode=el.value;
 else if(f==="fval")S.form.val=el.value===""?NaN:Number(el.value);
 else if(f==="o1t"){S.o.t1=el.value;S.o.v1=S.scn.tasks.find(x=>x.id===el.value).dur-1;S.o.r1=null;render()}
 else if(f==="o1v"){S.o.v1=el.value;S.o.r1=null}
 else if(f==="o3t"){S.o.t3=el.value;S.o.r3=null}});

function about(){$("#dlg").innerHTML=`<h2>About Ripple</h2><p class="mut">A what-if planner for small teams.</p>
<h3>What it does</h3><p>Build a task plan with durations and dependencies, see the calculated schedule (start, finish, critical path, float), change one task’s duration, and compare practical responses before saving a revised plan.</p>
<h3>How to run</h3><p>There is no build step: open <code>index.html</code> in a modern browser. The scheduling logic lives in <code>js/scheduler.js</code>, separate from the interface code in <code>js/app.js</code>.</p>
<h3>Assumptions</h3><ul><li>Tasks start on Day 1; durations are working days.</li><li>A task starts the day after its latest predecessor finishes; independent tasks run in parallel.</li><li>No weekends, holidays or resource limits.</li><li>Every change is a user-entered assumption. Nothing is predicted.</li></ul>
<h3>What it does not do</h3><ul><li>No accounts, collaboration, notifications or integrations.</li><li>No automatic delay detection, AI estimates, budgets or resource planning.</li><li>Not a replacement for professional project-management software.</li><li>Data lives in the page for the current session only.</li><li>It’s an early-stage project: the schedule maths is covered by tests, but it hasn’t been used to run real projects.</li></ul>
<h3>Tests</h3><button class="btn sm" data-act="test">Run 5 checks</button><ul id="tout" style="list-style:none;padding:0;margin-top:10px;font-size:14px"></ul>
<div class="acts"><button class="btn pri" data-act="close">Close</button></div>`;$("#dlg").showModal()}
render();
