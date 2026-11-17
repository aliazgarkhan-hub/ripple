// Run with: node tests/scheduler.test.js  (or: npm test)
const Ripple = require("../js/scheduler.js");
let failed = 0;
const check = (name, pass) => { console.log(`${pass ? "PASS" : "FAIL"}  ${name}`); if (!pass) failed++; };

// The five required checks live in the scheduler so the in-app "Run checks" button can reuse them.
Ripple.tests().forEach(t => check(t.n, t.p));

// Extra checks
const S = Ripple.sample(), sc = Ripple.schedule(S);
check("Critical path of the sample is A, B, C, E", sc.critical.join() === "A,B,C,E");
check("Task D has 4 days of float", sc.rows.D.float === 4);
check("Zero duration is rejected", Ripple.validate(S.map(t => t.id === "A" ? { ...t, dur: 0 } : t)).length > 0);
check("Negative duration is rejected", Ripple.validate(S.map(t => t.id === "A" ? { ...t, dur: -2 } : t)).length > 0);
check("Missing task name is rejected", Ripple.validate(S.map(t => t.id === "A" ? { ...t, name: " " } : t)).length > 0);
check("Self-dependency is rejected", Ripple.validate(S.map(t => t.id === "A" ? { ...t, deps: ["A"] } : t)).length > 0);
check("Deferring D removes it from E's dependencies", !Ripple.defer(S, "D").find(t => t.id === "E").deps.includes("D"));
check("Shortening C by 1 day brings completion to Day 10", Ripple.schedule(Ripple.withDur(S, "C", 3)).end === 10);

process.exit(failed ? 1 : 0);
