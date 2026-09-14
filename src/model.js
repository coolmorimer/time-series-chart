export const keys = ['area','bar','spline','line'];
export function normalize(data) {
  return Object.fromEntries(keys.map(key=>{
    if (!Array.isArray(data[key])) throw new TypeError(`${key} must be an array`);
    const seen=new Set();
    const points=data[key].map(({time,value})=>{
      const timestamp = typeof time==='number' ? time : Date.parse(time);
      if (!Number.isFinite(timestamp) || Math.abs(timestamp)>8.64e15) throw new TypeError('Invalid timestamp');
      if (value!==null && (typeof value!=='number'||!Number.isFinite(value))) throw new TypeError('Value must be finite or null');
      if(seen.has(timestamp)) throw new TypeError(`Duplicate timestamp in ${key}`);
      seen.add(timestamp); return {time:timestamp,value};
    }).sort((a,b)=>a.time-b.time);
    return [key,points];
  }));
}
export function segments(points) {
  const result=[]; let current=[];
  for(const p of points) { if(p.value===null){if(current.length)result.push(current);current=[];}else current.push(p); }
  if(current.length)result.push(current); return result;
}
// Shape-preserving cubic Hermite interpolation: no overshoot between observations.
export function splinePath(points) {
  if(!points.length)return '';
  let d=`M ${points[0].x} ${points[0].y}`;
  const slopes=points.slice(1).map((p,i)=>(p.y-points[i].y)/(p.x-points[i].x));
  const tangents=points.map((_,i)=>i===0?slopes[0]:i===points.length-1?slopes[i-1]:slopes[i-1]*slopes[i]<=0?0:2/(1/slopes[i-1]+1/slopes[i]));
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],h=(b.x-a.x)/3;d+=` C ${a.x+h} ${a.y+h*tangents[i-1]}, ${b.x-h} ${b.y-h*tangents[i]}, ${b.x} ${b.y}`;}
  return d;
}
