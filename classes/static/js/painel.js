(function () {
  // ---------- cria a aba e a seção ----------
  const sec = document.createElement("section");
  sec.id = "inicio";
  sec.hidden = true;
  sec.innerHTML = `<h2>Início</h2><div id="pnKpis" class="kpis"></div><div id="pnListas"></div>`;
  document.querySelector("main.conteudo").prepend(sec);

  const btn = document.createElement("button");
  btn.setAttribute("role", "tab");
  btn.setAttribute("aria-selected", "false");
  btn.dataset.t = "inicio";
  btn.textContent = "Início";
  btn.onclick = () => tab("inicio");
  document.querySelector("nav").prepend(btn);

  // ---------- quem está logado ----------
  let restrito = false;
  const euPronto = fetch("/api/me")
    .then(r => r.ok ? r.json() : null)
    .then(eu => { restrito = !!eu && eu.perfil === "RESTRITO"; })
    .catch(() => {});

  // ---------- utilitários ----------
  const idx = s => { const [y, m, d] = s.split("-").map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };
  const iso = dt => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
  const quando = n => n === 0 ? "hoje" : n === 1 ? "amanhã" : n > 1 ? `em ${n} dias` : `há ${-n} dia${n === -1 ? "" : "s"}`;
  const porData = (a, b) => a.dataEvento.localeCompare(b.dataEvento) || (a.horaInicio || "").localeCompare(b.horaInicio || "");
  const MAX = 8;

  let lista = [];

  const kpi = (t, v, cls) => `<div class="kpi"><span>${t}</span><b${cls ? ` class="${cls}"` : ""}>${v}</b></div>`;
  const titulo = e => `<b>${esc(e.tipoEvento.nome)}</b> – ${esc(nomeCli(e))} <span class="tag ${ST[e.status].cls}">${ST[e.status].txt}</span>`;
  const ver = e => `<button class="mini" data-ver="${e.id}">Ver na agenda</button>`;
  const dataHora = e => fmtData(e.dataEvento) + (hora(e) ? " · " + hora(e) : "");

  const card = (nome, itens, fn, vazio) =>
    `<div class="card" style="margin-top:0"><h3 style="margin-top:0">${nome} (${itens.length})</h3>` +
    (itens.length
      ? itens.slice(0, MAX).map(fn).join("") + (itens.length > MAX ? `<div class="note">e mais ${itens.length - MAX}…</div>` : "")
      : `<div class="note">${vazio}</div>`) +
    `</div>`;

  // ---------- montagem do painel ----------
  async function painel() {
    await euPronto;
    const hoje = new Date();
    const hojeIdx = idx(iso(hoje));

    const pedidos = [];
    for (let o = -6; o <= 6; o++) {
      const t = new Date(hoje.getFullYear(), hoje.getMonth() + o, 1);
      pedidos.push(
        fetch(`/api/eventos?mes=${t.getMonth() + 1}&ano=${t.getFullYear()}`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      );
    }
    lista = (await Promise.all(pedidos)).flat();

    const falta = e => idx(e.dataEvento) - hojeIdx;
    const futuros = lista.filter(e => falta(e) >= 0).sort(porData);
    const proximos = futuros.filter(e => falta(e) <= 30);
    const orcamentos = futuros.filter(e => e.status === "ORCAMENTO");
    const semConf = futuros.filter(e => e.status === "FECHADO" && !e.dataConfirmacao);
    const receber = lista
      .filter(e => e.status !== "ORCAMENTO")
      .map(e => ({ e, pend: Number(e.valorFinalContrato || 0) - Number(e.totalRecebido || 0) }))
      .filter(x => x.pend > 0.005)
      .sort((a, b) => porData(a.e, b.e));
    const totalReceber = receber.reduce((s, x) => s + x.pend, 0);

    $("pnKpis").innerHTML =
      kpi("Eventos nos próximos 30 dias", proximos.length) +
      kpi("Orçamentos em aberto", orcamentos.length) +
      (restrito ? "" : kpi("A receber", R(totalReceber), "val")) +
      kpi("Fechados sem data de confirmação", semConf.length);

    const linhaSimples = e => `<div class="ev">${titulo(e)}<br>${dataHora(e)} · <b>${quando(falta(e))}</b>
      <div class="acoes">${ver(e)}${zap(e)}</div></div>`;

    const linhaOrc = e => {
      const urgente = falta(e) <= 15;
      return `<div class="ev">${titulo(e)}<br>${dataHora(e)} ·
        <b${urgente ? ' style="color:var(--r)"' : ""}>${quando(falta(e))}</b>${urgente ? " – sem resposta e perto da data" : ""}
        <div class="acoes">${ver(e)}${zap(e)}</div></div>`;
    };

    const linhaReceber = x => {
      const e = x.e, d = falta(e);
      return `<div class="ev">${titulo(e)}<br>${dataHora(e)} ·
        <b${d < 0 ? ' style="color:var(--r)"' : ""}>${d < 0 ? "evento já passou (" + quando(d) + ")" : quando(d)}</b><br>
        Contrato <span class="val">${R(e.valorFinalContrato)}</span> · recebido <span class="val">${R(e.totalRecebido)}</span> ·
        falta <b class="val">${R(x.pend)}</b>
        <div class="acoes">${ver(e)}${zap(e)}</div></div>`;
    };

    $("pnListas").innerHTML =
      `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(340px,1fr));align-items:start">` +
      card("Próximos eventos (30 dias)", proximos, linhaSimples, "Nenhum evento nos próximos 30 dias.") +
      card("Orçamentos em aberto", orcamentos, linhaOrc, "Nenhum orçamento pendente.") +
      (restrito ? "" : card("Valores a receber", receber, linhaReceber, "Tudo recebido.")) +
      card("Fechados sem data de confirmação", semConf, linhaSimples, "Todos os eventos fechados têm data de confirmação.") +
      `</div>`;
  }

  // "Ver na agenda": abre o mês do evento e seleciona o dia
  $("pnListas").onclick = async ev => {
    const b = ev.target.closest("button[data-ver]");
    if (!b) return;
    const e = lista.find(x => x.id == b.dataset.ver);
    if (!e) return;
    const [y, m, d] = e.dataEvento.split("-");
    if ([...$("ano").options].some(o => o.value === y)) $("ano").value = y;
    $("mes").value = +m - 1;
    await carregarMes();
    sel = +d;
    cal();
    det();
    tab("agenda");
  };

  // ---------- integra com o sistema de abas existente ----------
  const tabOriginal = tab;
  tab = function (t) {
    tabOriginal(t);
    $("inicio").hidden = t !== "inicio";
    if (t === "inicio") painel();
  };
})();