// test_vocab_exam.js — 中考冲刺模式（词形变换）专项测试
const fs=require('fs'),vm=require('vm');
const dir='D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/';
const html=fs.readFileSync(dir+'vocab.html','utf-8');
const m=html.match(/<script>([\s\S]*)<\/script>/)[1];
function makeEl(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},remove(){},click(){},focus(){},
  querySelectorAll:()=>[],setAttribute(){},getAttribute:()=>null};}
const IDB_DATA={};
function makeIDB(){
  return {open(){return {
    set onupgradeneeded(f){}, set onsuccess(f){try{f();}catch(e){}}, set onerror(f){},
    result:{ createObjectStore(){}, transaction(){return { objectStore(){return {
      get(k){const req={result:IDB_DATA[k],set onsuccess(f){try{f();}catch(e){}},set onerror(f){}};return req;},
      put(v,k){IDB_DATA[k]=v;return {set onsuccess(f){try{f();}catch(e){}},set onerror(f){}};}
    };}};}}
  };}};}
function makeEnv(){
  const store={},els={},win={};win.window=win;
  vm.createContext(win);
  ['vocab_words.js','vocab_examples.js','vocab_roots.js','vocab_transforms.js'].forEach(f=>vm.runInContext(fs.readFileSync(dir+f,'utf-8'),win));
  const sb={console,Math,Date,JSON,Object,Array,String,Number,RegExp,Promise,setTimeout,clearTimeout,encodeURIComponent,
    localStorage:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
    document:{getElementById:id=>(els[id]||(els[id]=makeEl())),querySelectorAll:()=>[],querySelector:()=>makeEl(),
      createElement:()=>makeEl(),documentElement:makeEl(),body:makeEl(),addEventListener(){}},
    indexedDB:makeIDB(),alert(){},confirm:()=>false,URL:{createObjectURL:()=>'',revokeObjectURL(){}},
    Blob:function(){},FileReader:function(){this.readAsText=function(){};},window:win};
  return {sb,els,win,store};
}
function boot(){const e=makeEnv();vm.createContext(e.sb);vm.runInContext(m,e.sb);return e;}
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log('  ✓',n);}else{fail++;console.log('  ✗',n,x||'');}};

console.log('[1] 词形变换数据加载');
const e=boot();const V=e.win.__VOCAB__;
ck('词形数据已载入(>50词根)',V.TF_KEYS.length>50,V.TF_KEYS.length);
const totalItems=V.TF_KEYS.reduce((s,k)=>s+V.TRANSFORMS[k].items.length,0);
ck('总题量>100',totalItems>100,totalItems);
ck('care 族有 careful/careless',['careful','careless'].every(a=>V.TRANSFORMS.care.items.some(t=>t.a===a)));
ck('每题含 q/a/zh/tip',V.TF_KEYS.every(k=>V.TRANSFORMS[k].items.every(t=>t.q&&t.a&&t.zh&&t.tip)));

console.log('[2] 词形变换组卷函数');
const tfPool=V.scanTransformPool(Date.now());
ck('调度返回到期+新题',Array.isArray(tfPool.overdue)&&Array.isArray(tfPool.freshTf));
const item=V.transformItem('care',0);
ck('构造题目 key 为 tf|词根|题号',item.key==='tf|care|0',item.key);
ck('题目标记 tf=true',item.tf===true);
const opts=V.transformOptions(item);
ck('选项4个',opts.length===4,opts);
ck('选项含正确答案 careful',opts.includes('careful'),opts);
ck('选项无重复',new Set(opts).size===opts.length,opts);

console.log('[3] 端到端：中考冲刺模式组卷');
const run=code=>vm.runInContext(code,e.sb);
run("DB.users['examuser']=defaultUser('考生');DB.current='examuser';SESSION.refreshMode='exam';buildSession();");
const S=V.getSession();
ck('产出题目',S.queue.length>0,S.queue.length);
const tfQs=S.queue.filter(x=>x.tf);
ck('含词形变换题',tfQs.length>0,tfQs.length);
ck('词形题约占四成',tfQs.length>=Math.floor(S.queue.length*0.3),{tf:tfQs.length,total:S.queue.length});
ck('词形题挂了选项',tfQs.every(x=>x.tfOpts&&x.tfOpts.length>=2));

console.log('[4] 端到端：渲染 + 判分');
run('renderStudy();');
ck('渲染出词形变换标识', /中考词形变换/.test(e.els['studyBox'].innerHTML));
ck('渲染出词根提示', /tfroot/.test(e.els['studyBox'].innerHTML));
// 答对一道词形题
const res=run(`(function(){
  const it=SESSION.queue.find(x=>x.tf);
  const key=it.key;
  const before=wstate(DB.current,key,'e2c');
  const right=it.tpl.a;
  const wrongOpt=it.tfOpts.find(o=>o!==right);
  // 先答对
  SESSION.answered=false;
  answer(it.tfOpts.indexOf(right),it.tfOpts,it,false,'');
  const afterRight=wstate(DB.current,key,'e2c');
  // 再答错（另一题）
  const it2=SESSION.queue.filter(x=>x.tf)[1]||it;
  const key2=it2.key;
  SESSION.answered=false;
  answer(it2.tfOpts.indexOf(it2.tfOpts.find(o=>o!==it2.tpl.a)),it2.tfOpts,it2,false,'');
  const afterWrong=wstate(DB.current,key2,'e2c');
  return {before,afterRight,afterWrong,fb:document.getElementById('fb').innerHTML};
})()`);
ck('答对后 stage 上升',res.afterRight.stage>=res.before.stage+1,{b:res.before.stage,a:res.afterRight.stage});
ck('答对后非错词',res.afterRight.wrong===false);
ck('答错后标记错词',res.afterWrong.wrong===true);
ck('反馈展示考点 tip',/考点/.test(res.fb));
ck('反馈展示词形变换答案',/→/.test(res.fb));

console.log('[5] 进度隔离：词形题与单词进度互不干扰');
const fp1=V.memoryFingerprint();
run("DB.users['examuser'].states['zhongkao|1|organized']={e2c:{stage:2,interval:60,due:Date.now()+1000,reps:2,lapses:0,ease:2.5,last:Date.now(),wrong:false}};saveDB();");
const wordState=run("wstate(DB.current,'zhongkao|1|organized','e2c').stage");
const tfState=run("wstate(DB.current,'tf|care|0','e2c').stage");
ck('单词进度独立',wordState===2,wordState);
ck('词形进度独立(undefined→0)',(tfState===0||tfState===undefined),tfState);

console.log('\n结果: '+pass+' 通过, '+fail+' 失败');
if(fail)process.exit(1);
