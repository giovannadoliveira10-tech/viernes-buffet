package com.agendabuffet.agenda.controller;

import com.agendabuffet.agenda.model.*;
import com.agendabuffet.agenda.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoRepository eventos;
    private final ClienteRepository clientes;
    private final TipoEventoRepository tipos;
    private final ProfissionalEventoRepository profissionais;

    public EventoController(EventoRepository eventos, ClienteRepository clientes,
                            TipoEventoRepository tipos, ProfissionalEventoRepository profissionais) {
        this.eventos = eventos;
        this.clientes = clientes;
        this.tipos = tipos;
        this.profissionais = profissionais;
    }

    // mes de 1 a 12
    @GetMapping
    public List<Evento> listar(@RequestParam int mes, @RequestParam int ano) {
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return eventos.findByDataEventoBetweenOrderByDataEventoAscHoraInicioAsc(inicio, fim);
    }

    @PostMapping
    @Transactional
    public Evento criar(@RequestBody EventoRequest r) {
        if (r.cliente1Nome() == null || r.cliente1Nome().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do cliente 1");
        if (r.dataEvento() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a data do evento");
        if (r.tipoEventoId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o tipo de evento");

        Cliente c1 = new Cliente();
        c1.nome = r.cliente1Nome();
        c1.sobrenome = r.cliente1Sobrenome();
        c1.email = r.cliente1Email();
        c1.telefone1 = r.telefone1();
        c1.telefone2 = r.telefone2();
        clientes.save(c1);

        Cliente c2 = null;
        if (r.cliente2Nome() != null && !r.cliente2Nome().isBlank()) {
            c2 = new Cliente();
            c2.nome = r.cliente2Nome();
            c2.sobrenome = r.cliente2Sobrenome();
            c2.email = r.cliente2Email();
            clientes.save(c2);
        }

        Evento e = new Evento();
        e.cliente1 = c1;
        e.cliente2 = c2;
        e.tipoEvento = tipos.findById(r.tipoEventoId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de evento inválido"));
        e.status = (r.status() == null || r.status().isBlank()) ? "ORCAMENTO" : r.status();
        e.dataAtendimento = r.dataAtendimento();
        e.dataConfirmacao = r.dataConfirmacao();
        e.dataEvento = r.dataEvento();
        e.horaInicio = r.horaInicio();
        e.horaFim = r.horaFim();
        e.convidadosPrevistos = r.convidadosPrevistos();
        e.convidadosCompareceram = r.convidadosCompareceram();
        e.pagantesInteiros = r.pagantesInteiros();
        e.pagantesMeias = r.pagantesMeias();
        e.naoPagantes = r.naoPagantes();
        e.valorPorPessoa = r.valorPorPessoa();
        e.valorBuffet = r.valorBuffet();
        e.valorFinalContrato = r.valorFinalContrato();
        e.valorVendaReal = r.valorVendaReal();
        e.custoVariavel = r.custoVariavel();
        e.totalRecebido = r.totalRecebido();
        e.bartenderIncluido = r.bartenderIncluido();
        e.observacao = r.observacao();
        eventos.save(e);

        salvarProfissional(e, "CERIMONIALISTA", r.cerimonialistaNome(), r.cerimonialistaTelefone());
        salvarProfissional(e, "ORGANIZADOR", r.organizadorNome(), r.organizadorTelefone());
        salvarProfissional(e, "DJ", r.djNome(), r.djTelefone());
        return e;
    }

    private void salvarProfissional(Evento e, String funcao, String nome, String telefone) {
        if (nome == null || nome.isBlank()) return;
        ProfissionalEvento p = new ProfissionalEvento();
        p.evento = e;
        p.funcao = funcao;
        p.nome = nome;
        p.telefone = telefone;
        profissionais.save(p);
    }
}