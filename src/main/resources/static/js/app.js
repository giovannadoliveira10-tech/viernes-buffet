const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ST = {
  ORCAMENTO: { cls: "a", txt: "Orçamento" },
  FECHADO:   { cls: "v", txt: "Fechado" },
  NAO_PAGO:  { cls: "n", txt: "Não pago" }
};

const $ = id => document.getElementById(id);
const R = n => n == null ? "—" : "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const dia = e => +e.dataEvento.split("-")[2];
const hora = e => e.horaInicio ? e.horaInicio.slice(0,5) + (e.horaFim ? "–" + e.horaFim.slice(0,5) : "") : "";
const nomeCli = e => e.cliente1.nome + (e.cliente2 ? " e " + e.cliente2.nome : "");

let eventos = [];
let sel = null;

// ---------- Abas ----------
function tab(t) {
  ["agenda", "novo", "rel"].forEach(s => $(s).hidden = s !== t);
  document.querySelectorAll("nav button").forEach(b => b.setAttribute("aria-selected", b.dataset.t === t));
  if (t === "rel") relatorio();
}
document.querySelectorAll("nav button").forEach(b => b.onclick = () => tab(b.dataset.t));

// ---------- Agenda ----------
const hoje = new Date();
$("mes").innerHTML = MESES.map((m, i) => `<option value="${i}">${m}</option>`).join("");
$("mes").value = hoje.getMonth();
if ([...$("ano").options].some(o => o.value == hoje.getFullYear())) $("ano").value = hoje.getFullYear();

async function carregarMes() {
  const r = await fetch(`/api/eventos?mes=${+$("mes").value + 1}&ano=${$("ano").value}`);
  if (!r.ok) { alert("Não foi possível carregar os eventos."); return; }
  eventos = await r.json();
  sel = null;
  $("det").innerHTML = "<b>Toque em um dia</b> para ver os eventos.";
  cal();
}

function cal() {
  const m = +$("mes").value, y = +$("ano").value;
  const first = new Date(y, m, 1).getDay();
  const n = new Date(y, m + 1, 0).getDate();
  const f = $("vis").value;
  let h = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(x => `<div class="h">${x}</div>`).join("") + "<div></div>".repeat(first);
  for (let d = 1; d <= n; d++) {
    const es = eventos.filter(e => dia(e) === d && (f === "todos" || e.status !== "FECHADO"));
    h += `<button class="d${sel === d ? " sel" : ""}" data-d="${d}"><b>${d}</b>` +
         es.map(e => `<span class="chip ${ST[e.status].cls}">${esc(e.tipoEvento.nome)}</span>`).join("") + `</button>`;
  }
  $("cal").innerHTML = h;
  document.querySelectorAll(".cal .d").forEach(b => b.onclick = () => { sel = +b.dataset.d; cal(); det(); });
}

function det() {
  const es = eventos.filter(e => dia(e) === sel);
  $("det").innerHTML = `<b>${sel} de ${MESES[+$("mes").value]}</b>` + (es.length
    ? es.map(e => `<div class="ev"><b>${esc(e.tipoEvento.nome)}</b> – ${esc(nomeCli(e))}
        <span class="tag ${ST[e.status].cls}">${ST[e.status].txt}</span><br>${hora(e)}<br>
        Venda: <span class="val">${R(e.valorVendaReal)}</span> · Custo: <span class="val">${R(e.custoVariavel)}</span></div>`).join("")
    : `<div class="ev">Nenhum evento neste dia.</div>`);
}

["mes", "ano"].forEach(i => $(i).onchange = carregarMes);
$("vis").onchange = cal;
$("mask").onchange = e => document.body.classList.toggle("masked", e.target.checked);

// ---------- Tipos de evento ----------
async function carregarTipos() {
  const r = await fetch("/api/tipos-evento");
  const tipos = await r.json();
  $("tipoEvento").innerHTML = tipos.map(t => `<option value="${t.id}">${esc(t.nome)}</option>`).join("");
}

$("addTipo").onclick = async () => {
  const nome = $("novoTipo").value.trim();
  if (!nome) return;
  const r = await fetch("/api/tipos-evento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome })
  });
  if (r.ok) { $("novoTipo").value = ""; carregarTipos(); }
  else alert("Não foi possível cadastrar. Esse tipo já existe?");
};

