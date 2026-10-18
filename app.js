const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const D=s=>new Date(s+'T12:00:00'),I=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const add=(s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return I(d)};
const dm=s=>s.slice(8)+'/'+s.slice(5,7),dmy=s=>dm(s)+'/'+s.slice(0,4);
const dn=s=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][D(s).getDay()];
const f=n=>String(Math.round(n*100)/100),sg=n=>(n>0?'+':'')+f(n),cls=n=>n<0?'neg':'pos';
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DEFSV=['Service 1','Service 2'],ZH_AVG=10,ZH_WEEKS=4,TL={shift:'Shift',al:'Annual leave',sick:'Sick',off:'Day off',other:'Other'};
// Accounting periods from the chart (name = pay month, start Monday, weeks)
const P=[["April 2026","2026-03-02",4],["May 2026","2026-03-30",5],["June 2026","2026-05-04",4],["July 2026","2026-06-01",4],["August 2026","2026-06-29",5],["September 2026","2026-08-03",4],["October 2026","2026-08-31",4],["November 2026","2026-09-28",5],["December 2026","2026-11-02",4],["January 2027","2026-11-30",5],["February 2027","2027-01-04",4],["March 2027","2027-02-01",4]].map(([n,s,w])=>({n,s,w,e:add(s,w*7-1)}));
let S={entries:[],contract:39,svcs:DEFSV.slice(),last:{st:'08:00',en:'16:00',br:30,svc:DEFSV[0]}},editId=null,pi=0;
function clean(x){const o={};if(!x||typeof x!=='object')return o;
 const DT=/^\d{4}-\d{2}-\d{2}$/,TM=/^([01]\d|2[0-3]):[0-5]\d$/,m=t=>+t.slice(0,2)*60+ +t.slice(3,5);
 const str=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,' ').slice(0,n):'',num=(v,a,b)=>{v=+v;return isFinite(v)?Math.min(b,Math.max(a,v)):0};
 const blk=b=>b&&TM.test(b.st)&&TM.test(b.en)?{st:b.st,en:b.en,br:num(b.br,0,600),svc:str(b.svc,40)}:null;
 if(Array.isArray(x.entries))o.entries=x.entries.slice(0,5000).map(e=>{if(!e||!DT.test(e.date)||!Object.keys(TL).includes(e.type))return null;
  const r={id:/^[\w-]{1,30}$/.test(e.id)?e.id:Date.now()+Math.random().toString(36).slice(2,6),date:e.date,type:e.type,note:str(e.note,300)};
  if(e.type==='shift'){const bl=(Array.isArray(e.blocks)?e.blocks:e.st?[e]:[]).slice(0,12).map(blk).filter(Boolean);if(!bl.length)return null;r.blocks=bl;r.h=bl.reduce((a,b)=>a+Math.max(0,((m(b.en)-m(b.st)+1440)%1440-b.br)/60),0)}
  else{r.h=e.type==='other'?0:num(e.h,0,24);if(e.type!=='off'&&e.type!=='other')r.svc=str(e.svc,40)}return r}).filter(Boolean);
 const c=+x.contract;if(isFinite(c)&&c>=0&&c<=80)o.contract=c;
 if(Array.isArray(x.svcs)){const l=[...new Set(x.svcs.map(v=>str(v,40).trim()).filter(Boolean))].slice(0,30);if(l.length)o.svcs=l}
 const lb=blk(x.last);if(lb)o.last=lb;if(x.seen)o.seen=1;return o}
try{S=Object.assign(S,clean(JSON.parse(localStorage.getItem('rotaLogger'))))}catch(e){}
const save=()=>{try{localStorage.setItem('rotaLogger',JSON.stringify(S))}catch(e){toast('Could not auto-save – use Export backup')}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)}
const today=I(new Date());
pi=Math.max(0,P.findIndex(p=>today>=p.s&&today<=p.e));if(today>P[P.length-1].e)pi=P.length-1;

