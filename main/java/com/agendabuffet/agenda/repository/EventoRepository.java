package com.agendabuffet.agenda.repository;

import com.agendabuffet.agenda.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByDataEventoBetweenOrderByDataEventoAscHoraInicioAsc(LocalDate inicio, LocalDate fim);

    long countByTipoEventoId(Long tipoId);

    @Query("select e.tipoEvento.id, count(e) from Evento e group by e.tipoEvento.id")
    List<Object[]> contarPorTipo();
}
