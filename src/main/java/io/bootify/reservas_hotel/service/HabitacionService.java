package io.bootify.reservas_hotel.service;

import io.bootify.reservas_hotel.domain.Habitacion;
import io.bootify.reservas_hotel.events.BeforeDeleteHabitacion;
import io.bootify.reservas_hotel.model.HabitacionDTO;
import io.bootify.reservas_hotel.repos.HabitacionRepository;
import io.bootify.reservas_hotel.util.NotFoundException;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final ApplicationEventPublisher publisher;

    public HabitacionService(final HabitacionRepository habitacionRepository,
            final ApplicationEventPublisher publisher) {
        this.habitacionRepository = habitacionRepository;
        this.publisher = publisher;
    }

    public List<HabitacionDTO> findAll() {
        final List<Habitacion> habitacions = habitacionRepository.findAll(Sort.by("idHabitacion"));
        return habitacions.stream()
                .map(habitacion -> mapToDTO(habitacion, new HabitacionDTO()))
                .toList();
    }

    public HabitacionDTO get(final Long idHabitacion) {
        return habitacionRepository.findById(idHabitacion)
                .map(habitacion -> mapToDTO(habitacion, new HabitacionDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final HabitacionDTO habitacionDTO) {
        final Habitacion habitacion = new Habitacion();
        mapToEntity(habitacionDTO, habitacion);
        return habitacionRepository.save(habitacion).getIdHabitacion();
    }

    public void update(final Long idHabitacion, final HabitacionDTO habitacionDTO) {
        final Habitacion habitacion = habitacionRepository.findById(idHabitacion)
                .orElseThrow(NotFoundException::new);
        mapToEntity(habitacionDTO, habitacion);
        habitacionRepository.save(habitacion);
    }

    public void delete(final Long idHabitacion) {
        final Habitacion habitacion = habitacionRepository.findById(idHabitacion)
                .orElseThrow(NotFoundException::new);
        publisher.publishEvent(new BeforeDeleteHabitacion(idHabitacion));
        habitacionRepository.delete(habitacion);
    }

    private HabitacionDTO mapToDTO(final Habitacion habitacion, final HabitacionDTO habitacionDTO) {
        habitacionDTO.setIdHabitacion(habitacion.getIdHabitacion());
        habitacionDTO.setNumeroHabitacion(habitacion.getNumeroHabitacion());
        habitacionDTO.setCapacidadHabitacion(habitacion.getCapacidadHabitacion());
        habitacionDTO.setPrecioHabitacion(habitacion.getPrecioHabitacion());
        habitacionDTO.setTipoHabitacion(habitacion.getTipoHabitacion());
        habitacionDTO.setEstadoHabitacion(habitacion.getEstadoHabitacion());
        return habitacionDTO;
    }

    private Habitacion mapToEntity(final HabitacionDTO habitacionDTO, final Habitacion habitacion) {
        habitacion.setNumeroHabitacion(habitacionDTO.getNumeroHabitacion());
        habitacion.setCapacidadHabitacion(habitacionDTO.getCapacidadHabitacion());
        habitacion.setPrecioHabitacion(habitacionDTO.getPrecioHabitacion());
        habitacion.setTipoHabitacion(habitacionDTO.getTipoHabitacion());
        habitacion.setEstadoHabitacion(habitacionDTO.getEstadoHabitacion());
        return habitacion;
    }

}
