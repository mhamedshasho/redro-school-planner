const days=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const key="redro-school-planner-v1";
let state=JSON.parse(localStorage.getItem(key)||"null")||{rows:6,cols:7,name:"",title:"البرنامج الأسبوعي",accent:"#ef4444",orientation:"horizontal",data:[]};
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(key,JSON.stringify(state));$("status").textContent="تم الحفظ";setTimeout(()=>$("status").textContent="",900)}
function cell(r,c){return state.data[r]?.[c]||""}
function render(){
document.documentElement.style.setProperty("--accent",state.accent);
$("studentName").value=state.name;$("title").value=state.title;$("accent").value=state.accent;
document.body.dir=state.orientation==="vertical"?"rtl":"rtl";
const t=$("schedule");t.innerHTML="";
const hr=document.createElement("tr");const corner=document.createElement("th");corner.innerHTML="<input value='الحصة'>";hr.append(corner);
for(let c=0;c<state.cols;c++){let th=document.createElement("th");let i=document.createElement("input");i.value=days[c%days.length];i.dataset.h=c;i.addEventListener("input",e=>{days[c%days.length]=e.target.value;save()});th.append(i);hr.append(th)}t.append(hr);
for(let r=0;r<state.rows;r++){let tr=document.createElement("tr");let th=document.createElement("th");let hi=document.createElement("input");hi.value="الحصة "+(r+1);hi.dataset.row=r;hi.addEventListener("input",e=>{e.target.dataset.row=r;save()});th.append(hi);tr.append(th);
for(let c=0;c<state.cols;c++){let td=document.createElement("td"),i=document.createElement("input");i.value=cell(r,c);i.placeholder="المادة / التفاصيل";i.addEventListener("input",()=>{state.data[r]??=[];state.data[r][c]=i.value;save()});td.append(i);tr.append(td)}t.append(tr)}
}
function resizeRows(n){if(n<1)return;state.rows=n;state.data.length=n;for(let r=0;r<n;r++)state.data[r]??=[];render();save()}
function resizeCols(n){if(n<1)return;state.cols=n;for(const r of state.data)if(r)r.length=n;render();save()}
$("addRow").onclick=()=>resizeRows(state.rows+1);$("delRow").onclick=()=>resizeRows(state.rows-1);
$("addCol").onclick=()=>resizeCols(state.cols+1);$("delCol").onclick=()=>resizeCols(state.cols-1);
$("studentName").oninput=e=>{state.name=e.target.value;save()};$("title").oninput=e=>{state.title=e.target.value;save()};
$("accent").oninput=e=>{state.accent=e.target.value;render();save()};
$("horizontal").onclick=()=>{state.orientation="horizontal";render();save()};$("vertical").onclick=()=>{state.orientation="vertical";render();save()};
$("reset").onclick=()=>{if(confirm("إعادة البرنامج للوضع الافتراضي؟")){localStorage.removeItem(key);location.reload()}};
$("printBtn").onclick=()=>window.print();
$("pngBtn").onclick=async()=>{const el=$("scheduleWrap");const canvas=await html2canvas(el,{scale:2,backgroundColor:"#fff"});const a=document.createElement("a");a.download="redro-school-planner.png";a.href=canvas.toDataURL("image/png");a.click()};
render();