// ---------- Novo evento ----------
document.querySelectorAll(".g").forEach(i => i.oninput = () => {
  const total = [...document.querySelectorAll(".g")].reduce((s, x) => s + (+x.value || 0), 0);
  $("tot").textContent = "Total: " + total;
});

const txt = id => $(id).value.trim() || null;
const num = id => $(id).value === "" ? null : Number($(id).value);

$("save").onclick = async () => {
  if (!txt("c1nome")) { alert("Informe o nome do cliente 1."); return; }
  if (!txt("dataEvento")) { alert("Informe a data do evento."); return; }

  const dados = {
    cliente1Nome: txt("c1nome"), cliente1Sobrenome: txt("c1sobrenome"), cliente1Email: txt("c1email"),
    telefone1: txt("tel1"), telefone2: txt("tel2"),
    cliente2Nome: txt("c2nome"), cliente2Sobrenome: txt("c2sobrenome"), cliente2Email: txt("c2email"),
    tipoEventoId: num("tipoEvento"), status: $("status").value,
    dataAtendimento: txt("dataAtend"), dataConfirmacao: txt("dataConf"), dataEvento: txt("dataEvento"),
    horaInicio: txt("horaIni"), horaFim: txt("horaFim"),
    convidadosPrevistos: num("prev"), convidadosCompareceram: num("comp"),
    pagantesInteiros: num("inteiros"), pagantesMeias: num("meias"), naoPagantes: num("naoPag"),
    valorPorPessoa: num("vPessoa"), valorBuffet: num("vBuffet"), valorFinalContrato: num("vFinal"),
    valorVendaReal: num("vVenda"), custoVariavel: num("custo"), totalRecebido: num("recebido"),
    bartenderIncluido: $("bar").checked, observacao: txt("obs"),
    cerimonialistaNome: txt("cerNome"), cerimonialistaTelefone: txt("cerTel"),
    organizadorNome: txt("orgNome"), organizadorTelefone: txt("orgTel"),
    djNome: txt("djNome"), djTelefone: txt("djTel")
  };

  const r = await fetch("/api/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  if (!r.ok) { alert("Erro ao salvar o evento. Confira os campos e tente de novo."); return; }

  // limpa o formulário
  document.querySelectorAll("#novo input:not(#novoTipo), #novo textarea").forEach(i => {
    if (i.type === "checkbox") i.checked = false; else i.value = "";
  });
  $("tot").textContent = "Total: 0";

  // mostra o mês do evento na agenda
  const [ano, mes] = dados.dataEvento.split("-");
  if ([...$("ano").options].some(o => o.value === ano)) $("ano").value = ano;
  $("mes").value = +mes - 1;
  await carregarMes();
  tab("agenda");
};

// ---------- Relatório ----------
async function relatorio() {
  const ano = $("anoRel").value;
  const meses = await Promise.all(
    Array.from({ length: 12 }, (_, i) => fetch(`/api/eventos?mes=${i + 1}&ano=${ano}`).then(r => r.json()))
  );
  const lista = meses.flat();
  let tv = 0, tc = 0;
  const linhas = lista.map(e => {
    const v = Number(e.valorVendaReal || 0), c = Number(e.custoVariavel || 0);
    tv += v; tc += c;
    const [a, m, d] = e.dataEvento.split("-");
    return `<tr><td>${d}/${m}/${a}</td><td>${esc(e.tipoEvento.nome)} – ${esc(nomeCli(e))}</td>
      <td class="r val">${R(v)}</td><td class="r val">${R(c)}</td><td class="r val">${R(v - c)}</td></tr>`;
  }).join("");
  $("tb").innerHTML = "<tr><th>Data</th><th>Evento</th><th class='r'>Venda</th><th class='r'>Custo</th><th class='r'>Diferença</th></tr>" +
    (linhas || "<tr><td colspan='5'>Nenhum evento neste ano.</td></tr>") +
    `<tr><th colspan="2">Total</th><th class="r val">${R(tv)}</th><th class="r val">${R(tc)}</th><th class="r val">${R(tv - tc)}</th></tr>`;
}
$("anoRel").onchange = relatorio;

// ---------- Início ----------
carregarTipos();
carregarMes();