package com.agendabuffet.agenda.repository;

import com.agendabuffet.agenda.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}