const sh=s=>String(s||'').slice(0,14);
const sc=s=>{const i=S.svcs.indexOf(s);return i<0?'sx':'s'+i%6};
const mins=(a,b)=>{const m=x=>+x.slice(0,2)*60+ +x.slice(3,5),d=m(b)-m(a);return d<0?d+1440:d};
const bh=b=>Math.max(0,(mins(b.st,b.en)-(+b.br||0))/60);
const bks=e=>e.blocks||(e.st?[{st:e.st,en:e.en,br:e.br||0,svc:e.svc}]:[]);
const sopts=v=>S.svcs.concat(v&&!S.svcs.includes(v)?[v]:[]).map(s=>`<option${s===v?' selected':''}>${esc(s)}</option>`).join('')+'<option value="__o">+ Other service…</option>';
const row=(b={})=>`<div class="blk"><div class="bt"><input type="time" value="${b.st||''}"><span>–</span><input type="time" value="${b.en||''}"></div><div class="bs"><select>${sopts(b.svc||S.last.svc)}</select><input type="number" min="0" step="5" inputmode="numeric" placeholder="break min" value="${b.br||''}"><button type="button" class="alt rm">×</button></div></div>`;
const setBlocks=b=>{$('#blocks').innerHTML=(b&&b.length?b:[{}]).map(row).join('')};
const rawBlocks=()=>[...document.querySelectorAll('#blocks .blk')].map(r=>{const i=r.querySelectorAll('input');return{st:i[0].value,en:i[1].value,br:+i[2].value||0,svc:r.querySelector('select').value}});
const getBlocks=()=>rawBlocks().filter(b=>b.st&&b.en);
function otherSvc(sel){if(sel.value!=='__o')return;const n=(prompt('Name of the service / location:')||'').trim().slice(0,40);
 if(n&&!S.svcs.includes(n)){S.svcs.push(n);save();$('#svct').value=S.svcs.join('\n')}
 const keep=n||S.last.svc;document.querySelectorAll('#blocks select,#svc').forEach(x=>x.innerHTML=sopts(x===sel?keep:x.value))}
function formHours(){const t=$('#type').value;if(t==='off'||t==='other')return 0;if(t!=='shift')return+$('#lh').value||0;return getBlocks().reduce((a,b)=>a+bh(b),0)}
function fields(){const t=$('#type').value,l=t==='al'||t==='sick';
 $('#g-svc').style.display=l?'':'none';$('#g-lh').style.display=l?'':'none';$('#g-bl').style.display=t==='shift'?'':'none';
 if(l&&!$('#lh').value)$('#lh').value=f(S.contract/5);
 $('#nl').textContent=t==='other'?'Describe the situation (required)':'Note (optional)';
 $('#prev').innerHTML='Hours: <span class="pos">'+f(formHours())+' h</span>'}
function resetForm(d){editId=null;$('#date').value=d||today;$('#type').value='shift';$('#svc').innerHTML=sopts(S.last.svc);setBlocks([{st:S.last.st,en:S.last.en,br:S.last.br,svc:S.last.svc}]);$('#lh').value='';$('#note').value='';$('#save').textContent='Add entry';$('#cancel').style.display='none';fields()}
function saveEntry(){const date=$('#date').value,t=$('#type').value;if(!date)return toast('Pick a date');
 if(t==='other'&&!$('#note').value.trim()){$('#note').focus();return toast('Please describe the situation in the note')}
 const bl=getBlocks();if(t==='shift'){if(!bl.length)return toast('Enter start and finish times');if(rawBlocks().some(b=>!!b.st!==!!b.en))return toast('One part has only one time')}
 const e={id:editId||Date.now()+Math.random().toString(36).slice(2,5),date,type:t,h:formHours(),note:$('#note').value.trim()};
 if(t==='shift'){e.blocks=bl;S.last={st:bl[0].st,en:bl[0].en,br:bl[0].br,svc:bl[0].svc}}else if(t!=='off'&&t!=='other')e.svc=$('#svc').value;
 if(editId)S.entries=S.entries.map(x=>x.id===editId?e:x);else S.entries.push(e);
 save();const i=P.findIndex(p=>date>=p.s&&date<=p.e);if(i>=0)pi=i;
 const was=!!editId;resetForm(was?date:add(date,1));render();toast(was?'Updated':'Saved')}
const itxt=e=>e.type==='shift'?(bks(e).length>1?bks(e).length+' parts':bks(e).map(b=>b.st+'-'+b.en+(b.br?' (−'+b.br+'m)':'')).join('')||'Shift'):TL[e.type];
const sum=a=>a.reduce((t,e)=>t+e.h,0);
const svcH=es=>{const by={};es.forEach(e=>{if(e.type==='shift')bks(e).forEach(b=>by[b.svc]=(by[b.svc]||0)+bh(b));else if(e.svc)by[e.svc]=(by[e.svc]||0)+e.h});return by};
const fst=e=>(bks(e)[0]||{st:''}).st;
function data(){const p=P[pi],es=S.entries.filter(e=>e.date>=p.s&&e.date<=p.e).sort((a,b)=>(a.date+fst(a))<(b.date+fst(b))?-1:1),C=S.contract,tot=sum(es);return{p,es,C,tot,bal:tot-C*p.w}}
function avg12(){const ds=S.entries.map(e=>e.date).sort();if(!ds.length)return null;
 const mon=x=>{const d=D(x);d.setDate(d.getDate()-(d.getDay()+6)%7);return I(d)},tw=mon(today);
 const n=Math.min(12,Math.round((D(tw)-D(mon(ds[0])))/6048e5));if(n<1)return null;
 const from=add(tw,-7*n);return{n,avg:sum(S.entries.filter(e=>e.date>=from&&e.date<tw))/n}}
