const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const make=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/engine.js'),'utf8')+'\nmakeEngine;');
test('three seeds remain finite over 30 simulated days',()=>{
 for(const seed of [2048,77,12345]){
  const e=make(seed);for(let i=0;i<720;i++)e.step();
  assert.equal(e.state.day,31);
  assert.ok(Object.values(e.stats()).every(Number.isFinite));
  assert.ok(e.state.agents.every(a=>a.money>=0&&a.friends.length<=8&&Number.isFinite(a.connection)));
  assert.ok(e.state.tiles.every(t=>t.stock>=0&&Number.isFinite(t.capital)));
 }
});
test('construction charges exact price and initializes inventory',()=>{
 const e=make();const t=e.state.tiles.find(t=>t.type==='empty');const before=e.state.treasury;
 assert.ok(e.build(t.id,'shop'));assert.equal(e.state.treasury,before-e.types.shop.cost);assert.equal(t.stock,36);assert.equal(e.build(t.id,'park'),false);
});
test('save round trip and deterministic next step',()=>{
 const e=make();for(let i=0;i<36;i++)e.step();const f=make();
 assert.ok(f.load(e.snapshot()));assert.equal(JSON.stringify(f.stats()),JSON.stringify(e.stats()));e.step();f.step();assert.equal(JSON.stringify(f.snapshot()),JSON.stringify(e.snapshot()));
});
test('old version-one saves are upgraded',()=>{
 const e=make();const s=e.snapshot();delete s.economy;delete s.alerts;
 for(const a of s.agents){delete a.connection;delete a.friends;delete a.decision}
 for(const t of s.tiles){delete t.capital;t.stock=0}
 assert.ok(e.load(s));e.step();assert.ok(Number.isFinite(e.stats().food));
});
test('invalid saves are rejected',()=>{assert.equal(make().load(null),false);assert.equal(make().load({version:99}),false)});
