package io.bootify.reservas_hotel.repos;

import io.bootify.reservas_hotel.domain.Reservacion;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReservacionRepository extends JpaRepository<Reservacion, Long> {

    Reservacion findFirstByUsuarioIdUsuario(Long idUsuario);

    Reservacion findFirstByHabitacionIdHabitacion(Long idHabitacion);

}
