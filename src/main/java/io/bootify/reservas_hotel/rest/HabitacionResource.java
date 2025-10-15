package io.bootify.reservas_hotel.rest;

import io.bootify.reservas_hotel.model.HabitacionDTO;
import io.bootify.reservas_hotel.service.HabitacionService;
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
@RequestMapping("/api/habitaciones")
public class HabitacionResource {

    private final HabitacionService habitacionService;

    public HabitacionResource(final HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @GetMapping
    public ResponseEntity<List<HabitacionDTO>> getAllHabitaciones() {
        return ResponseEntity.ok(habitacionService.findAll());
    }

    @GetMapping("/{idHabitacion}")
    public ResponseEntity<HabitacionDTO> getHabitacion(
            @PathVariable(name = "idHabitacion") final Long idHabitacion) {
        return ResponseEntity.ok(habitacionService.get(idHabitacion));
    }

    @PostMapping
    public ResponseEntity<Long> createHabitacion(
            @RequestBody @Valid final HabitacionDTO habitacionDTO) {
        final Long createdIdHabitacion = habitacionService.create(habitacionDTO);
        return new ResponseEntity<>(createdIdHabitacion, HttpStatus.CREATED);
    }

    @PutMapping("/{idHabitacion}")
    public ResponseEntity<Long> updateHabitacion(
            @PathVariable(name = "idHabitacion") final Long idHabitacion,
            @RequestBody @Valid final HabitacionDTO habitacionDTO) {
        habitacionService.update(idHabitacion, habitacionDTO);
        return ResponseEntity.ok(idHabitacion);
    }

    @DeleteMapping("/{idHabitacion}")
    public ResponseEntity<Void> deleteHabitacion(
            @PathVariable(name = "idHabitacion") final Long idHabitacion) {
        habitacionService.delete(idHabitacion);
        return ResponseEntity.noContent().build();
    }

}
