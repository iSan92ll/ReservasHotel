package io.bootify.reservas_hotel.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class HabitacionDTO {

    private Long idHabitacion;

    @NotNull
    @Size(max = 10)
    private String numeroHabitacion;

    @NotNull
    private Integer capacidadHabitacion;

    @NotNull
    @Digits(integer = 10, fraction = 2)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal precioHabitacion;

    @NotNull
    private TipoHabitacion tipoHabitacion;

    @NotNull
    private EstadoHabitacion estadoHabitacion;

}
