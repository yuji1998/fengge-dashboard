// test_vocab_scope.js — V6 新功能专项：多单元混编学习范围 + 手动加量（node 直接跑）
const fs = require('fs'), vm = require('vm');
const path = 'D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/';
const html = fs.readFileSync(path + 'vocab.html', 'utf-8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('未找到内联脚本');

function makeEl() {
  return {
    textContent: '', value: '', innerHTML: '', disabled: false, style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    addEventListener(){}, appendChild(){}, remove(){}, click(){}, focus(){}, scrollIntoView(){},
    querySelectorAll: () => [], setAttribute(){}, getAttribute: () => null,
  };
}
function runScript(dictData) {
  const store = {};
  const els = {};
  const sandbox = {
    console, Math, Date, JSON, Object, Array, String, Number, RegExp, Promise, setTimeout, clearTimeout, encodeURIComponent,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    document: {
      getElementById: id => (els[id] || (els[id] = makeEl())),
      querySelectorAll: () => [], querySelector: () => makeEl(),
      createElement: () => makeEl(), documentElement: makeEl(), body: makeEl(), addEventListener(){},
    },
    alert(){}, confirm: () => false, URL: { createObjectURL: () => '', revokeObjectURL(){} },
    Blob: function(){}, FileReader: function(){ this.readAsText = function(){}; },
    window: { VOCAB_DICTS: dictData || null, VOCAB_META: dictData ? { v: 'ext', updated: 'test' } : null },
  };
  vm.createContext(sandbox);
  vm.runInContext(m[1], sandbox, { filename: 'vocab-inline.js' });
  return sandbox;
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓', name); }
  else { fail++; console.log('  ✗', name, extra !== undefined ? JSON.stringify(extra) : ''); }
}

console.log('[A] 多单元学习范围（scope 多选）');
{
  const sb = runScript(null); // 兜底中考库 8 单元
  const V = sb.window.__VOCAB__;
  const user = 'u0';
  // 选 3 个单元：1、3、5
  V.getDB().users[user].settings.scope = [1, 3, 5];
  const pool = V.scanPool(user, Date.now());
  const units = new Set(pool.fresh.map(it => it.w.unit));
  check('scope=[1,3,5] 时新词池只含这 3 个单元', [...units].every(u => [1, 3, 5].includes(u)) && units.size === 3, [...units]);
  // 混编：一轮队列里来自不同单元的词都出现
  V.getDB().users[user].settings.newPerDay = 40;
  V.buildSession();
  const qUnits = new Set(V.getSession().queue.map(it => it.w.unit));
  check('一轮队列覆盖全部已选单元（混编）', [1, 3, 5].every(u => qUnits.has(u)), [...qUnits]);
  // 队列打散：前 10 题不应全来自同一单元
  const first10 = V.getSession().queue.slice(0, 10).map(it => it.w.unit);
  check('前 10 题非单单元连排（打散出题）', new Set(first10).size >= 2, first10);
  // 范围外单元不进队列
  check('未选单元（2/4/6…）不进队列', [...qUnits].every(u => [1, 3, 5].includes(u)), [...qUnits]);
  // 清空范围 = 全部
  V.getDB().users[user].settings.scope = [];
  const poolAll = V.scanPool(user, Date.now());
  const allUnits = new Set(poolAll.fresh.map(it => it.w.unit));
  check('scope 清空 → 全部 8 个单元', allUnits.size === 8, [...allUnits]);
}

console.log('[B] 手动加量（今天 20 → 加 20 = 40）');
{
  const sb = runScript(null);
  const V = sb.window.__VOCAB__;
  const user = 'u0';
  const t = new Date(); const today = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
  const db = V.getDB();
  db.users[user].settings.newPerDay = 20; db.users[user].settings.dir = 'e2c'; // 单方向好算
  V.buildSession();
  const q1 = V.getSession().queue.length;
  check('默认一轮 20 题', q1 === 20, q1);
  const freshBefore = V.scanPool(user, Date.now()).fresh.length;
  // 模拟 20 个新词已全部投完（学完一轮）
  db.users[user].daily[today] = { r: 20, c: 15, n: 20 };
  V.buildSession();
  check('额度用完后队列里不再有新词', V.getSession().queue.every(it => (db.users[user].states[it.w.key] || {})[it.dir]), '');
  // 手动加量 20
  V.addExtra(20);
  const q2 = V.getSession().queue;
  const newCount = q2.filter(it => ((db.users[user].states[it.w.key] || {})[it.dir] || { last: 0 }).last === 0).length;
  check('加量 20 后新投放 20 个新词', newCount === 20, newCount);
  check('daily 记录 x=20', db.users[user].daily[today].x === 20, db.users[user].daily[today]);
  // 再加 20 → 40
  V.addExtra(20);
  check('再加 20 → x=40', db.users[user].daily[today].x === 40, db.users[user].daily[today].x);
  // newQuota 汇总口径：额度 = newPerDay + x - n
  check('newQuota=20+40-20=40（还有词可投时）', V.newQuota() === Math.max(0, 20 + 40 - (db.users[user].daily[today].n || 0)) || db.users[user].daily[today].n === 60, { quota: V.newQuota(), n: db.users[user].daily[today].n });
}

console.log('[C] 回归：加量不影响记忆算法与既有进度');
{
  const sb = runScript(null);
  const V = sb.window.__VOCAB__;
  const st0 = V.blankState();
  const s1 = V.schedule(st0, true, Date.now());
  check('首答对仍=10分钟后', s1.interval === 10 && s1.stage === 1, s1);
  const st = V.migrateDB({ v: 1, users: { u0: { states: { 0: { stage: 2, last: 1 } } } } });
  check('v1 迁移不受影响', !!st.users.u0.states['zhongkao|1|organized'], Object.keys(st.users.u0.states));
}

console.log('\n结果:', pass, '通过,', fail, '失败');
process.exit(fail ? 1 : 0);
