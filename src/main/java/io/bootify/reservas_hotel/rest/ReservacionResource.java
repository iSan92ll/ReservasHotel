package io.bootify.reservas_hotel.rest;

import io.bootify.reservas_hotel.model.ReservacionDTO;
import io.bootify.reservas_hotel.service.ReservacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/reservaciones")
public class ReservacionResource {

    private final ReservacionService reservacionService;

    public ReservacionResource(final ReservacionService reservacionService) {
        this.reservacionService = reservacionService;
    }

    @GetMapping
    public ResponseEntity<List<ReservacionDTO>> getAllReservaciones() {
        return ResponseEntity.ok(reservacionService.findAll());
    }

    @GetMapping("/{idReserva}")
    public ResponseEntity<ReservacionDTO> getReservacion(
            @PathVariable(name = "idReserva") final Long idReserva) {
        return ResponseEntity.ok(reservacionService.get(idReserva));
    }

    @PostMapping
    public ResponseEntity<Long> createReservacion(
            @RequestBody @Valid final ReservacionDTO reservacionDTO) {
        final Long createdIdReserva = reservacionService.create(reservacionDTO);
        return new ResponseEntity<>(createdIdReserva, HttpStatus.CREATED);
    }

    @PutMapping("/{idReserva}")
    public ResponseEntity<Long> updateReservacion(
            @PathVariable(name = "idReserva") final Long idReserva,
            @RequestBody @Valid final ReservacionDTO reservacionDTO) {
        reservacionService.update(idReserva, reservacionDTO);
        return ResponseEntity.ok(idReserva);
    }

    @DeleteMapping("/{idReserva}")
    public ResponseEntity<Void> deleteReservacion(
            @PathVariable(name = "idReserva") final Long idReserva) {
        reservacionService.delete(idReserva);
        return ResponseEntity.noContent().build();
    }

}
