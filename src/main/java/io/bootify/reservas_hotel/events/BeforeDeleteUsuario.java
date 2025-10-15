package io.bootify.reservas_hotel.events;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class BeforeDeleteUsuario {

    private Long idUsuario;

}
