package com.agendabuffet.agenda.repository;

import com.agendabuffet.agenda.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByDataEventoBetweenOrderByDataEventoAscHoraInicioAsc(LocalDate inicio, LocalDate fim);
}
