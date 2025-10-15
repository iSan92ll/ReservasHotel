package io.bootify.reservas_hotel.domain;

import io.bootify.reservas_hotel.model.EstadoHabitacion;
import io.bootify.reservas_hotel.model.TipoHabitacion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
public class Habitacion {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "primary_sequence",
            sequenceName = "primary_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "primary_sequence"
    )
    private Long idHabitacion;

    @Column(nullable = false, length = 10)
    private String numeroHabitacion;

    @Column(nullable = false)
    private Integer capacidadHabitacion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioHabitacion;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoHabitacion tipoHabitacion;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoHabitacion estadoHabitacion;

    @OneToMany(mappedBy = "habitacion")
    private Set<Reservacion> reservacion = new HashSet<>();

}
