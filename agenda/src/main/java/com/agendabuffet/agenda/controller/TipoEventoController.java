package com.agendabuffet.agenda.controller;

import com.agendabuffet.agenda.model.TipoEvento;
import com.agendabuffet.agenda.repository.TipoEventoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-evento")
public class TipoEventoController {

    private final TipoEventoRepository repo;

    public TipoEventoController(TipoEventoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<TipoEvento> listar() {
        return repo.findAll();
    }
}