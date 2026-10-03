package com.agendabuffet.agenda.repository;

import com.agendabuffet.agenda.model.TipoEvento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoEventoRepository extends JpaRepository<TipoEvento, Long> {
}