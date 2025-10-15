package io.bootify.reservas_hotel.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UsuarioDTO {

    private Long idUsuario;

    @NotNull
    @Size(max = 255)
    private String nombreUsuario;

    @NotNull
    @Size(max = 255)
    private String apellidoUsuario;

    @NotNull
    @Size(max = 20)
    private String numeroUsuario;

    @NotNull
    @Size(max = 255)
    @UsuarioEmailUsuarioUnique
    private String emailUsuario;

    @NotNull
    @Size(max = 20)
    private String rolUsuario;

    @NotNull
    private String contraUsuario;

}
