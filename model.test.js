import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,segments,splinePath} from './src/model.js';
const empty=()=>({area:[],bar:[],spline:[],line:[]});
test('sorts dates, preserves zero and null',()=>{const d=empty();d.area=[{time:'2026-06-12',value:null},{time:'2026-06-10',value:0}];assert.deepEqual(normalize(d).area.map(p=>p.value),[0,null]);});
test('rejects duplicates, invalid dates and nonfinite values',()=>{for(const points of [[{time:'bad',value:1}],[{time:0,value:Infinity}],[{time:0,value:1},{time:0,value:2}]])assert.throws(()=>normalize({...empty(),area:points}));});
test('nulls break paths rather than bridge missing samples',()=>assert.equal(segments([{value:1},{value:null},{value:2}]).length,2));
test('spline passes through observations',()=>{const d=splinePath([{x:0,y:0},{x:10,y:20},{x:20,y:0}]);assert.match(d,/10 20/);assert.ok(d.endsWith('20 0'));});
