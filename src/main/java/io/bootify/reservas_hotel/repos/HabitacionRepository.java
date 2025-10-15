package io.bootify.reservas_hotel.repos;

import io.bootify.reservas_hotel.domain.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;


public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
}
