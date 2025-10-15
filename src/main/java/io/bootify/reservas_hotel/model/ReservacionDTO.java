package io.bootify.reservas_hotel.model;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ReservacionDTO {

    private Long idReserva;

    @NotNull
    private LocalDateTime inicioReserva;

    @NotNull
    private LocalDateTime finReserva;

    @NotNull
    private EstadoReserva estadoReserva;

    @NotNull
    private Long usuario;

    @NotNull
    private Long habitacion;

}
