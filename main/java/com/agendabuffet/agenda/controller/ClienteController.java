package com.agendabuffet.agenda.controller;

import com.agendabuffet.agenda.model.Cliente;
import com.agendabuffet.agenda.repository.ClienteRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cliente> buscar(@RequestParam(defaultValue = "") String busca) {
        String q = busca.trim();
        if (q.length() < 2) return List.of();
        return repo.buscar(q, PageRequest.of(0, 8));
    }
}
