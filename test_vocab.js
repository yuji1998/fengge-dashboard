// test_vocab.js — vocab.html 重构后的逻辑回归测试（node 直接跑，无需浏览器）
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/vocab.html', 'utf-8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('未找到内联脚本');

function makeEl() {
  const el = {
    textContent: '', value: '', innerHTML: '', disabled: false, style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    addEventListener(){}, appendChild(){}, remove(){}, click(){}, focus(){}, scrollIntoView(){},
    querySelectorAll: () => [], setAttribute(){}, getAttribute: () => null,
  };
  return el;
}
function makeEnv(wordsOverride) {
  const store = {};
  const els = {};
  const sandbox = {
    console, Math, Date, JSON, Object, Array, String, Number, RegExp, Promise, setTimeout, clearTimeout, encodeURIComponent,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    document: {
      getElementById: id => (els[id] || (els[id] = makeEl())),
      querySelectorAll: () => [],
      querySelector: () => makeEl(),
      createElement: () => makeEl(),
      documentElement: makeEl(),
      body: makeEl(),
      addEventListener(){},
    },
    alert(){}, confirm: () => false, URL: { createObjectURL: () => '', revokeObjectURL(){} },
    Blob: function(){}, FileReader: function(){ this.readAsText = function(){}; },
    window: null, indexedDB: undefined, speechSynthesis: undefined,
  };
  sandbox.window = { VOCAB_WORDS: wordsOverride || null, VOCAB_META: wordsOverride ? { v: 'ext', updated: 'test' } : null };
  sandbox.globalThis = sandbox;
  return { sandbox, store, els };
}

function runScript(env) {
  vm.createContext(env.sandbox);
  vm.runInContext(m[1], env.sandbox, { filename: 'vocab-inline.js' });
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓', name); }
  else { fail++; console.log('  ✗', name, extra !== undefined ? JSON.stringify(extra) : ''); }
}

console.log('[1] 基础加载（无外置词库 → 内嵌兜底）');
const e1 = makeEnv(null); runScript(e1);
const V1 = e1.sandbox.window.__VOCAB__;
check('WORDS 共 378 词', V1.WORDS.length === 378, V1.WORDS.length);
check('每词 key 唯一', new Set(V1.WORDS.map(w => w.key)).size === V1.WORDS.length);
check('key 形如 单元|单词', V1.WORDS[0].key === '1|organized', V1.WORDS[0].key);
check('pickQType e2c 只返回 choice', V1.pickQType({ w: { en: 'organized', en2: 1 }, dir: 'e2c' }) === 'choice');
const c2e = V1.pickQType({ w: { en: 'organized' }, dir: 'c2e' });
check('pickQType c2e 返回 spell/choice', c2e === 'spell' || c2e === 'choice', c2e);

console.log('[2] 旧进度迁移（数字序号 → 稳定 key）');
const legacyStates = { 0: { e2c: { stage: 4, last: 123, wrong: false, due: 999, reps: 4, lapses: 0, ease: 2.5, interval: 60 } }, 60: { c2e: { stage: 1, last: 5, wrong: true, due: 1, reps: 0, lapses: 1, ease: 2.3, interval: 10 } } };
const db = { users: { u0: Object.assign(V1.blankState && {}, { name: '测试', states: legacyStates, settings: { newPerDay: 20, dir: 'both', round: 20, scope: [], mode: 'mix' }, daily: {}, streak: 1, lastDay: '' }) }, current: 'u0' };
const migrated = V1.migrateDB(JSON.parse(JSON.stringify(db)));
const ns = migrated.users.u0.states;
check('迁移后无数字键', Object.keys(ns).every(k => k.includes('|')));
check('id=0 → 1|organized', JSON.stringify(ns['1|organized'].e2c) === JSON.stringify(legacyStates[0].e2c));
check('id=60 → 对应词的进度原样保留', (() => {
  // 与页面同规则重建 LEGACY_KEYS[60]：按兜底词表顺序展平
  const eTmp = makeEnv(null); runScript(eTmp);
  const fallback = eTmp.sandbox.window.__VOCAB__.WORDS; // 内嵌兜底生成的有序词表
  const key60 = fallback[60].key;
  return ns[key60] && JSON.stringify(ns[key60].c2e) === JSON.stringify(legacyStates[60].c2e) && (console.log('   (id60 → ' + key60 + ')'), true);
})());
check('标记 v=2（不重复迁移）', migrated.v === 2);
const again = V1.migrateDB(migrated);
check('二次迁移幂等', Object.keys(again.users.u0.states).length === Object.keys(ns).length);

console.log('[3] 词库动态增减不影响进度');
const ext = JSON.parse(JSON.stringify(e1.sandbox.window.VOCAB_WORDS || null));
// 构造外置词库：删掉 Unit2 一个词 + 在 Unit1 开头插入一个新词
const fallbackSrc = V1.WORDS.reduce((acc, w) => { (acc[w.unit] = acc[w.unit] || []).push([w.en, w.zh, w.pos]); return acc; }, {});
const extWords = JSON.parse(JSON.stringify(fallbackSrc));
extWords[2].splice(0, 1);                    // 删除 teenage
extWords[1].unshift(['zzznew', '测试新词', 'n']); // 头部插入，制造最大序号漂移
const e2 = makeEnv(extWords); runScript(e2);
const V2 = e2.sandbox.window.__VOCAB__;
check('外置词库生效（词数-1+1）', V2.WORDS.length === 378, V2.WORDS.length);
check('新词在列', V2.WORDS.some(w => w.key === '1|zzznew'));
check('删除词不在列', !V2.WORDS.some(w => w.key === '2|teenage'));
// 把迁移后的进度（基于原词表）放进新词库环境，验证进度词仍然可命中
const user2 = { name: '测试', states: ns, settings: { newPerDay: 20, dir: 'both', round: 20, scope: [], mode: 'mix' }, daily: {}, streak: 1, lastDay: '' };
const db2 = { users: { u0: user2 }, current: 'u0', v: 2 };
e2.sandbox.window.__VOCAB__.restoreText(JSON.stringify({ data: db2 }));
const pool = e2.sandbox.window.__VOCAB__.scanPool('u0', Date.now() + 8640000000);
const all = pool.review.concat(pool.wrong);
check('已学词仍能进入复习队列', all.some(it => it.w.key === '1|organized'), all.map(i => i.w.key).slice(0, 3));
check('删除的词不再出现', !all.some(it => it.w.key === '2|teenage'));

console.log('[4] scanPool / schedule 抽查');
const e3 = makeEnv(null); runScript(e3);
const V3 = e3.sandbox.window.__VOCAB__;
const st0 = V3.blankState();
const st1 = V3.schedule(st0, true, 1000000);
check('首答对 = 10分钟后', st1.due - 1000000 === 10 * 60000, st1.due - 1000000);
const st2 = V3.schedule(st1, false, 2000000);
check('答错降2阶+wrong标记', st2.wrong === true && st2.stage === 0);
const pool3 = V3.scanPool('u0', Date.now() + 36000000);
check('全新用户全是新词', pool3.fresh.length > 300 && pool3.review.length === 0);

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
