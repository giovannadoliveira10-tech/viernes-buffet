(function () {
  const novo = $("novo");

  // campos escondidos que guardam qual cliente foi escolhido
  ["c1id", "c2id", "c1novo", "c2novo"].forEach(id => {
    const i = document.createElement("input");
    i.type = "hidden"; i.id = id;
    novo.appendChild(i);
  });

  const h3 = [...novo.querySelectorAll("h3")].find(h => h.textContent.trim() === "Clientes");
  const bloco = document.createElement("div");
  bloco.innerHTML = `
    <div class="grid" style="margin-bottom:8px">
      <label><span>Buscar cliente já cadastrado (nome ou telefone)</span>
        <input id="buscaCli" autocomplete="off" placeholder="Digite pelo menos 2 letras"></label>
    </div>
    <div id="resBusca"></div>
    <div id="vinculo" style="margin-bottom:10px"></div>`;
  h3.after(bloco);

  function vinculos() {
    const partes = [1, 2].map(n => {
      if ($("c" + n + "id").value)
        return `Cliente ${n}: cadastro existente nº ${$("c" + n + "id").value} <button type="button" class="mini" data-novo="${n}">Cadastrar como novo cliente</button>`;
      if ($("c" + n + "novo").value === "1")
        return `Cliente ${n}: será salvo como novo cadastro`;
      return "";
    }).filter(Boolean);
    $("vinculo").innerHTML = partes.length
      ? partes.join(" &nbsp;·&nbsp; ") + `<div class="note">Alterar os dados de um cliente já cadastrado atualiza o cadastro em todos os eventos dele.</div>`
      : "";
  }

  // ---------- busca ----------
  let achados = [], timer;
  $("buscaCli").addEventListener("input", () => {
    clearTimeout(timer);
    const q = $("buscaCli").value.trim();
    if (q.length < 2) { $("resBusca").innerHTML = ""; return; }
    timer = setTimeout(async () => {
      const r = await fetch("/api/clientes?busca=" + encodeURIComponent(q));
      if (!r.ok) return;
      achados = await r.json();
      $("resBusca").innerHTML = achados.length
        ? achados.map((c, i) => `<div class="ev"><b>${esc(c.nome)} ${esc(c.sobrenome)}</b> · ${esc(c.telefone1)} ${c.email ? "· " + esc(c.email) : ""}
            <div class="acoes">
              <button type="button" class="mini" data-usar="1" data-i="${i}">Usar como cliente 1</button>
              <button type="button" class="mini" data-usar="2" data-i="${i}">Usar como cliente 2</button>
            </div></div>`).join("")
        : `<div class="note">Nenhum cliente encontrado.</div>`;
    }, 250);
  });

  $("resBusca").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-usar]");
    if (!b) return;
    const c = achados[+b.dataset.i], n = b.dataset.usar;
    if (n === "1") {
      setv("c1nome", c.nome); setv("c1sobrenome", c.sobrenome); setv("c1email", c.email);
      setv("tel1", c.telefone1); setv("tel2", c.telefone2);
    } else {
      setv("c2nome", c.nome); setv("c2sobrenome", c.sobrenome); setv("c2email", c.email);
    }
    $("c" + n + "id").value = c.id;
    $("c" + n + "novo").value = "";
    $("buscaCli").value = "";
    $("resBusca").innerHTML = "";
    vinculos();
  });

  $("vinculo").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-novo]");
    if (!b) return;
    const n = b.dataset.novo;
    $("c" + n + "id").value = "";
    $("c" + n + "novo").value = "1";
    vinculos();
  });

  // ao limpar, zera os vínculos; ao editar, mostra os vínculos do evento
  const limparOriginal = limpar;
  limpar = function () { limparOriginal(); $("resBusca").innerHTML = ""; vinculos(); };

  const editarOriginal = editar;
  editar = function (e) {
    editarOriginal(e);
    $("c1id").value = e.cliente1.id;
    $("c2id").value = e.cliente2 ? e.cliente2.id : "";
    vinculos();
  };
})();