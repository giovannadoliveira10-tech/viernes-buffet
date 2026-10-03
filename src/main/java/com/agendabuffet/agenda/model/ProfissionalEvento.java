package com.agendabuffet.agenda.model;

import jakarta.persistence.*;

@Entity
@Table(name = "profissional_evento")
public class ProfissionalEvento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne @JoinColumn(name = "evento_id", nullable = false)
    public Evento evento;

    public String funcao;   // CERIMONIALISTA, ORGANIZADOR ou DJ
    public String nome;
    public String telefone;
}