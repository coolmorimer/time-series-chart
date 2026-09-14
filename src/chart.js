import {keys,normalize,segments,splinePath} from './model.js';
import './chart.css';
const NS='http://www.w3.org/2000/svg';
const defaults={area:{label:'Cost',color:'#fff89b'},bar:{label:'CPA',color:'#3c70ff'},spline:{label:'ROI confirmed',color:'#078900'},line:{label:'Conversions',color:'#b900ff'}};
const node=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;};
export function createTimeSeriesChart(container,initialData,options={}) {
  if(!(container instanceof HTMLElement))throw new TypeError('Container must be an HTMLElement');
  let data=normalize(initialData),times=[],active=-1,width=590,height=294,destroyed=false;
  const config=Object.fromEntries(keys.map(k=>[k,{...defaults[k],...options.series?.[k]}]));
  const root=document.createElement('div');root.className='four-chart';root.tabIndex=0;root.setAttribute('role','group');root.setAttribute('aria-label','Time series chart. Use left and right arrows to explore dates.');
  const svg=node('svg',{'aria-hidden':'true'}),tip=document.createElement('div');tip.className='chart-tooltip';tip.hidden=true;
  const live=document.createElement('span');live.className='sr-only';live.setAttribute('aria-live','polite');root.append(svg,tip,live);container.append(root);
  const formatDate=t=>new Intl.DateTimeFormat(options.locale??'ru-RU',{timeZone:'UTC',day:'2-digit',month:'2-digit',year:'numeric'}).format(t);
  const formatValue=(k,v)=>v===null?'—':options.formatValue?options.formatValue(v,k):String(v);
  let positions={};
  function render(){
    width=root.clientWidth||590;height=root.clientHeight||294;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.replaceChildren();positions={};
    times=[...new Set(keys.flatMap(k=>data[k].map(p=>p.time)))].sort((a,b)=>a-b);
    const pad=width*.1;const x=t=>times.length<2?width/2:pad+(t-times[0])/(times.at(-1)-times[0])*(width-2*pad);
    for(const k of ['area','bar','spline','line']){
      const values=data[k].filter(p=>p.value!==null).map(p=>p.value);
      const domain=config[k].domain??[Math.min(0,...values),Math.max(0,...values)*1.2||1];
      if(!Array.isArray(domain)||domain.length!==2||!domain.every(Number.isFinite)||domain[1]<=domain[0])throw new TypeError(`Invalid domain for ${k}`);
      const y=v=>height-(v-domain[0])/(domain[1]-domain[0])*height;
      const baseline=Math.max(0,Math.min(height,y(0)));
      positions[k]=data[k].map(p=>({...p,x:x(p.time),y:p.value===null?null:y(p.value)}));
      if(k==='bar')for(const p of positions[k]){if(p.y===null)continue;const bw=Math.min(36,(width-2*pad)/Math.max(times.length,1)*.36);svg.append(node('rect',{x:p.x-bw/2,y:Math.min(p.y,baseline),width:bw,height:Math.max(1,Math.abs(baseline-p.y)),rx:3,fill:config[k].color,stroke:'#fff','stroke-width':1}));}
      else for(const group of segments(positions[k])){
        let d=k==='spline'?splinePath(group):group.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
        if(k==='area')d+=` L ${group.at(-1).x} ${baseline} L ${group[0].x} ${baseline} Z`;
        svg.append(node('path',{d,fill:k==='area'?config[k].color:'none','fill-opacity':.65,stroke:k==='area'?'none':config[k].color,'stroke-width':1.7}));
        if(k==='line')for(const p of group)svg.append(node('rect',{x:p.x-5.5,y:p.y-5.5,width:11,height:11,fill:config[k].color}));
      }
    }
    if(!times.length){const empty=node('text',{x:width/2,y:height/2,'text-anchor':'middle',fill:'#777'});empty.textContent='Нет данных';svg.append(empty);}
    show(active);
  }
  function show(index){
    active=index>=0&&index<times.length?index:-1;svg.querySelectorAll('.halo').forEach(e=>e.remove());tip.hidden=active<0;if(active<0)return;
    const time=times[active];tip.replaceChildren();const date=document.createElement('div');date.className='tooltip-date';date.textContent=formatDate(time);tip.append(date);
    let anchor;
    for(const k of keys){const p=positions[k].find(p=>p.time===time);const value=p?.value??null;const row=document.createElement('div');row.className='tooltip-row';const dot=document.createElement('i');dot.style.background=config[k].color;const label=document.createElement('span');label.textContent=`${config[k].label}: `;const strong=document.createElement('b');strong.textContent=formatValue(k,value);row.append(dot,label,strong);tip.append(row);
      if(p?.y!=null){anchor??=p; if(k==='line'||k==='spline'){svg.append(node('circle',{class:'halo',cx:p.x,cy:p.y,r:19,fill:config[k].color,opacity:.16}));svg.append(node('circle',{class:'halo',cx:p.x,cy:p.y,r:2.5,fill:config[k].color,stroke:'white'}));}}
    }
    live.textContent=tip.textContent;
    const ax=anchor?.x??width/2;const left=ax-tip.offsetWidth/2;
    tip.style.left=`${Math.max(8,Math.min(width-tip.offsetWidth-8,left))}px`;tip.style.top=`${Math.max(8,Math.min(height-tip.offsetHeight-8,height*.15))}px`;
  }
  function pointer(e){if(!times.length)return;const px=e.clientX-root.getBoundingClientRect().left;const all=Object.values(positions).flat();let nearest=times[0],distance=Infinity;for(const p of all){if(Math.abs(p.x-px)<distance){distance=Math.abs(p.x-px);nearest=p.time;}}show(times.indexOf(nearest));}
  const hide=()=>show(-1);
  const key=e=>{if(e.key==='Escape')hide();if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();show(e.key==='Home'?0:e.key==='End'?times.length-1:Math.max(0,Math.min(times.length-1,active+(e.key==='ArrowLeft'?-1:1))));}};
  root.addEventListener('pointermove',pointer);root.addEventListener('pointerdown',pointer);root.addEventListener('pointerleave',hide);root.addEventListener('blur',hide);root.addEventListener('keydown',key);
  const observer=new ResizeObserver(render);observer.observe(root);render();
  return {setData(next){if(destroyed)throw new Error('Chart is destroyed');const validated=normalize(next);data=validated;active=-1;render();},destroy(){observer.disconnect();root.remove();destroyed=true;}};
}