function zhNote(){const a=avg12();if(S.contract>0||!a||a.n<ZH_WEEKS||a.avg<ZH_AVG)return'';
 return`<div class="note noprint">On a zero-hours contract and working around ${Math.round(a.avg)} h a week? The Employment Rights Act 2025 is expected to bring in (during 2027 – date not yet confirmed) a right to be offered guaranteed hours that reflect the hours you regularly work over a reference period; the government's preferred length is 12 weeks. A dated record like this may be useful. Details are still being finalised, so check the latest with your union, ACAS or Citizens Advice. This is general information, not legal advice.</div>`}
const itemHtml=e=>{const b=bks(e),ss=[...new Set(e.type==='shift'?b.map(x=>x.svc):[e.svc])].filter(Boolean);
 const bd=ss.length?ss.map(s=>`<span class="bd ${sc(s)}">${esc(sh(s))}</span>`).join(''):`<span class="bd sx">${TL[e.type]}</span>`;
 return`<div class="it" data-id="${e.id}">${bd}${ss.length||e.type==='shift'?esc(itxt(e)):''}<i>${f(e.h)}h</i><button class="x noprint" data-x="${e.id}">×</button></div>`+(b.length>1?b.map(x=>`<div class="sub bl">${x.st}–${x.en}${x.br?' (−'+x.br+'m)':''} · ${esc(sh(x.svc))} · ${f(bh(x))}h</div>`).join(''):'')+(e.note?`<div class="sub">${esc(e.note)}</div>`:'')};
function render(){const{p,es,C,tot,bal}=data();
 $('#ps').innerHTML=P.map((x,i)=>`<option value="${i}"${i===pi?' selected':''}>${x.n} · ${dm(x.s)}–${dm(x.e)}</option>`).join('');
 $('#pt').textContent='Rota – '+p.n+' ('+dmy(p.s)+' – '+dmy(p.e)+')';
 const by=svcH(es),a=avg12(),no=es.filter(e=>e.type==='other').length,nt=no?`<div class="sub">${no} “Other” entr${no>1?'ies':'y'} counted as 0 h – confirm with your Line Manager</div>`:'';
 const hero=C>0?`<div class="lbl">Period balance · ${p.n}</div><div class="big ${cls(bal)}">${sg(bal)} h</div>
 <div class="sub">${f(tot)} h worked of ${f(C*p.w)} h contract (${p.w} weeks)</div>
 <div class="sub">${bal>0?f(bal)+' h overtime to claim':bal<0?f(-bal)+' h still to work':'Contract met exactly'}</div>`
 :`<div class="lbl">Hours worked · ${p.n}</div><div class="big" style="color:var(--ac)">${f(tot)} h</div><div class="sub">${p.w} weeks · average ${f(tot/p.w)} h per week</div>`+(a?`<div class="sub">Last ${a.n} complete week${a.n>1?'s':''}: average ${f(a.avg)} h per week</div>`:'');
 $('#hero').innerHTML=hero+nt+`<div class="chips">${Object.keys(by).map(s=>`<span class="chip"><span class="bd ${sc(s)}">${esc(sh(s))}</span> ${f(by[s])} h</span>`).join('')}</div>`+zhNote();
 let h='';
 for(let w=0;w<p.w;w++){const ws=add(p.s,w*7),we=add(ws,6),wk=es.filter(e=>e.date>=ws&&e.date<=we),wh=sum(wk),fut=ws>today&&!wk.length;
  h+=`<section class="card wk"><div class="wh"><div>Week ${w+1}<small>${dm(ws)} – ${dm(we)}</small></div><div style="text-align:right"><b>${f(wh)} h</b><small class="${C&&!fut?cls(wh-C):''}">${!C?'':fut?'–':sg(wh-C)+' vs '+C}</small></div></div>`;
  for(let k=0;k<7;k++){const d=add(ws,k),it=wk.filter(e=>e.date===d);
   h+=`<div class="day"><div class="dl${d===today?' today':''}" data-d="${d}">${dn(d)} ${dm(d)}</div><div class="its">${it.length?it.map(itemHtml).join(''):'<span class="mut">—</span>'}</div></div>`}
  h+='</section>'}
 $('#weeks').innerHTML=h}
