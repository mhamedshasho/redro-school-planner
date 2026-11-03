(()=>{"use strict";
const key="redro-school-planner-v4",oldKeys=["redro-school-planner-v3","redro-school-planner-v2"];
const defaultDays=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const subjects={science:{label:"علوم",en:"SCIENCE",art:"🧪",bg:"#e3f7ed"},math:{label:"رياضيات",en:"MATH",art:"📐",bg:"#e3edff"},arabic:{label:"اللغة العربية",en:"ARABIC",art:"أ",bg:"#fff0d6"},english:{label:"الإنجليزية",en:"ENGLISH",art:"Aa",bg:"#f2e7ff"},french:{label:"الفرنسية",en:"FRANÇAIS",art:"🗼",bg:"#e1f6fa"},history:{label:"التاريخ",en:"HISTORY",art:"🏛️",bg:"#f7e8dc"},geography:{label:"الجغرافيا",en:"GEOGRAPHY",art:"🌍",bg:"#e1f3dd"},religion:{label:"التربية الدينية",en:"RELIGION",art:"☪",bg:"#e8e8fc"},computer:{label:"المعلوماتية",en:"COMPUTER",art:"💻",bg:"#e1eaf0"},sport:{label:"الرياضة",en:"SPORT",art:"⚽",bg:"#ffe5e6"},physics:{label:"الفيزياء",en:"PHYSICS",art:"⚛️",bg:"#e2f2fc"},chemistry:{label:"الكيمياء",en:"CHEMISTRY",art:"⚗️",bg:"#f9e4f0"},basics:{label:"مبادئ الحاسوب",en:"COMPUTER BASICS",art:"🖥️",bg:"#e4efff"},electricity:{label:"قصص كهرباء",en:"ELECTRICITY",art:"⚡",bg:"#fff0c9"},logic:{label:"دوائر منطقية",en:"LOGIC CIRCUITS",art:"🔌",bg:"#e2f5ef"},os:{label:"أنظمة تشغيل",en:"OPERATING SYSTEMS",art:"💿",bg:"#eee8ff"},programming:{label:"برمجة",en:"PROGRAMMING",art:"👨‍💻",bg:"#e2ecf8"},philosophy:{label:"فلسفة",en:"PHILOSOPHY",art:"📚",bg:"#f8e8dc"},art:{label:"فنية",en:"ART",art:"🎨",bg:"#ffe5ed"}};
const fallback={rows:6,cols:6,name:"",title:"البرنامج الأسبوعي",accent:"#6658e8",orientation:"horizontal",days:defaultDays.slice(0,6),data:[],cellColors:[],cellTemplates:[],cellImages:[]};
function readState(){try{const saved=localStorage.getItem(key)||oldKeys.map(k=>localStorage.getItem(k)).find(Boolean);return saved?{...fallback,...JSON.parse(saved)}:{...fallback}}catch(e){return {...fallback}}}
let state=readState(),selectedCell=null;
state.rows=Math.max(1,Math.min(12,Number(state.rows)||6));state.cols=Math.max(1,Math.min(7,Number(state.cols)||6));
for(const prop of ["days","data","cellColors","cellTemplates","cellImages"])if(!Array.isArray(state[prop]))state[prop]=[];
const $=id=>document.getElementById(id);
function ensureCell(r,c){for(const prop of ["data","cellColors","cellTemplates","cellImages"]){state[prop][r]??=[]}return true}
function save(){try{localStorage.setItem(key,JSON.stringify(state));$("status").textContent="تم الحفظ على هذا الجهاز"}catch(e){$("status").textContent="الصورة كبيرة؛ جرّب صورة أصغر"}}
function val(r,c){return state.data[r]?.[c]||""}function setVal(r,c,v){ensureCell(r,c);state.data[r][c]=v}
function getAt(prop,r,c){return state[prop][r]?.[c]||null}function setAt(prop,r,c,v){ensureCell(r,c);state[prop][r][c]=v}
function selected(){return selectedCell&&selectedCell.r<state.rows&&selectedCell.c<state.cols}
function selectCell(r,c){selectedCell={r,c};render();$("selectedLabel").textContent="الخانة "+(r+1)+" · "+(state.days[c]||("اليوم "+(c+1)));syncDock()}
function syncDock(){const label=$("dockCell"),input=$("dockText"),color=$("dockColor");if(!label||!input)return;const ok=selected();label.textContent=ok?"الخانة "+(selectedCell.r+1)+" · "+(state.days[selectedCell.c]||("اليوم "+(selectedCell.c+1))):"اختر خانة من الجدول";input.value=ok?val(selectedCell.r,selectedCell.c):"";const p=ok?getAt("cellImages",selectedCell.r,selectedCell.c):null;const mode=p?.mode||"fit";$("dockFit")?.classList.toggle("active",mode==="fit");$("dockFill")?.classList.toggle("active",mode==="fill");if(color){const current=ok?getAt("cellColors",selectedCell.r,selectedCell.c):null;color.value=current||"#dcecff"}}
function moveSelected(step){if(!selected())return;const index=selectedCell.r*state.cols+selectedCell.c+step,total=state.rows*state.cols,next=(index+total)%total;selectCell(Math.floor(next/state.cols),next%state.cols);const cell=$("schedule").querySelector(".selected-cell");cell?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"smooth"})}
function makeInput(value,handler,placeholder=""){const i=document.createElement("input");i.value=value;i.placeholder=placeholder;i.addEventListener("input",handler);i.addEventListener("click",e=>e.stopPropagation());return i}
function syncImageMode(){const p=selected()?getAt("cellImages",selectedCell.r,selectedCell.c):null;const mode=p?.mode||"fit";$("imageFit")?.classList.toggle("active",mode==="fit");$("imageFill")?.classList.toggle("active",mode==="fill");$("imageFit")?.setAttribute("aria-pressed",String(mode==="fit"));$("imageFill")?.setAttribute("aria-pressed",String(mode==="fill"))}
function render(){
 document.documentElement.style.setProperty("--table-accent",state.accent||"#6658e8");$("studentName").value=state.name||"";$("title").value=state.title||"";$("accent").value=state.accent||"#6658e8";
 const t=$("schedule");t.innerHTML="";
 const horizontal=state.orientation!=="vertical";
 const head=document.createElement("tr"),corner=document.createElement("th");corner.textContent=horizontal?"الحصة":"اليوم";head.append(corner);
 const headerCount=horizontal?state.cols:state.rows;
 for(let c=0;c<headerCount;c++){const th=document.createElement("th");th.append(makeInput(horizontal?(state.days[c]||("اليوم "+(c+1))):("الحصة "+(c+1)),e=>{if(horizontal){state.days[c]=e.target.value}else{state.rowLabels??=[];state.rowLabels[c]=e.target.value}save()}));head.append(th)}t.append(head);
 const rowCount=horizontal?state.rows:state.cols,colCount=horizontal?state.cols:state.rows;
 for(let rr=0;rr<rowCount;rr++){const row=document.createElement("tr"),label=document.createElement("th");label.textContent=horizontal?("الحصة "+(rr+1)):(state.days[rr]||("اليوم "+(rr+1)));row.append(label);
  for(let cc=0;cc<colCount;cc++){const r=horizontal?rr:cc,c=horizontal?cc:rr,td=document.createElement("td");ensureCell(r,c);if(selectedCell?.r===r&&selectedCell?.c===c)td.classList.add("selected-cell");
   const color=getAt("cellColors",r,c);if(color)td.style.backgroundColor=color;
   const tpl=getAt("cellTemplates",r,c);if(tpl&&subjects[tpl]){td.classList.add("has-template");const tile=document.createElement("div");tile.className="cell-template";tile.style.backgroundColor=subjects[tpl].bg;tile.innerHTML='<span class="cell-art"></span><strong></strong><small></small>';tile.querySelector(".cell-art").textContent=subjects[tpl].art;tile.querySelector("strong").textContent=subjects[tpl].label;tile.querySelector("small").textContent=subjects[tpl].en;td.append(tile)}
   const photo=getAt("cellImages",r,c);if(photo?.src){const img=document.createElement("img");img.className="cell-photo "+(photo.mode==="fill"?"photo-fill":"photo-fit");img.src=photo.src;img.alt="صورة الخانة";img.style.objectFit=photo.mode==="fill"?"cover":"contain";img.style.width="100%";img.style.height="100%";img.style.maxWidth="none";img.style.maxHeight="none";img.style.display="block";img.style.objectPosition=(photo.x??50)+"% "+(photo.y??50)+"%";img.style.transform="scale("+(photo.scale||1)+")";img.style.touchAction="none";let drag=null;img.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,ox:photo.x??50,oy:photo.y??50,moved:false};img.setPointerCapture(e.pointerId);e.preventDefault()});img.addEventListener("pointermove",e=>{if(!drag)return;const rect=td.getBoundingClientRect();const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;photo.x=Math.max(0,Math.min(100,drag.ox-dx/Math.max(1,rect.width)*100));photo.y=Math.max(0,Math.min(100,drag.oy-dy/Math.max(1,rect.height)*100));img.style.objectPosition=photo.x+"% "+photo.y+"%"});const endDrag=()=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved){setAt("cellImages",r,c,photo);save()}};img.addEventListener("pointerup",endDrag);img.addEventListener("pointercancel",endDrag);td.append(img);const shade=document.createElement("div");shade.className="cell-photo-shade";td.append(shade)}
   const inp=makeInput(val(r,c),e=>{setVal(r,c,e.target.value);save()},"اكتب المادة");inp.setAttribute("aria-label","محتوى الخانة "+(r+1)+","+(c+1));inp.addEventListener("focus",()=>{if(selectedCell?.r!==r||selectedCell?.c!==c)selectCell(r,c)});td.append(inp);td.addEventListener("click",()=>selectCell(r,c));row.append(td)
  }t.append(row)
 }
 if(!selected()){selectedCell={r:0,c:0};$("selectedLabel").textContent="الخانة 1 · "+(state.days[0]||"اليوم 1")}syncImageMode();syncDock();
}
function resizeRows(n){if(n<1||n>12)return;state.rows=n;for(const p of ["data","cellColors","cellTemplates","cellImages"])state[p].length=n;render();save()}
function resizeCols(n){if(n<1||n>7)return;state.cols=n;state.days.length=n;for(let c=0;c<n;c++)state.days[c]??=defaultDays[c]||("اليوم "+(c+1));for(const p of ["data","cellColors","cellTemplates","cellImages"])for(const row of state[p])if(row)row.length=n;render();save()}
function needCell(){if(selected())return true;alert("اضغط على الخانة التي تريد تعديلها أولاً.");return false}
function setTab(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id==="tab-"+name))}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
const dockSubjects=$("dockSubjects");document.querySelectorAll("#templateGrid [data-subject]").forEach(source=>{const b=document.createElement("button");b.type="button";b.className="dock-subject";b.dataset.subject=source.dataset.subject;b.textContent=source.querySelector("strong")?.textContent||source.dataset.subject;b.addEventListener("click",()=>{if(!needCell())return;setAt("cellTemplates",selectedCell.r,selectedCell.c,b.dataset.subject);const subject=subjects[b.dataset.subject];if(subject)setVal(selectedCell.r,selectedCell.c,subject.label);render();save();syncDock()});dockSubjects.append(b)});
$("dockText").addEventListener("input",e=>{if(!needCell())return;setVal(selectedCell.r,selectedCell.c,e.target.value);const td=$("schedule").querySelector(".selected-cell input");if(td&&td!==e.target)td.value=e.target.value;save()});
$("dockPrev").onclick=()=>moveSelected(-1);$("dockNext").onclick=()=>moveSelected(1);
$("dockColor").addEventListener("input",e=>{if(!needCell())return;setAt("cellColors",selectedCell.r,selectedCell.c,e.target.value);render();save();syncDock()});
$("dockPhoto").onclick=()=>{if(needCell())$("imageInput").click()};
$("dockFit").onclick=()=>setImageMode("fit");$("dockFill").onclick=()=>setImageMode("fill");
$("dockClear").onclick=()=>{if(!needCell())return;setAt("cellColors",selectedCell.r,selectedCell.c,"");setAt("cellTemplates",selectedCell.r,selectedCell.c,"");render();save();syncDock()};
$("dockSubjectsToggle").onclick=()=>{dockSubjects.classList.toggle("collapsed");$("dockSubjectsToggle").classList.toggle("active",!dockSubjects.classList.contains("collapsed"))};

