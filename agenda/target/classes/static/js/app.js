// Versão de protótipo: usa dados fictícios (EV).
// Nos próximos passos, estes dados virão da API em Java via fetch().
const M=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ST={v:"Fechado",a:"Orçamento",n:"Não pago"};
const EV=[
 {d:3,t:"Casamento",c:"Ana e Pedro",h:"19h–23h30",s:"v",venda:19440,custo:7200},
 {d:10,t:"Empresarial",c:"Tech Sul",h:"12h–16h",s:"v",venda:14000,custo:5100},
 {d:10,t:"Aniversário",c:"Carla M.",h:"20h–00h",s:"a",venda:8200,custo:3000},
 {d:17,t:"Formatura",c:"Turma Direito",h:"21h–03h",s:"n",venda:26500,custo:11800},
 {d:24,t:"Casamento",c:"Júlia e Rafael",h:"18h–23h",s:"v",venda:22000,custo:8900},
 {d:31,t:"Aniversário",c:"Marcos P.",h:"19h–23h",s:"a",venda:6400,custo:2300}];
const $=id=>document.getElementById(id),R=n=>"R$ "+n.toLocaleString("pt-BR",{minimumFractionDigits:2});
$("mes").innerHTML=M.map((m,i)=>`<option value="${i}"${i==9?" selected":""}>${m}</option>`).join("");
let sel=null;
function cal(){
  const m=+$("mes").value,y=+$("ano").value,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  const live=(m==9&&y==2026),f=$("vis").value;
  let h=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(x=>`<div class="h">${x}</div>`).join("")+"<div></div>".repeat(first);
  for(let d=1;d<=n;d++){
    const es=live?EV.filter(e=>e.d==d&&(f=="todos"||e.s!="v")):[];
    h+=`<button class="d${sel==d?" sel":""}" data-d="${d}"><b>${d}</b>${es.map(e=>`<span class="chip ${e.s}">${e.t}</span>`).join("")}</button>`;
  }
  $("cal").innerHTML=h;
  document.querySelectorAll(".cal .d").forEach(b=>b.onclick=()=>{sel=+b.dataset.d;cal();det(m,y,live)});
}
function det(m,y,live){
  const es=live?EV.filter(e=>e.d==sel):[];
  $("det").innerHTML=`<b>${sel} de ${M[m]}</b>`+(es.length?es.map(e=>`<div class="ev"><b>${e.t}</b> – ${e.c} <span class="tag ${e.s}">${ST[e.s]}</span><br>${e.h}<br>Venda: <span class="val">${R(e.venda)}</span> · Custo: <span class="val">${R(e.custo)}</span></div>`).join(""):`<div class="ev">Nenhum evento neste dia.</div>`);
}
function tab(t){
  ["agenda","novo","rel"].forEach(s=>$(s).hidden=s!=t);
  document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-selected",b.dataset.t==t));
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>tab(b.dataset.t));
["mes","ano","vis"].forEach(i=>$(i).onchange=()=>{sel=null;$("det").innerHTML="<b>Toque em um dia</b> para ver os eventos.";cal()});
$("mask").onchange=e=>document.body.classList.toggle("masked",e.target.checked);
document.querySelectorAll(".g").forEach(i=>i.oninput=()=>$("tot").textContent="Total: "+[...document.querySelectorAll(".g")].reduce((s,x)=>s+(+x.value||0),0));
$("save").onclick=()=>$("msg").hidden=false;
let tv=0,tc=0;
$("tb").innerHTML="<tr><th>Data</th><th>Evento</th><th class='r'>Venda</th><th class='r'>Custo</th><th class='r'>Diferença</th></tr>"+
 EV.map(e=>{tv+=e.venda;tc+=e.custo;return `<tr><td>${String(e.d).padStart(2,"0")}/10</td><td>${e.t} – ${e.c}</td><td class="r val">${R(e.venda)}</td><td class="r val">${R(e.custo)}</td><td class="r val">${R(e.venda-e.custo)}</td></tr>`}).join("")+
 `<tr><th colspan="2">Total</th><th class="r val">${R(tv)}</th><th class="r val">${R(tc)}</th><th class="r val">${R(tv-tc)}</th></tr>`;
cal();