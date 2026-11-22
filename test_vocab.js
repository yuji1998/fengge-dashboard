// test_vocab.js — vocab.html 多词库版逻辑回归测试（node 直接跑）
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/vocab.html', 'utf-8');
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
function makeEnv(dictData) {
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

console.log('[1] 兜底加载（无外置 → 仅中考库）');
const e1 = makeEnv(null); runScript(e1);
const V1 = e1.sandbox.window.__VOCAB__;
check('中考库 378 词（8单元兜底）', V1.WORDS_BY_DICT.zhongkao.length === 378, V1.WORDS_BY_DICT.zhongkao.length);
check('key 三段式 词库|单元|单词', V1.WORDS_BY_DICT.zhongkao[0].key === 'zhongkao|1|organized', V1.WORDS_BY_DICT.zhongkao[0].key);
check('兜底无四六级库', !V1.WORDS_BY_DICT.cet46);

console.log('[2] 外置多词库加载 + 各用户独立选库');
global.window = {}; require('D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/vocab_words.js');
const ext = global.window.VOCAB_DICTS;
const e2 = makeEnv(ext); runScript(e2);
const V2 = e2.sandbox.window.__VOCAB__;
check('中考库 563 词（9单元）', V2.WORDS_BY_DICT.zhongkao.length === 563, V2.WORDS_BY_DICT.zhongkao.length);
check('四六级库 300 词（6单元）', V2.WORDS_BY_DICT.cet46.length === 300, V2.WORDS_BY_DICT.cet46.length);
check('四六级 key 前缀 cet46|', V2.WORDS_BY_DICT.cet46[0].key.startsWith('cet46|1|'), V2.WORDS_BY_DICT.cet46[0].key);

// 三个用户：朱陈昕用中考库、丰哥用四六级库
const mkUser = (name, dict) => ({ name, states: {}, settings: { newPerDay: 20, dir: 'both', round: 20, scope: [], mode: 'mix', dict }, daily: {}, streak: 1, lastDay: '' });
const db2 = { users: { z: mkUser('朱陈昕', 'zhongkao'), f: mkUser('丰哥', 'cet46') }, current: 'f', v: 3 };
V2.restoreText(JSON.stringify({ data: db2 }));
const poolF = V2.scanPool('f', Date.now() + 8640000000);
check('丰哥的会话来自四六级库', poolF.fresh.length === 600 && poolF.fresh.every(it => it.w.key.startsWith('cet46|')), poolF.fresh.length);
const poolZ = V2.scanPool('z', Date.now() + 8640000000);
check('朱陈昕的会话来自中考库', poolZ.fresh.length === 1126 && poolZ.fresh.every(it => it.w.key.startsWith('zhongkao|')), poolZ.fresh.length);
check('两库互不串词', !poolZ.fresh.some(it => it.w.key.startsWith('cet46|')) && !poolF.fresh.some(it => it.w.key.startsWith('zhongkao|')));

console.log('[3] 旧进度迁移：v1 数字序号 → v3 全 key');
const legacyStates = { 0: { e2c: { stage: 4, last: 123, wrong: false, due: 999, reps: 4, lapses: 0, ease: 2.5, interval: 60 } } };
const dbV1 = { users: { u0: { name: '老', states: JSON.parse(JSON.stringify(legacyStates)), settings: {}, daily: {}, streak: 0, lastDay: '' } }, current: 'u0' };
const mig1 = V2.migrateDB(JSON.parse(JSON.stringify(dbV1)));
check('v1 → zhongkao|1|organized', JSON.stringify(mig1.users.u0.states['zhongkao|1|organized'].e2c) === JSON.stringify(legacyStates[0].e2c) && mig1.v === 3);
const v1m = mig1.users.u0.states;
check('v1 迁移后无数字键', Object.keys(v1m).every(k => k.includes('|') && k.startsWith('zhongkao|')));

console.log('[4] 旧进度迁移：v2 两段 key → v3 加前缀');
const dbV2 = { v: 2, users: { u0: { name: '昨', states: { '1|organized': { e2c: { stage: 2, last: 99, wrong: true, due: 5, reps: 0, lapses: 1, ease: 2.3, interval: 10 } } }, settings: { mode: 'mix' }, daily: {}, streak: 0, lastDay: '' } }, current: 'u0' };
const mig2 = V2.migrateDB(JSON.parse(JSON.stringify(dbV2)));
check('v2 → zhongkao|1|organized', !!mig2.users.u0.states['zhongkao|1|organized'] && mig2.users.u0.states['zhongkao|1|organized'].e2c.last === 99, Object.keys(mig2.users.u0.states));

console.log('[5] 词库动态增减不影响已学进度');
const ext2 = JSON.parse(JSON.stringify(ext));
ext2.zhongkao.units['9'].splice(0, 20);            // 中考库 Unit9 砍 20 词
ext2.cet46.units['1'].unshift(['brandnew', '新词', 'n']); // 四六级库头插
const e3 = makeEnv(ext2); runScript(e3);
const V3 = e3.sandbox.window.__VOCAB__;
check('中考库变为 543', V3.WORDS_BY_DICT.zhongkao.length === 543, V3.WORDS_BY_DICT.zhongkao.length);
check('四六级 301 且新词在列', V3.WORDS_BY_DICT.cet46.length === 301 && V3.WORDS_BY_DICT.cet46.some(w => w.key === 'cet46|1|brandnew'));
// 丰哥已学一个四六级词，词库变动后仍能进队列
V3.restoreText(JSON.stringify({ data: { v: 3, users: { f: { name: '丰哥', states: { 'cet46|1|abandon': { e2c: { stage: 3, last: 77, wrong: false, due: 1, reps: 3, lapses: 0, ease: 2.5, interval: 1440 } } }, settings: { dict: 'cet46', dir: 'e2c', round: 20, newPerDay: 20, scope: [], mode: 'mix' }, daily: {}, streak: 1, lastDay: '' } }, current: 'f' } }));
const pool3 = V3.scanPool('f', Date.now() + 8640000000);
check('已学 cet46|1|abandon 仍能进复习队列', pool3.review.concat(pool3.wrong).some(it => it.w.key === 'cet46|1|abandon'));

console.log('[6] schedule / buildOptions 抽查（跨库）');
const st1 = V3.schedule(V3.blankState(), true, 1000000);
check('首答对 = 10分钟后', st1.due - 1000000 === 600000);
const opts = V3.buildOptions(V3.WORDS_BY_DICT.cet46[0], 'e2c');
check('四六级选择题 4 选项', opts.length === 4 && opts.includes(V3.WORDS_BY_DICT.cet46[0].zh));

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