$("templateGrid").addEventListener("click",e=>{const b=e.target.closest("[data-subject]");if(!b||!needCell())return;setAt("cellTemplates",selectedCell.r,selectedCell.c,b.dataset.subject);render();save()});
$("swatches").addEventListener("click",e=>{const b=e.target.closest("[data-color]");if(!b||!needCell())return;setAt("cellColors",selectedCell.r,selectedCell.c,b.dataset.color);render();save()});
$("cellColor").addEventListener("input",e=>{if(!needCell())return;setAt("cellColors",selectedCell.r,selectedCell.c,e.target.value);render();save()});
$("clearCellStyle").onclick=()=>{if(!needCell())return;setAt("cellColors",selectedCell.r,selectedCell.c,"");setAt("cellTemplates",selectedCell.r,selectedCell.c,"");render();save()};
$("chooseImage").onclick=()=>{if(needCell())$("imageInput").click()};
function setImageMode(mode){if(mode!=="fit"&&mode!=="fill")return;if(!needCell())return;const photo=getAt("cellImages",selectedCell.r,selectedCell.c);if(!photo?.src){alert("أضف صورة للخانة أولاً.");return}photo.mode=mode;setAt("cellImages",selectedCell.r,selectedCell.c,{...photo,mode});save();render();syncImageMode()}
$("imageFit").onclick=()=>setImageMode("fit");$("imageFill").onclick=()=>setImageMode("fill");
$("imageInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file||!needCell())return;if(!file.type.startsWith("image/")){alert("اختر ملف صورة.");return}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=700,ratio=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);const src=canvas.toDataURL("image/jpeg",.78);setAt("cellImages",selectedCell.r,selectedCell.c,{src,x:50,y:50,scale:1,mode:"fit"});render();save();setTab("image")};img.onerror=()=>alert("تعذر قراءة الصورة.");img.src=reader.result};reader.readAsDataURL(file);e.target.value=""});
function moveImage(dx,dy,scale){if(!needCell())return;const p=getAt("cellImages",selectedCell.r,selectedCell.c);if(!p?.src){alert("أضف صورة للخانة أولاً.");return}p.x=Math.max(0,Math.min(100,(p.x??50)+dx));p.y=Math.max(0,Math.min(100,(p.y??50)+dy));p.scale=Math.max(1,Math.min(2.5,(p.scale||1)+scale));setAt("cellImages",selectedCell.r,selectedCell.c,p);render();save()}
$("moveLeft").onclick=()=>moveImage(-8,0,0);$("moveRight").onclick=()=>moveImage(8,0,0);$("moveUp").onclick=()=>moveImage(0,-8,0);$("moveDown").onclick=()=>moveImage(0,8,0);$("zoomIn").onclick=()=>moveImage(0,0,.15);$("zoomOut").onclick=()=>moveImage(0,0,-.15);
$("removeImage").onclick=()=>{if(!needCell())return;setAt("cellImages",selectedCell.r,selectedCell.c,null);render();save()};
$("studentName").addEventListener("input",e=>{state.name=e.target.value;save()});$("title").addEventListener("input",e=>{state.title=e.target.value;save()});
$("addRow").onclick=()=>resizeRows(state.rows+1);$("delRow").onclick=()=>resizeRows(state.rows-1);$("addCol").onclick=()=>resizeCols(state.cols+1);$("delCol").onclick=()=>resizeCols(state.cols-1);
$("horizontal").onclick=()=>{state.orientation="horizontal";render();save()};$("vertical").onclick=()=>{state.orientation="vertical";render();save()};$("accent").addEventListener("input",e=>{state.accent=e.target.value;render();save()});
$("reset").onclick=()=>{if(confirm("إعادة الجدول للوضع الافتراضي؟ سيُمسح محتوى هذا الجدول المحفوظ على الجهاز.")){localStorage.removeItem(key);state={...fallback,days:defaultDays.slice(0,6),data:[],cellColors:[],cellTemplates:[],cellImages:[]};selectedCell={r:0,c:0};render();save()}};
$("moreBtn").onclick=()=>{setTab("layout");$("editor").scrollIntoView({behavior:"smooth",block:"start"})};
function drawCell(ctx,x,y,w,h,text,header=false,bg=""){ctx.fillStyle=header?state.accent:(bg||"#fff");ctx.fillRect(x,y,w,h);ctx.strokeStyle="#d9dbea";ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.fillStyle=header?"#fff":"#27283b";ctx.font=header?"700 16px Tahoma,Arial,sans-serif":"14px Tahoma,Arial,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction="rtl";ctx.fillText(String(text||"").slice(0,35),x+w/2,y+h/2,w-12)}
async function exportPNG(){
 const horizontal=state.orientation!=="vertical",rows=horizontal?state.rows+1:state.cols+1,cols=horizontal?state.cols+1:state.rows+1,cw=145,ch=72,pad=20,titleH=80,brandH=34;
 const canvas=document.createElement("canvas");canvas.width=pad*2+cols*cw;canvas.height=pad*2+titleH+rows*ch+brandH;
 const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#25253a";ctx.font="800 25px Tahoma";ctx.textAlign="center";ctx.direction="rtl";ctx.fillText(state.title||"البرنامج الأسبوعي",canvas.width/2,pad+29);ctx.font="15px Tahoma";ctx.fillText(state.name?"الطالب: "+state.name:"",canvas.width/2,pad+56);
 const ox=pad,oy=pad+titleH;
 function cell(x,y,w,h,text,header=false,bg=""){
  ctx.fillStyle=header?state.accent:(bg||"#fff");ctx.fillRect(x,y,w,h);ctx.strokeStyle="#d9dbea";ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  ctx.fillStyle=header?"#fff":"#27283b";ctx.font=header?"700 16px Tahoma,Arial,sans-serif":"14px Tahoma,Arial,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction="rtl";ctx.fillText(String(text||"").slice(0,35),x+w/2,y+h/2,w-12);
 }
 cell(ox,oy,cw,ch,horizontal?"الحصة":"اليوم",true);
 for(let c=0;c<(horizontal?state.cols:state.rows);c++)cell(ox+(c+1)*cw,oy,cw,ch,horizontal?(state.days[c]||("اليوم "+(c+1))):("الحصة "+(c+1)),true);
 const photos=new Map(),photoLoads=[];
 for(let r=0;r<(horizontal?state.rows:state.cols);r++)for(let c=0;c<(horizontal?state.cols:state.rows);c++){
  const rr=horizontal?r:c,cc=horizontal?c:r,p=getAt("cellImages",rr,cc);if(!p?.src)continue;
  photoLoads.push(new Promise(resolve=>{const img=new Image();img.onload=()=>{photos.set(rr+","+cc,img);resolve()};img.onerror=resolve;img.src=p.src}));
 }
 await Promise.all(photoLoads);
 for(let r=0;r<(horizontal?state.rows:state.cols);r++){
  cell(ox,oy+(r+1)*ch,cw,ch,horizontal?("الحصة "+(r+1)):(state.days[r]||("اليوم "+(r+1))),true);
  for(let c=0;c<(horizontal?state.cols:state.rows);c++){
   const rr=horizontal?r:c,cc=horizontal?c:r,x=ox+(c+1)*cw,y=oy+(r+1)*ch;
   cell(x,y,cw,ch,"",false,getAt("cellColors",rr,cc));
   const tpl=getAt("cellTemplates",rr,cc),subject=tpl&&subjects[tpl]?subjects[tpl]:null;
   if(subject){ctx.fillStyle=subject.bg;ctx.fillRect(x+3,y+3,cw-6,ch-6);ctx.fillStyle="#27283b";ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction="ltr";ctx.font="22px Tahoma,Arial,sans-serif";ctx.fillText(subject.art,x+cw/2,y+17);ctx.direction="rtl";ctx.font="bold 11px Tahoma,Arial,sans-serif";ctx.fillText(subject.label,x+cw/2,y+36,cw-12);ctx.direction="ltr";ctx.font="7px Tahoma,Arial,sans-serif";ctx.fillStyle="#666";ctx.fillText(subject.en,x+cw/2,y+48,cw-12)}
   const photo=getAt("cellImages",rr,cc),img=photos.get(rr+","+cc);
   if(photo?.src&&img){ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,cw-2,ch-2);ctx.clip();const baseScale=photo.mode==="fill"?Math.max(cw/img.width,ch/img.height):Math.min((cw-8)/img.width,(ch-8)/img.height),scale=baseScale*(photo.scale||1),iw=img.width*scale,ih=img.height*scale,dx=x+1+(cw-2-iw)*(photo.x??50)/100,dy=y+1+(ch-2-ih)*(photo.y??50)/100;ctx.drawImage(img,dx,dy,iw,ih);const gradient=ctx.createLinearGradient(0,y+ch-36,0,y+ch);gradient.addColorStop(0,"rgba(255,255,255,0)");gradient.addColorStop(1,"rgba(255,255,255,.93)");ctx.fillStyle=gradient;ctx.fillRect(x+1,y+ch-36,cw-2,35);ctx.restore()}
   const text=val(rr,cc)||(!tpl&&!photo?"فراغ":"");if(text){ctx.fillStyle="#ffffffdf";ctx.fillRect(x+4,y+ch-25,cw-8,21);ctx.fillStyle=val(rr,cc)?"#27283b":"#999";ctx.font="12px Tahoma,Arial,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction="rtl";ctx.fillText(String(text).slice(0,32),x+cw/2,y+ch-14,cw-14)}
   ctx.strokeStyle="#d9dbea";ctx.strokeRect(x+.5,y+.5,cw-1,ch-1);
  }
 }
 const brandY=canvas.height-pad-8;ctx.save();ctx.direction="ltr";ctx.textAlign="right";ctx.textBaseline="middle";ctx.font="600 12px system-ui,Tahoma,Arial,sans-serif";ctx.fillStyle="#77798d";ctx.fillText("Made with Redro School Planner",canvas.width-pad,brandY);ctx.restore();
 const a=document.createElement("a");a.download="redro-school-planner.png";a.href=canvas.toDataURL("image/png");a.click();
}
$("pngBtn").onclick=()=>{exportPNG().catch(()=>alert("تعذر حفظ الصورة. حاول مرة أخرى."))};
async function preparePrint(){
 const old=document.getElementById("redroPrintRoot");if(old)old.remove();
 const root=document.createElement("section");root.id="redroPrintRoot";
 const title=document.createElement("h1");title.textContent=state.title||"البرنامج الأسبوعي";root.append(title);
 if(state.name){const name=document.createElement("p");name.textContent="الطالب: "+state.name;root.append(name)}
 const table=document.createElement("table");table.dir="rtl";
 const horizontal=state.orientation!=="vertical",rows=horizontal?state.rows:state.cols,cols=horizontal?state.cols:state.rows;
 table.style.cssText="width:100%;border-collapse:collapse;table-layout:fixed;direction:rtl";
 const makeCell=(tag,text,bg,color)=>{const el=document.createElement(tag);el.textContent=text;el.style.cssText="border:1px solid #555;padding:6px;text-align:center;vertical-align:middle;white-space:pre-wrap;overflow-wrap:anywhere;height:20mm;background:"+bg+";color:"+color+";-webkit-print-color-adjust:exact;print-color-adjust:exact";return el};
 const head=document.createElement("tr");head.append(makeCell("th",horizontal?"الحصة":"اليوم",state.accent||"#6658e8","#fff"));
 for(let c=0;c<cols;c++)head.append(makeCell("th",horizontal?(state.days[c]||("اليوم "+(c+1))):("الحصة "+(c+1)),state.accent||"#6658e8","#fff"));
 table.append(head);
 for(let rr=0;rr<rows;rr++){
  const row=document.createElement("tr");row.append(makeCell("th",horizontal?("الحصة "+(rr+1)):(state.days[rr]||("اليوم "+(rr+1))),state.accent||"#6658e8","#fff"));
  for(let cc=0;cc<cols;cc++){
   const r=horizontal?rr:cc,c=horizontal?cc:rr,td=document.createElement("td");
   const tpl=getAt("cellTemplates",r,c),photo=getAt("cellImages",r,c),bg=getAt("cellColors",r,c)||"#fff",value=val(r,c);
   td.style.cssText="border:1px solid #555;padding:5px;text-align:center;vertical-align:middle;height:20mm;min-width:0;background:"+bg+";color:#27283b;-webkit-print-color-adjust:exact;print-color-adjust:exact";
   if(tpl&&subjects[tpl]){const subject=subjects[tpl],tile=document.createElement("div");tile.style.cssText="background:"+subject.bg+";padding:5px;margin:0 auto 3px;color:#282940;-webkit-print-color-adjust:exact;print-color-adjust:exact";const art=document.createElement("div");art.textContent=subject.art;art.style.fontSize="19px";const label=document.createElement("strong");label.textContent=subject.label;label.style.display="block";const en=document.createElement("small");en.textContent=subject.en;en.style.display="block";tile.append(art,label,en);td.append(tile)}
   if(photo?.src){const img=document.createElement("img");img.src=photo.src;img.alt="";img.style.cssText="display:block;width:100%;height:68px;max-width:none;max-height:none;object-fit:"+(photo.mode==="fill"?"cover":"contain")+";object-position:"+(photo.x??50)+"% "+(photo.y??50)+"%;margin:2px auto";td.append(img)}
   const content=document.createElement("div");content.textContent=value||(!tpl&&!photo?"فراغ":"");content.style.cssText="font:12px Tahoma,Arial,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;color:"+(value?"#27283b":"#999");td.append(content);row.append(td);
  }
  table.append(row);
 }
 root.append(table);document.body.append(root);
 await Promise.all([...root.querySelectorAll("img")].map(img=>img.decode?img.decode().catch(()=>{}):new Promise(resolve=>{if(img.complete)return resolve();img.onload=resolve;img.onerror=resolve})));
 return root;
}
$("printBtn").onclick=async()=>{await preparePrint();if(window.Android?.printPage)window.Android.printPage();else window.print()};
window.addEventListener("afterprint",()=>document.getElementById("redroPrintRoot")?.remove());
function preview(){const modal=document.createElement("div");modal.className="preview-modal";const box=document.createElement("div");box.className="preview-box";const bar=document.createElement("div");bar.className="preview-bar";const title=document.createElement("strong");title.textContent=state.title||"البرنامج الأسبوعي";const close=document.createElement("button");close.textContent="إغلاق المعاينة";close.onclick=()=>{if(window.Android?.exitPreview)window.Android.exitPreview();else if(screen.orientation?.unlock)screen.orientation.unlock();modal.remove()};bar.append(title,close);box.append(bar);const meta=document.createElement("div");meta.className="preview-meta";meta.textContent=state.name?"الطالب: "+state.name:"";box.append(meta);const wrap=document.createElement("div");wrap.className="preview-table-wrap";const table=document.createElement("table");table.className="preview-table";const horizontal=state.orientation!=="vertical";const head=document.createElement("tr");const first=document.createElement("th");first.textContent=horizontal?"الحصة":"اليوم";head.append(first);for(let c=0;c<(horizontal?state.cols:state.rows);c++){const th=document.createElement("th");th.textContent=horizontal?(state.days[c]||("اليوم "+(c+1))):("الحصة "+(c+1));head.append(th)}table.append(head);for(let r=0;r<(horizontal?state.rows:state.cols);r++){const row=document.createElement("tr"),th=document.createElement("th");th.textContent=horizontal?("الحصة "+(r+1)):(state.days[r]||("اليوم "+(r+1)));row.append(th);for(let c=0;c<(horizontal?state.cols:state.rows);c++){const rr=horizontal?r:c,cc=horizontal?c:r,td=document.createElement("td"),tpl=getAt("cellTemplates",rr,cc),p=getAt("cellImages",rr,cc);td.style.backgroundColor=getAt("cellColors",rr,cc)||"#fff";if(tpl&&subjects[tpl])td.textContent=subjects[tpl].art+" "+subjects[tpl].label+"\n"+val(rr,cc);else td.textContent=val(rr,cc);if(p?.src){const im=document.createElement("img");im.src=p.src;im.alt="";im.style.objectPosition=(p.x??50)+"% "+(p.y??50)+"%";td.append(document.createElement("br"),im)}row.append(td)}table.append(row)}wrap.append(table);box.append(wrap);modal.append(box);document.body.append(modal);if(window.Android?.enterPreview)window.Android.enterPreview();else if(screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{})}
$("previewBtn").onclick=preview;
render();save();
})();