function build(pdf){const{p,es,C,tot,bal}=data(),L=[],a=(t,b)=>L.push({t,b}),pd=(x,n)=>pdf?String(x).padEnd(n):x;
 const row=(dy,pl,dt,h)=>a(pdf?`${pd(dy,9)}  ${pd(pl,14)}  ${pd(dt,24)}  ${(f(h)+'h').padStart(6)}`:[dy,pl,dt,f(h)+'h'].join(' | '));
 a('ROTA - '+p.n.toUpperCase(),1);a(dmy(p.s)+' to '+dmy(p.e)+' ('+p.w+' weeks)');a('');
 for(let w=0;w<p.w;w++){const ws=add(p.s,w*7),we=add(ws,6),wk=es.filter(e=>e.date>=ws&&e.date<=we),wh=sum(wk);
  a(`WEEK ${w+1} (${dm(ws)} - ${dm(we)})`,1);if(!wk.length)a('No entries');
  wk.forEach(e=>{const dy=dn(e.date)+' '+dm(e.date);
   if(e.type==='shift')bks(e).forEach(b=>row(dy,sh(b.svc),b.st+'-'+b.en+(b.br?', '+b.br+'m break':''),bh(b)));else row(dy,e.svc?sh(e.svc):'-',e.type==='other'?'Other (to be confirmed)':TL[e.type],e.h);
   if(e.note)(pdf?e.note.match(/.{1,68}/g):[e.note]).forEach((x,i)=>a((pdf?'   ':'')+(i?'':'Note: ')+x))});
  a(C?`Week total: ${f(wh)}h (${sg(wh-C)}h vs ${C}h)`:`Week total: ${f(wh)}h`,1);a('')}
 a('BY SERVICE',1);const by=svcH(es);Object.keys(by).forEach(s=>a(s+': '+f(by[s])+'h'));a('');
 if(C){a('PERIOD TOTAL: '+f(tot)+'h of '+f(C*p.w)+'h',1);a('BALANCE: '+sg(bal)+'h'+(bal>0?' (overtime)':bal<0?' (under contract)':''),1)}
 else{a('PERIOD TOTAL: '+f(tot)+'h worked',1);a('Average: '+f(tot/p.w)+'h per week',1);const v=avg12();if(v)a(`Last ${v.n} complete weeks: average ${f(v.avg)}h per week`)}
 const no=es.filter(e=>e.type==='other').length;if(no)a(`Note: ${no} "Other" entr${no>1?'ies are':'y is'} counted as 0h until confirmed with the Line Manager.`);
 a('');a('Logged '+dmy(today));return L}
