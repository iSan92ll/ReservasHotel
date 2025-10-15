package io.bootify.reservas_hotel.events;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class BeforeDeleteHabitacion {

    private Long idHabitacion;

}
