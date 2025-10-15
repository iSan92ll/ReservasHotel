package io.bootify.reservas_hotel.repos;

import io.bootify.reservas_hotel.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmailUsuarioIgnoreCase(String emailUsuario);

}
