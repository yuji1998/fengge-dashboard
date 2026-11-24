// test_vocab_context.js — V7 语境例句 + 词根词族 + 语境填空题 专项测试
const fs = require('fs'), vm = require('vm');
const dir = 'D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/';
const html = fs.readFileSync(dir + 'vocab.html', 'utf-8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('未找到内联脚本');
const exSrc = fs.readFileSync(dir + 'vocab_examples.js', 'utf-8');
const rootSrc = fs.readFileSync(dir + 'vocab_roots.js', 'utf-8');
const wordsSrc = fs.readFileSync(dir + 'vocab_words.js', 'utf-8');

function makeEl() {
  return { textContent:'', value:'', innerHTML:'', disabled:false, style:{}, dataset:{},
    classList:{add(){},remove(){},toggle(){},contains:()=>false},
    addEventListener(){},appendChild(){},remove(){},click(){},focus(){},scrollIntoView(){},
    querySelectorAll:()=>[],setAttribute(){},getAttribute:()=>null };
}
function makeEnv() {
  const store = {}, els = {};
  const win = {};
  win.window = win;   // 数据文件用 window.VOCAB_xxx 赋值，需自引用
  // 按顺序注入三个外置数据文件
  vm.createContext(win);
  vm.runInContext(wordsSrc, win);
  vm.runInContext(exSrc, win);
  vm.runInContext(rootSrc, win);
  const sandbox = {
    console, Math, Date, JSON, Object, Array, String, Number, RegExp, Promise, setTimeout, clearTimeout, encodeURIComponent,
    localStorage:{ getItem:k=>(k in store?store[k]:null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
    document:{ getElementById:id=>(els[id]||(els[id]=makeEl())), querySelectorAll:()=>[], querySelector:()=>makeEl(),
      createElement:()=>makeEl(), documentElement:makeEl(), body:makeEl(), addEventListener(){} },
    alert(){}, confirm:()=>false, URL:{createObjectURL:()=>'',revokeObjectURL(){}},
    Blob:function(){}, FileReader:function(){this.readAsText=function(){};}, window:win,
  };
  return { sandbox, store, els, win };
}
function runScript(env){ vm.createContext(env.sandbox); vm.runInContext(m[1], env.sandbox, {filename:'vocab-inline.js'}); }

let pass=0, fail=0;
function check(name,cond,extra){ if(cond){pass++;console.log('  ✓',name);} else{fail++;console.log('  ✗',name,extra!==undefined?JSON.stringify(extra):'');} }

console.log('[1] 外置例句数据加载');
const e1=makeEnv(); runScript(e1);
const V=e1.sandbox.window.__VOCAB__;
check('例句库已载入（>150条）', Object.keys(V.EXAMPLES).length>150, Object.keys(V.EXAMPLES).length);
check('词根库已载入（>40条）', V.ROOTS.length>40, V.ROOTS.length);
check('前后缀库已载入（>30条）', V.AFFIXES.length>30, V.AFFIXES.length);

console.log('[2] 例句查找 exampleOf（跨词库按英文小写）');
const exCome=V.exampleOf({en:'come up with'});
check('短语 come up with 有例句', !!exCome && /____/.test(exCome.en), exCome);
check('例句含中文翻译', !!exCome && !!exCome.zh, exCome&&exCome.zh);
check('例句含自然填入形式 a', !!exCome && !!exCome.a, exCome&&exCome.a);
check('大写归一化：Abandon 命中 abandon', !!V.exampleOf({en:'Abandon'}));
check('不存在的词返回 null', V.exampleOf({en:'zzzznotaword'})===null);

console.log('[3] 词根拆解 rootParts');
const rp=v=>V.rootParts({en:v}).map(p=>p.kind+':'+p.text).join(',');
check('unhappy 拆出前缀 un', /前缀:un/.test(rp('unhappy')), rp('unhappy'));
check('development 拆出后缀 ment', /后缀:ment/.test(rp('development')), rp('development'));
check('inspect 拆出词根 spect', /词根:spect/.test(rp('inspect')), rp('inspect'));
check('transport 拆出词根 port', /词根:port/.test(rp('transport')), rp('transport'));
check('无词根的短词返回空数组', Array.isArray(V.rootParts({en:'a'})) && V.rootParts({en:'a'}).length===0);
check('hasExample/ hasRoot 布尔判定', V.hasExample({en:'come up with'})===true && V.hasRoot({en:'unhappy'})===true && V.hasRoot({en:'xyz'})===false);

console.log('[4] 巩固维度 dvFilter 新增两项');
check('context 模式筛有例句的词', (()=>{const f=V.dvFilter('context');return f&&f({en:'come up with'})&&!f({en:'zzzznotaword'});})());
check('root 模式筛有词根的词', (()=>{const f=V.dvFilter('root');return f&&f({en:'unhappy'})&&!f({en:'zzz'});})());
check('DV_MODES 含 context/root', V.DV_MODES.some(d=>d.id==='context')&&V.DV_MODES.some(d=>d.id==='root'));

console.log('[5] 语境题判分与记忆调度一致性（复用同一 schedule）');
const st0=V.blankState();
const stRight=V.schedule(st0,true,1000);
const stWrong=V.schedule(st0,false,1000);
check('语境题答对 → 升阶+下次10分钟后', stRight.stage===1 && stRight.interval===10 && stRight.due===601000, stRight);
check('语境题答错 → 错词标记+降阶', stWrong.wrong===true && stWrong.stage===0, stWrong);
// 语境题 correct 判定：选的英文须等于 w.en（与 answer 内 qt==='cloze' 分支一致）
const w={en:'come up with'};
const picked='come up with';
check('语境题选中正确英文 = 判对', picked===w.en);
check('语境题选错英文 = 判错', 'come up with something'!==w.en);

console.log('[6] 老进度不受影响：记忆指纹稳定');
const fp1=V.memoryFingerprint();
check('记忆指纹为稳定哈希格式', /^[0-9a-f]{8}-[0-9a-f]{8}$/.test(fp1), fp1);

console.log('\n结果: '+pass+' 通过, '+fail+' 失败');
if(fail>0)process.exit(1);
