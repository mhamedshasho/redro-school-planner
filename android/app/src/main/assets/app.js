const key="redro-school-planner-v2";
const defaultDays=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
let state=JSON.parse(localStorage.getItem(key)||"null")||{rows:6,cols:7,name:"",title:"البرنامج الأسبوعي",accent:"#ef4444",orientation:"horizontal",days:defaultDays,data:[]};
state.days??=defaultDays.slice();
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(key,JSON.stringify(state));$("status").textContent="تم الحفظ";clearTimeout(window.saveTimer);window.saveTimer=setTimeout(()=>$("status").textContent="",900)}
function val(r,c){return state.data[r]?.[c]||""}
function setVal(r,c,v){state.data[r]??=[];state.data[r][c]=v}
function input(value,handler,cls=""){const i=document.createElement("input");i.value=value;i.className=cls;i.addEventListener("input",handler);return i}
function render(){
 document.documentElement.style.setProperty("--accent",state.accent);
 $("studentName").value=state.name;$("title").value=state.title;$("accent").value=state.accent;
 const t=$("schedule");t.innerHTML="";
 if(state.orientation==="horizontal"){
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.append(input("الحصة",()=>{}));tr.append(corner);
  for(let c=0;c<state.cols;c++){const th=document.createElement("th");th.append(input(state.days[c]||("اليوم "+(c+1)),e=>{state.days[c]=e.target.value;save()}));tr.append(th)}t.append(tr);
  for(let r=0;r<state.rows;r++){const row=document.createElement("tr"),th=document.createElement("th");th.append(input("الحصة "+(r+1),()=>{}));row.append(th);for(let c=0;c<state.cols;c++){const td=document.createElement("td");td.append(input(val(r,c),e=>{setVal(r,c,e.target.value);save()}));row.append(td)}t.append(row)}
 }else{
  const tr=document.createElement("tr"),corner=document.createElement("th");corner.append(input("اليوم",()=>{}));tr.append(corner);
  for(let r=0;r<state.rows;r++){const th=document.createElement("th");th.append(input("الحصة "+(r+1),()=>{}));tr.append(th)}t.append(tr);
  for(let c=0;c<state.cols;c++){const row=document.createElement("tr"),th=document.createElement("th");th.append(input(state.days[c]||("اليوم "+(c+1)),e=>{state.days[c]=e.target.value;save()}));row.append(th);for(let r=0;r<state.rows;r++){const td=document.createElement("td");td.append(input(val(r,c),e=>{setVal(r,c,e.target.value);save()}));row.append(td)}t.append(row)}
 }
}
function resizeRows(n){if(n<1)return;state.rows=n;state.data.length=n;for(let r=0;r<n;r++)state.data[r]??=[];render();save()}
function resizeCols(n){if(n<1)return;state.cols=n;for(const r of state.data)if(r)r.length=n;state.days.length=n;for(let c=0;c<n;c++)state.days[c]??=("اليوم "+(c+1));render();save()}
$("addRow").onclick=()=>resizeRows(state.rows+1);$("delRow").onclick=()=>resizeRows(state.rows-1);$("addCol").onclick=()=>resizeCols(state.cols+1);$("delCol").onclick=()=>resizeCols(state.cols-1);
$("studentName").oninput=e=>{state.name=e.target.value;save()};$("title").oninput=e=>{state.title=e.target.value;save()};$("accent").oninput=e=>{state.accent=e.target.value;render();save()};
$("horizontal").onclick=()=>{state.orientation="horizontal";render();save()};$("vertical").onclick=()=>{state.orientation="vertical";render();save()};
$("reset").onclick=()=>{if(confirm("إعادة البرنامج للوضع الافتراضي؟")){localStorage.removeItem(key);location.reload()}};
$("printBtn").onclick=()=>window.print();
$("pngBtn").onclick=async()=>{const canvas=await html2canvas($("scheduleWrap"),{scale:2,backgroundColor:"#fff"});const a=document.createElement("a");a.download="redro-school-planner.png";a.href=canvas.toDataURL("image/png");a.click()};
render();