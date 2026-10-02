const key="redro-school-planner-v3";
const defaultDays=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const fallback={rows:6,cols:7,name:"",title:"البرنامج الأسبوعي",accent:"#ef4444",orientation:"horizontal",days:defaultDays.slice(),data:[]};
let state=JSON.parse(localStorage.getItem(key)||"null")||JSON.parse(localStorage.getItem("redro-school-planner-v2")||"null")||fallback;
state.rows=Math.max(1,Number(state.rows)||6); state.cols=Math.max(1,Number(state.cols)||7);
state.days=Array.isArray(state.days)?state.days:defaultDays.slice();
state.data=Array.isArray(state.data)?state.data:[];\nstate.cellColors=Array.isArray(state.cellColors)?state.cellColors:[];\nlet selectedCell=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(key,JSON.stringify(state));const s=$("status");if(s){s.textContent="تم الحفظ";clearTimeout(window.saveTimer);window.saveTimer=setTimeout(()=>s.textContent="",900)}}
function val(r,c){return state.data[r]?.[c]||""}
function setVal(r,c,v){state.data[r]??=[];state.data[r][c]=v}\nfunction getCellColor(r,c){return state.cellColors[r]?.[c]||""}\nfunction setCellColor(r,c,color){state.cellColors[r]??=[];state.cellColors[r][c]=color}\nfunction selectCell(r,c){selectedCell={r,c};render()}
function input(value,handler,cls=""){const i=document.createElement("input");i.value=value;i.className=cls;i.addEventListener("input",handler);return i}
function render(){
 document.documentElement.style.setProperty("--accent",state.accent);
 $("studentName").value=state.name;$("title").value=state.title;$("accent").value=state.accent;
 const t=$("schedule");t.innerHTML="";
 if(state.orientation==="horizontal"){
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.append(input("الحصة",()=>{}));tr.append(corner);
  for(let c=0;c<state.cols;c++){const th=document.createElement("th");th.append(input(state.days[c]||("اليوم "+(c+1)),e=>{state.days[c]=e.target.value;save()}));tr.append(th)}t.append(tr);
  for(let r=0;r<state.rows;r++){const row=document.createElement("tr"),th=document.createElement("th");th.append(input("الحصة "+(r+1),()=>{}));row.append(th);for(let c=0;c<state.cols;c++){const td=document.createElement("td");const color=getCellColor(r,c);if(color)td.style.backgroundColor=color;if(selectedCell?.r===r&&selectedCell?.c===c)td.classList.add("selected-cell");td.addEventListener("click",()=>selectCell(r,c));const inp=input(val(r,c),e=>{setVal(r,c,e.target.value);save()});inp.addEventListener("focus",()=>selectCell(r,c));td.append(inp);row.append(td)}t.append(row)}
 }else{
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.append(input("اليوم",()=>{}));tr.append(corner);
  for(let r=0;r<state.rows;r++){const th=document.createElement("th");th.append(input("الحصة "+(r+1),()=>{}));tr.append(th)}t.append(tr);
  for(let c=0;c<state.cols;c++){const row=document.createElement("tr"),th=document.createElement("th");th.append(input(state.days[c]||("اليوم "+(c+1)),e=>{state.days[c]=e.target.value;save()}));row.append(th);for(let r=0;r<state.rows;r++){const td=document.createElement("td");const color=getCellColor(r,c);if(color)td.style.backgroundColor=color;if(selectedCell?.r===r&&selectedCell?.c===c)td.classList.add("selected-cell");td.addEventListener("click",()=>selectCell(r,c));const inp=input(val(r,c),e=>{setVal(r,c,e.target.value);save()});inp.addEventListener("focus",()=>selectCell(r,c));td.append(inp);row.append(td)}t.append(row)}
 }
}
function resizeRows(n){if(n<1)return;state.rows=n;state.data.length=n;for(let r=0;r<n;r++)state.data[r]??=[];render();save()}
function resizeCols(n){if(n<1)return;state.cols=n;for(const r of state.data)if(r)r.length=n;state.days.length=n;for(let c=0;c<n;c++)state.days[c]??=("اليوم "+(c+1));render();save()}
function textFit(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){
 const words=String(text||"").split(/\\s+/);let lines=[],line="";
 for(const w of words){const test=line?line+" "+w:w;if(ctx.measureText(test).width<=maxWidth)line=test;else{if(line)lines.push(line);line=w;if(lines.length===maxLines-1)break}}
 if(line&&lines.length<maxLines)lines.push(line);
 ctx.textAlign="center";ctx.textBaseline="middle";lines.slice(0,maxLines).forEach((l,i)=>ctx.fillText(l,x,y+(i-(lines.length-1)/2)*lineHeight));
}
function drawCell(ctx,x,y,w,h,text,header=false,bg=""){
 ctx.fillStyle=header?"#111827":(bg||"#ffffff");ctx.fillRect(x,y,w,h);
 ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
 ctx.fillStyle=header?"#ffffff":"#111827";ctx.font=header?"700 18px Tahoma, Arial, sans-serif":"16px Tahoma, Arial, sans-serif";
 ctx.direction="rtl";textFit(ctx,text,x+w/2,y+h/2,w-18,20,2);
}
async function exportPNG(){
 const cols=state.orientation==="horizontal"?state.cols+1:state.rows+1;
 const rows=state.orientation==="horizontal"?state.rows+1:state.cols+1;
 const cw=150,ch=64,pad=24,titleH=86,nameH=30;
 const canvas=document.createElement("canvas");canvas.width=pad*2+cols*cw;canvas.height=pad*2+titleH+nameH+rows*ch;
 const ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#111827";ctx.textAlign="center";ctx.direction="rtl";ctx.font="800 28px Tahoma, Arial, sans-serif";ctx.fillText(state.title||"البرنامج الأسبوعي",canvas.width/2,pad+32);
 ctx.font="16px Tahoma, Arial, sans-serif";ctx.fillText(state.name?("الطالب: "+state.name):"",canvas.width/2,pad+62);
 const ox=pad,oy=pad+titleH;
 if(state.orientation==="horizontal"){
  drawCell(ctx,ox,oy,cw,ch,"الحصة",true);
  for(let c=0;c<state.cols;c++)drawCell(ctx,ox+(c+1)*cw,oy,cw,ch,state.days[c]||("اليوم "+(c+1)),true);
  for(let r=0;r<state.rows;r++){drawCell(ctx,ox,oy+(r+1)*ch,cw,ch,"الحصة "+(r+1),true);for(let c=0;c<state.cols;c++)drawCell(ctx,ox+(c+1)*cw,oy+(r+1)*ch,cw,ch,val(r,c),false,getCellColor(r,c))}
 }else{
  drawCell(ctx,ox,oy,cw,ch,"اليوم",true);
  for(let r=0;r<state.rows;r++)drawCell(ctx,ox+(r+1)*cw,oy,cw,ch,"الحصة "+(r+1),true);
  for(let c=0;c<state.cols;c++){drawCell(ctx,ox,oy+(c+1)*ch,cw,ch,state.days[c]||("اليوم "+(c+1)),true);for(let r=0;r<state.rows;r++)drawCell(ctx,ox+(r+1)*cw,oy+(c+1)*ch,cw,ch,val(r,c),false,getCellColor(r,c))}
 }
 const data=canvas.toDataURL("image/png");
 if(window.Android&&Android.savePng)Android.savePng(data,"redro-school-planner.png");else{const a=document.createElement("a");a.download="redro-school-planner.png";a.href=data;a.click()}
}
function buildPreviewTable(){
 const table=document.createElement("table"); table.className="preview-table";
 if(state.orientation==="horizontal"){
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.textContent="الحصة";tr.append(corner);
  for(let c=0;c<state.cols;c++){const th=document.createElement("th");th.textContent=state.days[c]||("اليوم "+(c+1));tr.append(th)}table.append(tr);
  for(let r=0;r<state.rows;r++){const row=document.createElement("tr"),th=document.createElement("th");th.textContent="الحصة "+(r+1);row.append(th);for(let c=0;c<state.cols;c++){const td=document.createElement("td");td.textContent=val(r,c);const color=getCellColor(r,c);if(color)td.style.backgroundColor=color;row.append(td)}table.append(row)}
 }else{
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.textContent="اليوم";tr.append(corner);
  for(let r=0;r<state.rows;r++){const th=document.createElement("th");th.textContent="الحصة "+(r+1);tr.append(th)}table.append(tr);
  for(let c=0;c<state.cols;c++){const row=document.createElement("tr"),th=document.createElement("th");th.textContent=state.days[c]||("اليوم "+(c+1));row.append(th);for(let r=0;r<state.rows;r++){const td=document.createElement("td");td.textContent=val(r,c);const color=getCellColor(r,c);if(color)td.style.backgroundColor=color;row.append(td)}table.append(row)}
 }
 return table;
}
function enterPreview(){
 const modal=document.createElement("div");modal.className="preview-modal";
 const box=document.createElement("div");box.className="preview-box";
 const bar=document.createElement("div");bar.className="preview-bar";
 const title=document.createElement("strong");title.textContent=state.title||"البرنامج الأسبوعي";
 const close=document.createElement("button");close.textContent="إغلاق Preview";close.onclick=()=>{if(window.Android&&Android.exitPreview)Android.exitPreview();else if(screen.orientation?.unlock)screen.orientation.unlock();modal.remove()};
 bar.append(title,close);box.append(bar);
 const meta=document.createElement("div");meta.className="preview-meta";meta.textContent=state.name?("الطالب: "+state.name):"";box.append(meta);
 const wrap=document.createElement("div");wrap.className="preview-table-wrap";wrap.append(buildPreviewTable());box.append(wrap);modal.append(box);document.body.append(modal);
 if(window.Android&&Android.enterPreview)Android.enterPreview();else if(screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});
}
$("previewBtn").onclick=enterPreview;
$("addRow").onclick=()=>resizeRows(state.rows+1);$("delRow").onclick=()=>resizeRows(state.rows-1);$("addCol").onclick=()=>resizeCols(state.cols+1);$("delCol").onclick=()=>resizeCols(state.cols-1);
$("studentName").oninput=e=>{state.name=e.target.value;save()};$("title").oninput=e=>{state.title=e.target.value;save()};const updateColor=()=>{if(!selectedCell){alert("اختر الخانة التي تريد تلوينها أولاً.");return}setCellColor(selectedCell.r,selectedCell.c,$("accent").value);render();save()};$("accent").oninput=updateColor;$("accent").onchange=updateColor;
$("horizontal").onclick=()=>{state.orientation="horizontal";render();save()};$("vertical").onclick=()=>{state.orientation="vertical";render();save()};
$("reset").onclick=()=>{if(confirm("إعادة البرنامج للوضع الافتراضي؟")){localStorage.removeItem(key);localStorage.removeItem("redro-school-planner-v2");location.reload()}};
$("printBtn").onclick=()=>{if(window.Android&&Android.printPage)Android.printPage();else window.print()};
$("pngBtn").onclick=()=>{try{exportPNG()}catch(e){alert("تعذر إنشاء PNG. حاول مرة أخرى.")}};
render();