const summary=()=>build(0).map(l=>l.t).join('\n');
function makePDF(L){const per=52,pg=[];for(let i=0;i<L.length;i+=per)pg.push(L.slice(i,i+per));
 const o=[];o[1]='<</Type/Catalog/Pages 2 0 R>>';
 o[2]=`<</Type/Pages/Kids [${pg.map((_,i)=>(5+i*2)+' 0 R').join(' ')}]/Count ${pg.length}>>`;
 o[3]='<</Type/Font/Subtype/Type1/BaseFont/Courier/Encoding/WinAnsiEncoding>>';
 o[4]='<</Type/Font/Subtype/Type1/BaseFont/Courier-Bold/Encoding/WinAnsiEncoding>>';
 pg.forEach((g,i)=>{let s='BT 14 TL 50 790 Td\n';
  g.forEach(l=>{s+=`/${l.b?'F2':'F1'} ${l.b?11:10} Tf (${l.t.replace(/[^\x20-\x7e]/g,'?').replace(/[\\()]/g,'\\$&')}) Tj T*\n`});s+='ET';
  o[5+i*2]=`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${6+i*2} 0 R>>`;
  o[6+i*2]=`<</Length ${s.length}>>\nstream\n${s}\nendstream`});
 let out='%PDF-1.4\n',off=[];for(let i=1;i<o.length;i++){off[i]=out.length;out+=`${i} 0 obj\n${o[i]}\nendobj\n`}
 const x=out.length;out+=`xref\n0 ${o.length}\n0000000000 65535 f \n`+off.slice(1).map(v=>String(v).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<</Size ${o.length}/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`;
 return new Blob([out],{type:'application/pdf'})}
function savePDF(){const n='rota-'+P[pi].n.replace(' ','-')+'.pdf',a=document.createElement('a');
 a.href=URL.createObjectURL(makePDF(build(1)));a.download=n;document.body.appendChild(a);a.click();a.remove();toast('PDF saved: '+n+' (check your Downloads)')}
async function copy(txt){try{await navigator.clipboard.writeText(txt)}catch(e){const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}toast('Copied')}

$('#save').onclick=saveEntry;$('#cancel').onclick=()=>resetForm();
$('#type').addEventListener('change',()=>{$('#lh').value='';fields()});
$('#lh').addEventListener('input',fields);$('#blocks').addEventListener('input',fields);
$('#blocks').addEventListener('change',e=>{if(e.target.tagName==='SELECT')otherSvc(e.target);fields()});
$('#blocks').addEventListener('click',e=>{if(e.target.classList.contains('rm')&&document.querySelectorAll('#blocks .blk').length>1){e.target.closest('.blk').remove();fields()}});
$('#svc').onchange=e=>otherSvc(e.target);
$('#addb').onclick=()=>{const l=rawBlocks().pop()||{};$('#blocks').insertAdjacentHTML('beforeend',row({svc:l.svc}))};
$('#ps').onchange=e=>{pi=+e.target.value;render()};
$('#pv').onclick=()=>{if(pi>0){pi--;render()}};$('#nx').onclick=()=>{if(pi<P.length-1){pi++;render()}};
$('#weeks').onclick=ev=>{const x=ev.target.closest('[data-x]');
 if(x){ev.stopPropagation();if(confirm('Delete this entry?')){S.entries=S.entries.filter(e=>e.id!==x.dataset.x);save();render()}return}
 const it=ev.target.closest('.it');
 if(it){const e=S.entries.find(e=>e.id===it.dataset.id);editId=e.id;$('#date').value=e.date;$('#type').value=e.type;$('#svc').innerHTML=sopts(e.svc||S.last.svc);setBlocks(bks(e));$('#lh').value=e.type==='al'||e.type==='sick'?e.h:'';$('#note').value=e.note;$('#save').textContent='Update entry';$('#cancel').style.display='';fields();scrollTo({top:0,behavior:'smooth'});return}
 const dl=ev.target.closest('.dl');if(dl){resetForm(dl.dataset.d);scrollTo({top:0,behavior:'smooth'})}};
$('#clr').onclick=()=>{if(!confirm('This permanently deletes ALL entries and settings stored on this device.\n\nHave you exported a backup? Continue?'))return;
 if((prompt('Type DELETE to confirm')||'').trim().toUpperCase()!=='DELETE')return toast('Cancelled – nothing deleted');
 try{localStorage.removeItem('rotaLogger')}catch(e){}
 S={entries:[],contract:39,svcs:DEFSV.slice(),last:{st:'08:00',en:'16:00',br:30,svc:DEFSV[0]}};
 $('#ct').value=39;$('#svct').value=S.svcs.join('\n');resetForm();render();scrollTo({top:0});toast('All data cleared')};
$('#abt').onclick=()=>{$('#set').open=true;$('#set').scrollIntoView({behavior:'smooth'})};
$('#svct').value=S.svcs.join('\n');
$('#svct').onchange=e=>{const l=[...new Set(e.target.value.split('\n').map(x=>x.trim().slice(0,40)).filter(Boolean))];if(l.length)S.svcs=l;e.target.value=S.svcs.join('\n');save();resetForm($('#date').value);render()};
$('#copy').onclick=()=>copy(summary());
$('#share').onclick=async()=>{const t=summary();if(navigator.share){try{await navigator.share({title:'Rota – '+P[pi].n,text:t})}catch(e){}}else copy(t)};
$('#pdf').onclick=savePDF;
$('#ct').value=S.contract;$('#ct').onchange=e=>{const v=parseFloat(e.target.value);S.contract=isNaN(v)||v<0?39:v;save();render()};
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='rota-backup-'+today+'.json';a.click()};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=e=>{const r=new FileReader();r.onload=()=>{try{if(r.result.length>3e6)throw 0;const x=clean(JSON.parse(r.result));if(!x.entries&&!x.svcs)throw 0;S=Object.assign(S,x);save();$('#ct').value=S.contract;$('#svct').value=S.svcs.join('\n');resetForm();render();toast(x.entries?'Backup restored':'Services imported')}catch(_){toast('Not a valid backup')}};r.readAsText(e.target.files[0])};
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
resetForm();render();if(!S.seen){S.seen=1;save();setTimeout(()=>toast('Tap ⓘ (top right) for a quick intro'),600)}
