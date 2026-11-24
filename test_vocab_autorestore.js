// test_vocab_autorestore.js — 三层自动恢复（localStorage 主+镜像 + IndexedDB 快照）专项测试
const fs=require('fs'),vm=require('vm');
const dir='D:/WorkBuddy/Claw/work/family-nav/fengge-dashboard/';
const html=fs.readFileSync(dir+'vocab.html','utf-8');
const m=html.match(/<script>([\s\S]*)<\/script>/)[1];
const wordsSrc=fs.readFileSync(dir+'vocab_words.js','utf-8');

function makeEl(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},
  classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},remove(){},click(){},focus(){},
  querySelectorAll:()=>[],setAttribute(){},getAttribute:()=>null};}
// 共享的 IndexedDB mock 存储（模拟同一浏览器的持久快照）
const IDB_DATA={};
function makeIDB(){return {open(){return {
  set onupgradeneeded(f){}, set onsuccess(f){try{f();}catch(e){}}, set onerror(f){},
  result:{ createObjectStore(){}, transaction(){return { objectStore(){return {
    get(k){const req={result:IDB_DATA[k],set onsuccess(f){try{f({target:{result:IDB_DATA[k]}});}catch(e){}},set onerror(f){}};return req;},
    put(v,k){IDB_DATA[k]=v;return {set onsuccess(f){try{f();}catch(e){}},set onerror(f){}};}
  };}};}}
};}};}
function makeEnv(store){
  const els={},win={};win.window=win;
  vm.createContext(win);vm.runInContext(wordsSrc,win);
  const sb={console,Math,Date,JSON,Object,Array,String,Number,RegExp,Promise,setTimeout,clearTimeout,encodeURIComponent,
    localStorage:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
    document:{getElementById:id=>(els[id]||(els[id]=makeEl())),querySelectorAll:()=>[],querySelector:()=>makeEl(),
      createElement:()=>makeEl(),documentElement:makeEl(),body:makeEl(),addEventListener(){}},
    indexedDB:makeIDB(),alert(){},confirm:()=>false,URL:{createObjectURL:()=>'',revokeObjectURL(){}},
    Blob:function(){},FileReader:function(){this.readAsText=function(){};},window:win};
  return {sb,els,win};
}
function boot(store){const e=makeEnv(store);vm.createContext(e.sb);vm.runInContext(m,e.sb);return e;}
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log('  ✓',n);}else{fail++;console.log('  ✗',n,x||'');}};

(async()=>{
console.log('[1] 三层保险函数已暴露');
const e0=boot({});const V0=e0.win.__VOCAB__;
ck('bkAutoRestore 可用', typeof V0.bkAutoRestore==='function');
ck('bkGetSnap / bkSetSnap 可用', typeof V0.bkGetSnap==='function'&&typeof V0.bkSetSnap==='function');

console.log('[2] 构造有效进度 + 写入三层');
const store={};const e=boot(store);const V=e.win.__VOCAB__;
vm.runInContext("DB.users['u0']=defaultUser('康哥');DB.current='u0';DB.users.u0.states['zhongkao|1|organized']={e2c:{stage:4,interval:5760,due:Date.now()+1000,reps:5,lapses:0,ease:2.5,last:Date.now(),wrong:false},c2e:{stage:3,interval:2880,due:Date.now()+1000,reps:4,lapses:0,ease:2.5,last:Date.now(),wrong:false}};saveDB();",e.sb);
const dbStr=store['vocab9a_v1'];
ck('主记录已写', !!dbStr);
ck('镜像已写且等于主记录', store['vocab9a_v1_mirror']===dbStr);
await V.bkSetSnap(dbStr);
ck('快照已写入 IndexedDB', (await V.bkGetSnap())===dbStr);
const fpOriginal=V.memoryFingerprint();
ck('原始指纹有效', /^[0-9a-f]{8}-[0-9a-f]{8}$/.test(fpOriginal), fpOriginal);

console.log('[3] 主+镜像全损坏 → 从快照自动恢复');
const store2={'vocab9a_v1':'{坏数据','vocab9a_v1_mirror':'{坏数据'};
const e2=boot(store2);const V2=e2.win.__VOCAB__;
const restored=await V2.bkAutoRestore();
ck('触发自动恢复', restored===true);
ck('进度指纹完整还原', V2.memoryFingerprint()===fpOriginal, {got:V2.memoryFingerprint(),want:fpOriginal});
const learned=vm.runInContext("Object.keys(DB.users.u0.states).length",e2.sb);
ck('已学词条恢复', learned===1, learned);
ck('恢复后主记录被重写', /"users"/.test(store2['vocab9a_v1']));

console.log('[4] 主记录有效时不应误触发恢复');
const store3={'vocab9a_v1':dbStr,'vocab9a_v1_mirror':dbStr};
const e3=boot(store3);const V3=e3.win.__VOCAB__;
const restored3=await V3.bkAutoRestore();
ck('主记录有效→不触发恢复', restored3===false);
ck('主记录有效→指纹不变', V3.memoryFingerprint()===fpOriginal);

console.log('[5] 三层全空 → 不崩溃，建默认用户');
delete IDB_DATA['snapshot'];   // 清掉前面写入的快照，模拟真正的全新环境
const e4=boot({});const V4=e4.win.__VOCAB__;
const restored4=await V4.bkAutoRestore();
ck('全空时不触发恢复', restored4===false);
ck('默认用户存在', vm.runInContext("Object.keys(DB.users).length",e4.sb)>=1);

console.log('[6] 快照损坏但主记录有效 → 安全降级');
IDB_DATA['snapshot']='not-json';
const store5={'vocab9a_v1':dbStr,'vocab9a_v1_mirror':dbStr};
const e5=boot(store5);const V5=e5.win.__VOCAB__;
const restored5=await V5.bkAutoRestore();
ck('快照损坏不误触发', restored5===false);
ck('进度仍完整', V5.memoryFingerprint()===fpOriginal);

console.log('\n结果: '+pass+' 通过, '+fail+' 失败');
if(fail)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
