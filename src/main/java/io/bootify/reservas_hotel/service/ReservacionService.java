package io.bootify.reservas_hotel.service;

import io.bootify.reservas_hotel.domain.Habitacion;
import io.bootify.reservas_hotel.domain.Reservacion;
import io.bootify.reservas_hotel.domain.Usuario;
import io.bootify.reservas_hotel.events.BeforeDeleteHabitacion;
import io.bootify.reservas_hotel.events.BeforeDeleteUsuario;
import io.bootify.reservas_hotel.model.ReservacionDTO;
import io.bootify.reservas_hotel.repos.HabitacionRepository;
import io.bootify.reservas_hotel.repos.ReservacionRepository;
import io.bootify.reservas_hotel.repos.UsuarioRepository;
import io.bootify.reservas_hotel.util.NotFoundException;
import io.bootify.reservas_hotel.util.ReferencedException;
import java.util.List;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class ReservacionService {

    private final ReservacionRepository reservacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final HabitacionRepository habitacionRepository;

    public ReservacionService(final ReservacionRepository reservacionRepository,
            final UsuarioRepository usuarioRepository,
            final HabitacionRepository habitacionRepository) {
        this.reservacionRepository = reservacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.habitacionRepository = habitacionRepository;
    }

    public List<ReservacionDTO> findAll() {
        final List<Reservacion> reservacions = reservacionRepository.findAll(Sort.by("idReserva"));
        return reservacions.stream()
                .map(reservacion -> mapToDTO(reservacion, new ReservacionDTO()))
                .toList();
    }

    public ReservacionDTO get(final Long idReserva) {
        return reservacionRepository.findById(idReserva)
                .map(reservacion -> mapToDTO(reservacion, new ReservacionDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final ReservacionDTO reservacionDTO) {
        final Reservacion reservacion = new Reservacion();
        mapToEntity(reservacionDTO, reservacion);
        return reservacionRepository.save(reservacion).getIdReserva();
    }

    public void update(final Long idReserva, final ReservacionDTO reservacionDTO) {
        final Reservacion reservacion = reservacionRepository.findById(idReserva)
                .orElseThrow(NotFoundException::new);
        mapToEntity(reservacionDTO, reservacion);
        reservacionRepository.save(reservacion);
    }

    public void delete(final Long idReserva) {
        final Reservacion reservacion = reservacionRepository.findById(idReserva)
                .orElseThrow(NotFoundException::new);
        reservacionRepository.delete(reservacion);
    }

    private ReservacionDTO mapToDTO(final Reservacion reservacion,
            final ReservacionDTO reservacionDTO) {
        reservacionDTO.setIdReserva(reservacion.getIdReserva());
        reservacionDTO.setInicioReserva(reservacion.getInicioReserva());
        reservacionDTO.setFinReserva(reservacion.getFinReserva());
        reservacionDTO.setEstadoReserva(reservacion.getEstadoReserva());
        reservacionDTO.setUsuario(reservacion.getUsuario() == null ? null : reservacion.getUsuario().getIdUsuario());
        reservacionDTO.setHabitacion(reservacion.getHabitacion() == null ? null : reservacion.getHabitacion().getIdHabitacion());
        return reservacionDTO;
    }

    private Reservacion mapToEntity(final ReservacionDTO reservacionDTO,
            final Reservacion reservacion) {
        reservacion.setInicioReserva(reservacionDTO.getInicioReserva());
        reservacion.setFinReserva(reservacionDTO.getFinReserva());
        reservacion.setEstadoReserva(reservacionDTO.getEstadoReserva());
        final Usuario usuario = reservacionDTO.getUsuario() == null ? null : usuarioRepository.findById(reservacionDTO.getUsuario())
                .orElseThrow(() -> new NotFoundException("usuario not found"));
        reservacion.setUsuario(usuario);
        final Habitacion habitacion = reservacionDTO.getHabitacion() == null ? null : habitacionRepository.findById(reservacionDTO.getHabitacion())
                .orElseThrow(() -> new NotFoundException("habitacion not found"));
        reservacion.setHabitacion(habitacion);
        return reservacion;
    }

    @EventListener(BeforeDeleteUsuario.class)
    public void on(final BeforeDeleteUsuario event) {
        final ReferencedException referencedException = new ReferencedException();
        final Reservacion usuarioReservacion = reservacionRepository.findFirstByUsuarioIdUsuario(event.getIdUsuario());
        if (usuarioReservacion != null) {
            referencedException.setKey("usuario.reservacion.usuario.referenced");
            referencedException.addParam(usuarioReservacion.getIdReserva());
            throw referencedException;
        }
    }

    @EventListener(BeforeDeleteHabitacion.class)
    public void on(final BeforeDeleteHabitacion event) {
        final ReferencedException referencedException = new ReferencedException();
        final Reservacion habitacionReservacion = reservacionRepository.findFirstByHabitacionIdHabitacion(event.getIdHabitacion());
        if (habitacionReservacion != null) {
            referencedException.setKey("habitacion.reservacion.habitacion.referenced");
            referencedException.addParam(habitacionReservacion.getIdReserva());
            throw referencedException;
        }
    }

}
